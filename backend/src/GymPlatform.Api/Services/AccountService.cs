using GymPlatform.Api.Auth;
using GymPlatform.Api.Contracts;
using GymPlatform.Domain;
using GymPlatform.Domain.Entities;
using GymPlatform.Infrastructure;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace GymPlatform.Api.Services;

public class AccountService(GymDbContext db, IPasswordHasher<UserAccount> hasher)
{
    private IQueryable<UserAccount> Accounts => db.UserAccounts.Include(a => a.Member).Include(a => a.StaffUser);
    public static AccountDto Dto(UserAccount a) => new(a.Id, a.Email, a.Role, a.IsActive, a.MustChangePassword, a.MemberId, a.Member?.MemberNumber,
        a.Member?.FirstName ?? a.StaffUser?.FirstName ?? "", a.Member?.LastName ?? a.StaffUser?.LastName ?? "", a.Member?.Phone, a.CreatedAt, a.LastLoginAt);
    public async Task<PageDto<AccountDto>> List(string role, string? search, bool? active, int page, int pageSize)
    {
        page = Math.Max(page, 1); pageSize = Math.Clamp(pageSize, 1, 100);
        var query = Accounts.Where(a => a.Role == role);
        if (active.HasValue) query = query.Where(a => a.IsActive == active.Value);
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToUpperInvariant();
            query = query.Where(a => a.NormalizedEmail.Contains(term) || (a.Member != null && (a.Member.FirstName.ToUpper().Contains(term) || a.Member.LastName.ToUpper().Contains(term) || a.Member.MemberNumber.Contains(term))) || (a.StaffUser != null && (a.StaffUser.FirstName.ToUpper().Contains(term) || a.StaffUser.LastName.ToUpper().Contains(term))));
        }
        var total = await query.CountAsync();
        var rows = await query.OrderByDescending(a => a.CreatedAt).ThenBy(a => a.Id).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        return new(rows.Select(Dto).ToList(), total, page, pageSize);
    }
    public async Task<UserAccount> Find(Guid id, string role) => await Accounts.SingleOrDefaultAsync(a => a.Id == id && a.Role == role) ?? throw new ApiException(404, "Compte introuvable.");
    public async Task<ProvisionedAccountDto> Create(CreateAccountRequest input, string role, Guid? creator)
    {
        var normalized = AuthService.Normalize(input.Email);
        if (await db.UserAccounts.AnyAsync(a => a.NormalizedEmail == normalized)) throw new ApiException(409, "Cet email est déjà utilisé.");
        var account = new UserAccount { Email = input.Email.Trim(), NormalizedEmail = normalized, Role = role, CreatedByUserId = creator };
        if (role == AccountRoles.Member)
        {
            var member = new Member { FirstName = input.FirstName?.Trim() ?? "", LastName = input.LastName?.Trim() ?? "", Phone = input.Phone?.Trim() ?? "", Email = account.Email, MemberNumber = "GP-" + Guid.NewGuid().ToString("N").ToUpperInvariant(), ReferralCode = Guid.NewGuid().ToString("N") };
            account.Member = member; account.MemberId = member.Id;
        }
        else
        {
            var staff = new StaffUser { FirstName = input.FirstName?.Trim() ?? "", LastName = input.LastName?.Trim() ?? "", Email = account.Email, Role = role == AccountRoles.Admin ? StaffRole.SuperAdmin : StaffRole.Reception };
            account.StaffUser = staff; account.StaffUserId = staff.Id;
        }
        var temporary = AuthService.TemporaryPassword();
        account.PasswordHash = hasher.HashPassword(account, temporary);
        db.UserAccounts.Add(account); await db.SaveChangesAsync();
        return new(Dto(account), temporary);
    }
    public async Task<AccountDto> Edit(Guid id, string role, EditProfileRequest input, Guid actor)
    {
        var a = await Find(id, role); var normalized = AuthService.Normalize(input.Email);
        if (await db.UserAccounts.AnyAsync(u => u.Id != id && u.NormalizedEmail == normalized)) throw new ApiException(409, "Cet email est déjà utilisé.");
        if (a.NormalizedEmail != normalized) a.SessionVersion++;
        a.Email = input.Email.Trim(); a.NormalizedEmail = normalized; a.UpdatedAt = DateTime.UtcNow; a.UpdatedByUserId = actor;
        if (a.Member is { } member) { member.Email = a.Email; member.FirstName = input.FirstName?.Trim() ?? ""; member.LastName = input.LastName?.Trim() ?? ""; member.Phone = input.Phone?.Trim() ?? ""; member.UpdatedAt = DateTime.UtcNow; }
        if (a.StaffUser is { } staff) { staff.Email = a.Email; staff.FirstName = input.FirstName?.Trim() ?? ""; staff.LastName = input.LastName?.Trim() ?? ""; staff.UpdatedAt = DateTime.UtcNow; }
        await db.SaveChangesAsync(); return Dto(a);
    }
    public async Task<AccountDto> SetActive(Guid id, string role, bool active, Guid actor)
    {
        var a = await Find(id, role); a.IsActive = active; a.SessionVersion++; a.UpdatedAt = DateTime.UtcNow; a.UpdatedByUserId = actor;
        if (a.Member is { } m) m.IsSuspended = !active;
        if (a.StaffUser is { } s) s.Active = active;
        await db.SaveChangesAsync(); return Dto(a);
    }
    public async Task<ProvisionedAccountDto> Reset(Guid id, string role, Guid actor)
    {
        var a = await Find(id, role); var temporary = AuthService.TemporaryPassword();
        a.PasswordHash = hasher.HashPassword(a, temporary); a.MustChangePassword = true; a.SessionVersion++; a.LockedUntil = null; a.FailedLoginAttempts = 0; a.UpdatedAt = DateTime.UtcNow; a.UpdatedByUserId = actor;
        await db.SaveChangesAsync(); return new(Dto(a), temporary);
    }
}
