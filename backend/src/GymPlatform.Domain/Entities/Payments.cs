namespace GymPlatform.Domain.Entities;

public class Payment : BaseEntity
{
    public Guid MemberId { get; set; }
    public Member? Member { get; set; }
    public Guid? SubscriptionId { get; set; }
    public Subscription? Subscription { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "TND";
    public string Method { get; set; } = string.Empty;
    public string? GatewayReference { get; set; }
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    public string? PromoCode { get; set; }
    public decimal DiscountApplied { get; set; }
    public string? InvoiceUrl { get; set; }
}
