namespace GymPlatform.Domain.Entities;

public class CheckIn : BaseEntity
{
    public Guid MemberId { get; set; }
    public Member? Member { get; set; }
    public DateTime CheckedInAt { get; set; } = DateTime.UtcNow;
    public string? CheckedInByStaffId { get; set; }
    public bool WasManualOverride { get; set; }
}

public class AccessAttempt : BaseEntity
{
    public Guid? MemberId { get; set; }
    public bool Granted { get; set; }
    public string? DenialReason { get; set; }
    public DateTime AttemptedAt { get; set; } = DateTime.UtcNow;
}
