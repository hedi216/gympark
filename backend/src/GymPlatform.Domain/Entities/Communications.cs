namespace GymPlatform.Domain.Entities;

public class Announcement : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public string Audience { get; set; } = "All";
    public int Priority { get; set; }
    public DateTime PublishAt { get; set; } = DateTime.UtcNow;
    public DateTime? ExpiresAt { get; set; }
}

public class Promotion : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string DiscountType { get; set; } = "Percentage";
    public decimal Value { get; set; }
    public List<Guid> EligiblePlanIds { get; set; } = new();
    public string? PromoCode { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int? UsageLimit { get; set; }
    public int UsageCount { get; set; }
    public bool PubliclyVisible { get; set; } = true;
    public bool Active { get; set; } = true;
}

public class Notification : BaseEntity
{
    public Guid MemberId { get; set; }
    public Member? Member { get; set; }
    public NotificationCategory Category { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool Read { get; set; }
    public string? ActionUrl { get; set; }
}
