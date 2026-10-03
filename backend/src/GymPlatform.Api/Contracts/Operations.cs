using System.ComponentModel.DataAnnotations;
namespace GymPlatform.Api.Contracts;
public record SubscriptionRequest([Required] string PlanCode, DateOnly StartDate, [Range(0, 100000)] decimal AmountPaid);
public record PaymentRequest(Guid MemberId, [Range(0.001, 100000)] decimal Amount, [Required, MaxLength(80)] string Method);
public record CheckInRequest(Guid MemberId);
