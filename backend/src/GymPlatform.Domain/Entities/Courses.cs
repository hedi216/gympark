namespace GymPlatform.Domain.Entities;

public class Course : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string? CoachName { get; set; }
    public int DefaultDurationMinutes { get; set; } = 60;
    public int DefaultCapacity { get; set; } = 20;
    public bool ReservationRequired { get; set; } = true;
    public bool WomenOnly { get; set; }
    public bool Active { get; set; } = true;
    public bool PubliclyVisible { get; set; } = true;
    public string? ImageUrl { get; set; }
    public string? Notes { get; set; }
    public Guid CreatedByUserId { get; set; }
    public Guid? UpdatedByUserId { get; set; }
}

public class ClassSeries : BaseEntity
{
    public Guid CourseId { get; set; }
    public Course Course { get; set; } = null!;
    public DateOnly StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public DateOnly AppliesFrom { get; set; }
    public string Recurrence { get; set; } = "Once";
    public string Weekdays { get; set; } = string.Empty;
    public TimeOnly StartTime { get; set; }
    public int DurationMinutes { get; set; }
    public int Capacity { get; set; }
    public bool Active { get; set; } = true;
    public Guid CreatedByUserId { get; set; }
    public Guid? UpdatedByUserId { get; set; }
}

public class ClassSession : BaseEntity
{
    public Guid CourseId { get; set; }
    public Course Course { get; set; } = null!;
    public Guid SeriesId { get; set; }
    public ClassSeries Series { get; set; } = null!;
    public DateOnly OccurrenceDate { get; set; }
    public DateTime StartsAt { get; set; }
    public DateTime EndsAt { get; set; }
    public int Capacity { get; set; }
    // Modified atomically in the same transaction as reservation changes.
    public int BookedCount { get; set; }
    public string Status { get; set; } = "Scheduled";
    public string? CoachOverride { get; set; }
    public string? NotesOverride { get; set; }
    public bool IsOverride { get; set; }
    public DateTime? CancelledAt { get; set; }
    public Guid CreatedByUserId { get; set; }
    public Guid? UpdatedByUserId { get; set; }
}

public class ClassReservation : BaseEntity
{
    public Guid ClassSessionId { get; set; }
    public ClassSession ClassSession { get; set; } = null!;
    public Guid MemberId { get; set; }
    public Member Member { get; set; } = null!;
    public string Status { get; set; } = "Booked";
    public DateTime? CancelledAt { get; set; }
    public Guid CreatedByUserId { get; set; }
    public Guid? UpdatedByUserId { get; set; }
    public string? Notes { get; set; }
}
