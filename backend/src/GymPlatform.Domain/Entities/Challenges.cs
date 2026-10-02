namespace GymPlatform.Domain.Entities;

public class Challenge : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public string GoalType { get; set; } = string.Empty;
    public int GoalAmount { get; set; }
    public int RewardPoints { get; set; }
    public List<MemberLevel> EligibleLevels { get; set; } = new();
    public bool Visible { get; set; } = true;

    public ICollection<ChallengeProgress> ProgressEntries { get; set; } = new List<ChallengeProgress>();
}

public class ChallengeProgress : BaseEntity
{
    public Guid ChallengeId { get; set; }
    public Challenge? Challenge { get; set; }
    public Guid MemberId { get; set; }
    public Member? Member { get; set; }
    public int CurrentValue { get; set; }
    public ChallengeStatus Status { get; set; } = ChallengeStatus.Active;
    public DateTime? CompletedAt { get; set; }
}
