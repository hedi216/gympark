namespace GymPlatform.Domain.Entities;

public class LoyaltyAccount : BaseEntity
{
    public Guid MemberId { get; set; }
    public Member? Member { get; set; }
    public int PointsBalance { get; set; }
    public int LifetimePointsEarned { get; set; }

    public ICollection<PointTransaction> Transactions { get; set; } = new List<PointTransaction>();
}

public class PointTransaction : BaseEntity
{
    public Guid LoyaltyAccountId { get; set; }
    public LoyaltyAccount? LoyaltyAccount { get; set; }
    public int Points { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string? RelatedEntityType { get; set; }
    public Guid? RelatedEntityId { get; set; }
}

public class Reward : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public string Category { get; set; } = string.Empty;
    public int PointsCost { get; set; }
    public int? Stock { get; set; }
    public List<MemberLevel> AllowedLevels { get; set; } = new();
    public int? RedemptionLimitPerMember { get; set; }
    public DateTime? AvailableFrom { get; set; }
    public DateTime? AvailableUntil { get; set; }
    public bool Active { get; set; } = true;
}

public class RewardRedemption : BaseEntity
{
    public Guid MemberId { get; set; }
    public Member? Member { get; set; }
    public Guid RewardId { get; set; }
    public Reward? Reward { get; set; }
    public int PointsSpent { get; set; }
    public string VoucherCode { get; set; } = string.Empty;
    public bool Redeemed { get; set; }
}
