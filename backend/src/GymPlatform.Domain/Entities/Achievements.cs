namespace GymPlatform.Domain.Entities;

public class Achievement : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? IconUrl { get; set; }
    public string TriggerType { get; set; } = string.Empty;
    public int TriggerValue { get; set; }
}

public class MemberAchievement : BaseEntity
{
    public Guid MemberId { get; set; }
    public Member? Member { get; set; }
    public Guid AchievementId { get; set; }
    public Achievement? Achievement { get; set; }
    public DateTime UnlockedAt { get; set; } = DateTime.UtcNow;
}
