using System.ComponentModel.DataAnnotations;
namespace GymPlatform.Api.Contracts;

public record CourseRequest([Required, MaxLength(150)] string Name, [MaxLength(2000)] string Description, [MaxLength(80)] string Category, [MaxLength(150)] string? CoachName, [Range(15, 240)] int DefaultDurationMinutes, [Range(1, 1000)] int DefaultCapacity, bool ReservationRequired, bool WomenOnly, bool Active, bool PubliclyVisible, [MaxLength(500)] string? ImageUrl, [MaxLength(2000)] string? Notes);
public record CourseDto(Guid Id, string Name, string Description, string Category, string? CoachName, int DefaultDurationMinutes, int DefaultCapacity, bool ReservationRequired, bool WomenOnly, bool Active, bool PubliclyVisible, string? ImageUrl, string? Notes);
public record SeriesRequest(Guid CourseId, DateOnly StartDate, DateOnly? EndDate, [Required] string Recurrence, [Required] int[] Weekdays, TimeOnly StartTime, [Range(15, 240)] int DurationMinutes, [Range(1, 1000)] int Capacity, bool Active, DateOnly? EffectiveFrom);
public record SessionRequest(DateTimeOffset StartsAt, DateTimeOffset EndsAt, [Range(1, 1000)] int Capacity, [MaxLength(150)] string? CoachOverride, [MaxLength(2000)] string? NotesOverride);
public record ManualBookingRequest(Guid MemberId);
public record SessionDto(Guid Id, Guid CourseId, Guid SeriesId, string CourseName, string Category, DateTime StartsAt, DateTime EndsAt, int Capacity, int BookedCount, int RemainingPlaces, string Status, string? Coach, bool WomenOnly, bool ReservationRequired, bool IsOverride, string? Notes);
public record ReservationDto(Guid Id, Guid MemberId, string? MemberName, string? Email, string? MemberNumber, string Status, DateTime CreatedAt, DateTime? CancelledAt, SessionDto Session);
