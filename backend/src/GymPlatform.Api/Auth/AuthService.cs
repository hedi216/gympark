using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using GymPlatform.Api.Contracts;
using GymPlatform.Api.Services;
using GymPlatform.Domain.Entities;
using GymPlatform.Infrastructure;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace GymPlatform.Api.Auth;

public class AuthService(GymDbContext db, IPasswordHasher<UserAccount> hasher, TokenSettings settings)
{
    public static string Normalize(string email) => email.Trim().ToUpperInvariant();
    public static string TemporaryPassword() => "Gp-7" + Convert.ToHexString(RandomNumberGenerator.GetBytes(12));
    public static void ValidatePassword(string password)
    {
        if (password.Length is < 12 or > 128 || !password.Any(char.IsUpper) || !password.Any(char.IsLower) || !password.Any(char.IsDigit) || !password.Any(c => !char.IsLetterOrDigit(c)))
            throw new ApiException(400, "Utilisez 12 à 128 caractères avec majuscule, minuscule, chiffre et symbole.", "password_policy");
    }
    public static IEnumerable<Claim> Claims(UserAccount a, Guid sessionId)
    {
        var claims = new List<Claim> { new(ClaimTypes.NameIdentifier, a.Id.ToString()), new(ClaimTypes.Email, a.Email), new(ClaimTypes.Role, a.Role), new("passwordReady", a.MustChangePassword ? "false" : "true"), new(JwtRegisteredClaimNames.Jti, sessionId.ToString()) };
        if (a.MemberId.HasValue) claims.Add(new("memberId", a.MemberId.Value.ToString()));
        return claims;
    }
    public static AuthUserDto UserDto(UserAccount a) => new(a.Id, a.Email, a.Role, a.MustChangePassword, a.MemberId, a.Member?.FirstName ?? a.StaffUser?.FirstName ?? "", a.Member?.LastName ?? a.StaffUser?.LastName ?? "");
    public async Task<UserAccount> Current(Guid id) => await db.UserAccounts.Include(a => a.Member).Include(a => a.StaffUser).SingleOrDefaultAsync(a => a.Id == id) ?? throw new ApiException(401, "Session expirée.");
    public async Task<AuthUserDto> Login(LoginRequest input, HttpResponse response)
    {
        var account = await db.UserAccounts.Include(a => a.Member).Include(a => a.StaffUser).SingleOrDefaultAsync(a => a.NormalizedEmail == Normalize(input.Email));
        if (account is null) { hasher.HashPassword(new UserAccount(), input.Password); throw new ApiException(401, "Email ou mot de passe incorrect."); }
        if (account.LockedUntil > DateTime.UtcNow) throw new ApiException(429, "Trop de tentatives. Réessayez dans 15 minutes.");
        if (!account.IsActive || account.Member?.IsSuspended == true || hasher.VerifyHashedPassword(account, account.PasswordHash, input.Password) == PasswordVerificationResult.Failed)
        {
            account.FailedLoginAttempts++;
            if (account.FailedLoginAttempts >= 5) { account.LockedUntil = DateTime.UtcNow.AddMinutes(15); account.FailedLoginAttempts = 0; }
            await db.SaveChangesAsync(); throw new ApiException(401, "Email ou mot de passe incorrect.");
        }
        account.FailedLoginAttempts = 0; account.LockedUntil = null; account.LastLoginAt = DateTime.UtcNow;
        await Issue(account, response);
        return UserDto(account);
    }
    public async Task Issue(UserAccount account, HttpResponse response)
    {
        var session = new AuthSession { UserAccountId = account.Id, Version = account.SessionVersion, ExpiresAt = DateTime.UtcNow.AddHours(1) };
        db.AuthSessions.Add(session); await db.SaveChangesAsync();
        var token = new JwtSecurityToken("GymPark", "GymParkApps", Claims(account, session.Id), expires: session.ExpiresAt, signingCredentials: new SigningCredentials(new SymmetricSecurityKey(settings.Key), SecurityAlgorithms.HmacSha256));
        response.Cookies.Append(AuthSetup.CookieName, new JwtSecurityTokenHandler().WriteToken(token), CookieOptions(session.ExpiresAt));
        response.Headers.CacheControl = "no-store";
    }
    private CookieOptions CookieOptions(DateTime? expires = null) => new() { HttpOnly = true, Secure = settings.Secure, SameSite = SameSiteMode.Lax, Path = "/api", Expires = expires, IsEssential = true };
    public async Task<AuthUserDto> Change(Guid userId, ChangePasswordRequest input, HttpResponse response)
    {
        var a = await Current(userId);
        if (hasher.VerifyHashedPassword(a, a.PasswordHash, input.CurrentPassword) == PasswordVerificationResult.Failed) throw new ApiException(400, "Le mot de passe actuel est incorrect.");
        if (input.NewPassword != input.ConfirmPassword) throw new ApiException(400, "Les nouveaux mots de passe ne correspondent pas.");
        ValidatePassword(input.NewPassword);
        if (input.CurrentPassword == input.NewPassword) throw new ApiException(400, "Choisissez un mot de passe différent.");
        a.PasswordHash = hasher.HashPassword(a, input.NewPassword); a.MustChangePassword = false; a.SessionVersion++; a.UpdatedAt = DateTime.UtcNow; a.FailedLoginAttempts = 0; a.LockedUntil = null;
        await Issue(a, response); return UserDto(a);
    }
    public async Task Logout(ClaimsPrincipal principal, HttpResponse response)
    {
        if (Guid.TryParse(principal.FindFirstValue(JwtRegisteredClaimNames.Jti), out var id))
            await db.AuthSessions.Where(s => s.Id == id).ExecuteUpdateAsync(s => s.SetProperty(x => x.RevokedAt, DateTime.UtcNow));
        response.Cookies.Delete(AuthSetup.CookieName, CookieOptions());
    }
}
