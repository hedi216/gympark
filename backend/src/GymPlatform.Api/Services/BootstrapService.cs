using System.Data;
using System.Net.Mail;
using GymPlatform.Api.Auth;
using GymPlatform.Api.Contracts;
using GymPlatform.Domain;
using GymPlatform.Domain.Entities;
using GymPlatform.Infrastructure;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace GymPlatform.Api.Services;

public class BootstrapService(GymDbContext db, AccountService accounts, IPasswordHasher<UserAccount> hasher, IConfiguration config, IWebHostEnvironment environment, ILogger<BootstrapService> logger)
{
    public async Task Initialize()
    {
        await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.ReadCommitted);
        // PostgreSQL transaction-scoped advisory lock serializes bootstrap across application instances.
        if (db.Database.IsNpgsql()) await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(746392801)");
        var members = await db.Members.Where(m => !db.UserAccounts.Any(a => a.MemberId == m.Id)).ToListAsync();
        var staff = await db.StaffUsers.Where(s => !db.UserAccounts.Any(a => a.StaffUserId == s.Id)).ToListAsync();
        var existing = await db.UserAccounts.Select(a => a.NormalizedEmail).ToListAsync();
        var emails = members.Select(m => m.Email).Concat(staff.Select(s => s.Email)).ToList();
        if (emails.Any(e => !MailAddress.TryCreate(e, out var address) || address.Address != e.Trim()) || existing.Concat(emails.Select(AuthService.Normalize)).GroupBy(e => e).Any(g => g.Count() > 1))
            throw new InvalidOperationException("Legacy profiles have missing, invalid, or duplicate normalized emails. Resolve them before account import; no profiles were modified.");
        if (staff.Count(s => s.Role == StaffRole.SuperAdmin) + await db.UserAccounts.CountAsync(a => a.Role == AccountRoles.Admin) > 1)
            throw new InvalidOperationException("Multiple legacy administrators found. Choose one before account import.");
        foreach (var m in members)
        {
            var a = new UserAccount { Email = m.Email.Trim(), NormalizedEmail = AuthService.Normalize(m.Email), MemberId = m.Id, Role = AccountRoles.Member, IsActive = !m.IsSuspended };
            // Legacy hashes are not trusted: staff must issue an explicit temporary-password reset.
            a.PasswordHash = hasher.HashPassword(a, AuthService.TemporaryPassword()); db.UserAccounts.Add(a);
        }
        foreach (var s in staff)
        {
            var a = new UserAccount { Email = s.Email.Trim(), NormalizedEmail = AuthService.Normalize(s.Email), StaffUserId = s.Id, Role = s.Role == StaffRole.SuperAdmin ? AccountRoles.Admin : AccountRoles.Employee, IsActive = s.Active };
            // Preserve an established ASP.NET Identity hash when valid; otherwise require an operator reset.
            a.PasswordHash = s.PasswordHash.StartsWith("AQAAAA", StringComparison.Ordinal) ? s.PasswordHash : hasher.HashPassword(a, AuthService.TemporaryPassword());
            if (a.Role == AccountRoles.Admin && !s.PasswordHash.StartsWith("AQAAAA", StringComparison.Ordinal))
            {
                var recovery = config["GYMPARK_BOOTSTRAP_ADMIN_TEMP_PASSWORD"];
                if (string.IsNullOrEmpty(recovery)) throw new InvalidOperationException("The legacy administrator needs a reset. Set GYMPARK_BOOTSTRAP_ADMIN_TEMP_PASSWORD once before importing.");
                AuthService.ValidatePassword(recovery); a.PasswordHash = hasher.HashPassword(a, recovery);
            }
            db.UserAccounts.Add(a);
        }
        await db.SaveChangesAsync();
        string? temporaryToDisplay = null; string? bootstrapEmail = null;
        if (!await db.UserAccounts.AnyAsync(a => a.Role == AccountRoles.Admin))
        {
            bootstrapEmail = config["GYMPARK_BOOTSTRAP_ADMIN_EMAIL"] ?? (environment.IsDevelopment() || environment.IsEnvironment("Testing") ? "admin@gympark.local" : null);
            var configuredPassword = config["GYMPARK_BOOTSTRAP_ADMIN_TEMP_PASSWORD"];
            if (bootstrapEmail is null || !MailAddress.TryCreate(bootstrapEmail, out _) || (!environment.IsDevelopment() && !environment.IsEnvironment("Testing") && configuredPassword is null))
                throw new InvalidOperationException("Provide GYMPARK_BOOTSTRAP_ADMIN_EMAIL and GYMPARK_BOOTSTRAP_ADMIN_TEMP_PASSWORD for first production setup.");
            var result = await accounts.Create(new CreateAccountRequest(bootstrapEmail, null, null, null), AccountRoles.Admin, null);
            if (configuredPassword is not null)
            {
                AuthService.ValidatePassword(configuredPassword);
                var admin = await db.UserAccounts.SingleAsync(a => a.Id == result.Account.Id);
                admin.PasswordHash = hasher.HashPassword(admin, configuredPassword); await db.SaveChangesAsync();
            }
            else temporaryToDisplay = result.TemporaryPassword;
        }
        await transaction.CommitAsync();
        if (temporaryToDisplay is not null && environment.IsDevelopment())
        {
            // Only this first-run development bootstrap credential is printed. Never log user-provisioned passwords.
            Console.WriteLine($"GYMPARK FIRST SETUP — Email: {bootstrapEmail}\nGYMPARK TEMPORARY ADMIN PASSWORD: {temporaryToDisplay}\nChange it immediately at /changer-mot-de-passe. This password is not retrievable from the API.");
        }
        if (members.Count + staff.Count > 0) logger.LogInformation("Imported {Count} legacy account identities. Member accounts require staff password reset.", members.Count + staff.Count);
    }
}
