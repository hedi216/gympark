using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using GymPlatform.Domain.Entities;
using GymPlatform.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace GymPlatform.Api.Auth;

public static class Policies
{
    public const string Admin = "RequireAdmin";
    public const string Staff = "RequireStaff";
    public const string Member = "RequireMember";
    public const string Ready = "PasswordChanged";
}
public record TokenSettings(byte[] Key, bool Secure, string[] Origins);
public static class AuthSetup
{
    public const string CookieName = "gympark_access";
    public static Guid UserId(this ClaimsPrincipal principal) => Guid.Parse(principal.FindFirstValue(ClaimTypes.NameIdentifier)!);
    public static Guid OwnMemberId(this ClaimsPrincipal principal) => Guid.Parse(principal.FindFirstValue("memberId")!);
    public static void AddGymAuthentication(this WebApplicationBuilder builder)
    {
        var secret = builder.Configuration["GYMPARK_JWT_KEY"] ?? builder.Configuration["Auth:SigningKey"];
        if (!builder.Environment.IsDevelopment() && !builder.Environment.IsEnvironment("Testing") && (secret is null || Encoding.UTF8.GetByteCount(secret) < 32))
            throw new InvalidOperationException("Set GYMPARK_JWT_KEY to a random secret of at least 32 bytes.");
        if (secret is not null && Encoding.UTF8.GetByteCount(secret) < 32) throw new InvalidOperationException("JWT signing key is too short.");
        var key = secret is null ? RandomNumberGenerator.GetBytes(64) : Encoding.UTF8.GetBytes(secret);
        var origins = builder.Configuration.GetSection("Frontend:Origins").Get<string[]>() ?? ["http://localhost:5180", "http://localhost:5181", "http://localhost:5182"];
        builder.Services.AddSingleton(new TokenSettings(key, !builder.Environment.IsDevelopment() && !builder.Environment.IsEnvironment("Testing"), origins));
        builder.Services.AddScoped<IPasswordHasher<UserAccount>, PasswordHasher<UserAccount>>();
        builder.Services.Configure<PasswordHasherOptions>(options => options.IterationCount = 210_000);
        builder.Services.AddScoped<AuthService>();
        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
        {
            options.MapInboundClaims = false;
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true, ValidIssuer = "GymPark", ValidateAudience = true, ValidAudience = "GymParkApps",
                ValidateLifetime = true, ClockSkew = TimeSpan.FromSeconds(10), ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key), NameClaimType = ClaimTypes.NameIdentifier, RoleClaimType = ClaimTypes.Role,
                ValidAlgorithms = [SecurityAlgorithms.HmacSha256]
            };
            options.Events = new JwtBearerEvents
            {
                OnMessageReceived = context => { context.Token = context.Request.Cookies[CookieName]; return Task.CompletedTask; },
                OnTokenValidated = async context =>
                {
                    var db = context.HttpContext.RequestServices.GetRequiredService<GymDbContext>();
                    if (!Guid.TryParse(context.Principal?.FindFirstValue(JwtRegisteredClaimNames.Jti), out var id)) { context.Fail("Session invalid."); return; }
                    var session = await db.AuthSessions.Include(s => s.UserAccount).ThenInclude(a => a.Member).SingleOrDefaultAsync(s => s.Id == id);
                    if (session is null || session.RevokedAt != null || session.ExpiresAt <= DateTime.UtcNow || !session.UserAccount.IsActive || session.Version != session.UserAccount.SessionVersion || session.UserAccount.Member?.IsSuspended == true)
                    { context.Fail("Session revoked or expired."); return; }
                    // Build authorization claims from current database state, never stale token role claims.
                    context.Principal = new ClaimsPrincipal(new ClaimsIdentity(AuthService.Claims(session.UserAccount, session.Id), JwtBearerDefaults.AuthenticationScheme, ClaimTypes.NameIdentifier, ClaimTypes.Role));
                }
            };
        });
        builder.Services.AddAuthorization(options =>
        {
            options.AddPolicy(Policies.Ready, p => p.RequireAuthenticatedUser().RequireClaim("passwordReady", "true"));
            options.AddPolicy(Policies.Admin, p => p.RequireAuthenticatedUser().RequireClaim("passwordReady", "true").RequireRole(AccountRoles.Admin));
            options.AddPolicy(Policies.Staff, p => p.RequireAuthenticatedUser().RequireClaim("passwordReady", "true").RequireRole(AccountRoles.Admin, AccountRoles.Employee));
            options.AddPolicy(Policies.Member, p => p.RequireAuthenticatedUser().RequireClaim("passwordReady", "true").RequireRole(AccountRoles.Member));
        });
        builder.Services.AddCors(options => options.AddPolicy("Frontend", p => p.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod().AllowCredentials()));
    }
}
