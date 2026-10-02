namespace GymPlatform.Domain.Entities;

public class Referral : BaseEntity
{
    public Guid ReferrerMemberId { get; set; }
    public Member? ReferrerMember { get; set; }
    public Guid? ReferredMemberId { get; set; }
    public Member? ReferredMember { get; set; }
    public string? ReferredEmail { get; set; }
    public string? ReferredPhone { get; set; }
    public ReferralStatus Status { get; set; } = ReferralStatus.InvitationSent;
    public int PointsAwarded { get; set; }
    public DateTime? ValidatedAt { get; set; }
}
