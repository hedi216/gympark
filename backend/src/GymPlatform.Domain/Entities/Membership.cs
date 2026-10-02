namespace GymPlatform.Domain.Entities;

public class Member : BaseEntity
{
    public string MemberNumber { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public DateOnly? DateOfBirth { get; set; }
    public string? PhotoUrl { get; set; }
    public string ReferralCode { get; set; } = string.Empty;
    public Guid? ReferredByMemberId { get; set; }
    public MemberLevel Level { get; set; } = MemberLevel.Bronze;
    public bool IsSuspended { get; set; }
    public string PreferredLanguage { get; set; } = "fr";
    public bool MarketingConsent { get; set; }
    public bool HallOfFameVisible { get; set; }

    public LoyaltyAccount? LoyaltyAccount { get; set; }
    public ICollection<Subscription> Subscriptions { get; set; } = new List<Subscription>();
    public ICollection<CheckIn> CheckIns { get; set; } = new List<CheckIn>();
}

public class MembershipPlan : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int DurationDays { get; set; }
    public decimal Price { get; set; }
    public decimal? DiscountPrice { get; set; }
    public int PauseDaysAllowed { get; set; }
    public int GuestPasses { get; set; }
    public int LoyaltyPointsAwarded { get; set; }
    public bool Recommended { get; set; }
    public bool AvailableOnline { get; set; } = true;
    public bool Visible { get; set; } = true;
    public DateTime? AvailableFrom { get; set; }
    public DateTime? AvailableUntil { get; set; }
    public List<string> Benefits { get; set; } = new();
}

public class Subscription : BaseEntity
{
    public Guid MemberId { get; set; }
    public Member? Member { get; set; }
    public Guid MembershipPlanId { get; set; }
    public MembershipPlan? MembershipPlan { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public MembershipStatus Status { get; set; } = MembershipStatus.Active;
    public decimal AmountPaid { get; set; }
    public int PointsEarned { get; set; }
    public int PauseDaysUsed { get; set; }
    public bool AutoRenew { get; set; }

    public ICollection<PauseRequest> PauseRequests { get; set; } = new List<PauseRequest>();
}

public class PauseRequest : BaseEntity
{
    public Guid SubscriptionId { get; set; }
    public Subscription? Subscription { get; set; }
    public DateOnly PauseStartDate { get; set; }
    public DateOnly ResumeDate { get; set; }
    public int DaysRequested { get; set; }
    public PauseRequestStatus Status { get; set; } = PauseRequestStatus.Pending;
    public string? StaffNote { get; set; }
}
