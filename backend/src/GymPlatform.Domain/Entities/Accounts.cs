namespace GymPlatform.Domain.Entities;

public static class AccountRoles
{
    public const string Admin = "ADMIN";
    public const string Employee = "EMPLOYEE";
    public const string Member = "MEMBER";
}

public class UserAccount : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string NormalizedEmail { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = AccountRoles.Member;
    public bool MustChangePassword { get; set; } = true;
    public bool IsActive { get; set; } = true;
    public int SessionVersion { get; set; }
    public int FailedLoginAttempts { get; set; }
    public DateTime? LockedUntil { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public Guid? MemberId { get; set; }
    public Member? Member { get; set; }
    public Guid? StaffUserId { get; set; }
    public StaffUser? StaffUser { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public Guid? UpdatedByUserId { get; set; }
}

public class AuthSession : BaseEntity
{
    public Guid UserAccountId { get; set; }
    public UserAccount UserAccount { get; set; } = null!;
    public int Version { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime? RevokedAt { get; set; }
}
