using System.Data;
using GymPlatform.Api.Contracts;
using GymPlatform.Domain;
using GymPlatform.Domain.Entities;
using GymPlatform.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace GymPlatform.Api.Services;

public class CourseService(GymDbContext db)
{
    public static TimeZoneInfo GymZone => TimeZoneInfo.FindSystemTimeZoneById(GymParkConfiguration.Text("timezone"));
    public static DateOnly Today => DateOnly.FromDateTime(TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, GymZone));
    public static DateTime ToUtc(DateOnly date, TimeOnly time) => TimeZoneInfo.ConvertTimeToUtc(date.ToDateTime(time, DateTimeKind.Unspecified), GymZone);
    public static CourseDto Dto(Course c, bool staff = false) => new(c.Id, c.Name, c.Description, c.Category, c.CoachName, c.DefaultDurationMinutes, c.DefaultCapacity, c.ReservationRequired, c.WomenOnly, c.Active, c.PubliclyVisible, c.ImageUrl, staff ? c.Notes : null);
    public static SessionDto Dto(ClassSession s, bool staff = false) => new(s.Id, s.CourseId, s.SeriesId, s.Course.Name, s.Course.Category, s.StartsAt, s.EndsAt, s.Capacity, s.BookedCount, Math.Max(0, s.Capacity-s.BookedCount), s.Status, s.CoachOverride ?? s.Course.CoachName, s.Course.WomenOnly, s.Course.ReservationRequired, s.IsOverride, staff ? s.NotesOverride : null);
    public async Task<List<CourseDto>> Courses(bool staff)
    {
        var list = await db.Courses.Where(c => staff || c.Active && c.PubliclyVisible).OrderBy(c => c.Name).ToListAsync(); return list.Select(c => Dto(c, staff)).ToList();
    }
    public async Task<CourseDto> SaveCourse(CourseRequest input, Guid actor, Guid? id = null)
    {
        if (string.IsNullOrWhiteSpace(input.Name)) throw new ApiException(400, "Le nom du cours est obligatoire.");
        if (!string.IsNullOrWhiteSpace(input.ImageUrl) && (!Uri.TryCreate(input.ImageUrl, UriKind.Absolute, out var uri) || uri.Scheme != "https")) throw new ApiException(400, "L’image doit utiliser une URL HTTPS.");
        var c = id.HasValue ? await db.Courses.FindAsync(id.Value) ?? throw new ApiException(404, "Cours introuvable.") : new Course { CreatedByUserId = actor };
        c.Name = input.Name.Trim(); c.Description = input.Description; c.Category = input.Category; c.CoachName = input.CoachName; c.DefaultDurationMinutes = input.DefaultDurationMinutes; c.DefaultCapacity = input.DefaultCapacity; c.ReservationRequired = input.ReservationRequired; c.WomenOnly = input.WomenOnly; c.Active = input.Active; c.PubliclyVisible = input.PubliclyVisible; c.ImageUrl = input.ImageUrl; c.Notes = input.Notes; c.UpdatedByUserId = actor; c.UpdatedAt = DateTime.UtcNow;
        if (!id.HasValue) db.Courses.Add(c); await db.SaveChangesAsync(); return Dto(c, true);
    }
    public static void ValidateSeries(SeriesRequest input)
    {
        if (input.Recurrence is not ("Once" or "Daily" or "Weekly")) throw new ApiException(400, "Récurrence invalide.");
        if (input.EndDate < input.StartDate || input.StartDate.Year < 2020 || input.StartDate.Year > 2100 || input.EndDate?.Year > 2100) throw new ApiException(400, "Dates de série invalides.");
        if (input.Recurrence == "Weekly" && (input.Weekdays.Length == 0 || input.Weekdays.Any(d => d is < 0 or > 6))) throw new ApiException(400, "Choisissez les jours de la semaine.");
        if (input.EffectiveFrom.HasValue && input.EffectiveFrom < Today) throw new ApiException(400, "Les séances passées ne peuvent pas être modifiées via la série.");
    }
    public async Task<object> SaveSeries(SeriesRequest input, Guid actor, Guid? id = null)
    {
        ValidateSeries(input);
        await using var transaction = await db.Database.BeginTransactionAsync();
        await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(746392802)");
        if (!await db.Courses.AnyAsync(c => c.Id == input.CourseId)) throw new ApiException(404, "Cours introuvable.");
        var series = id.HasValue ? await db.ClassSeries.FindAsync(id.Value) ?? throw new ApiException(404, "Série introuvable.") : new ClassSeries { CourseId = input.CourseId, CreatedByUserId = actor };
        if (series.CourseId != input.CourseId) throw new ApiException(400, "Le cours d’une série ne peut pas être remplacé.");
        series.AppliesFrom = input.EffectiveFrom ?? Today; series.StartDate = input.StartDate; series.EndDate = input.EndDate; series.Recurrence = input.Recurrence; series.Weekdays = string.Join(',', input.Weekdays.Distinct().Order()); series.StartTime = input.StartTime; series.DurationMinutes = input.DurationMinutes; series.Capacity = input.Capacity; series.Active = input.Active; series.UpdatedAt = DateTime.UtcNow; series.UpdatedByUserId = actor;
        if (!id.HasValue) db.ClassSeries.Add(series);
        await db.SaveChangesAsync();
        var preserved = await Materialize(series, input.EffectiveFrom ?? Today, actor);
        await db.SaveChangesAsync(); await transaction.CommitAsync();
        return new { series.Id, PreservedBookedOrOverriddenSessions = preserved, Message = preserved > 0 ? "Les séances réservées ou modifiées individuellement sont conservées. Modifiez-les une par une si nécessaire." : "Planning enregistré." };
    }
    public async Task<int> Materialize(ClassSeries series, DateOnly from, Guid actor)
    {
        var horizon = Today.AddDays(84); var existing = await db.ClassSessions.FromSqlInterpolated($"SELECT * FROM \"ClassSessions\" WHERE \"SeriesId\" = {series.Id} AND \"OccurrenceDate\" >= {from} AND \"StartsAt\" > {DateTime.UtcNow} ORDER BY \"Id\" FOR UPDATE").ToListAsync();
        var desired = new HashSet<DateOnly>();
        if (series.Active)
        for (var day = from > series.StartDate ? from : series.StartDate; day <= horizon && (!series.EndDate.HasValue || day <= series.EndDate); day = day.AddDays(1))
        {
            var matches = series.Recurrence == "Daily" || series.Recurrence == "Once" && day == series.StartDate || series.Recurrence == "Weekly" && series.Weekdays.Split(',').Contains(((int)day.DayOfWeek).ToString());
            if (matches && ToUtc(day, series.StartTime) > DateTime.UtcNow) desired.Add(day);
        }
        var preserved = 0;
        foreach (var s in existing)
        {
            if (s.BookedCount > 0 || s.IsOverride) { preserved++; desired.Remove(s.OccurrenceDate); continue; }
            if (!desired.Remove(s.OccurrenceDate)) { s.Status = "Cancelled"; s.CancelledAt ??= DateTime.UtcNow; }
            else { s.StartsAt = ToUtc(s.OccurrenceDate, series.StartTime); s.EndsAt = s.StartsAt.AddMinutes(series.DurationMinutes); s.Capacity = series.Capacity; s.Status = "Scheduled"; s.CancelledAt = null; }
            s.UpdatedAt = DateTime.UtcNow; s.UpdatedByUserId = actor;
        }
        // Do not regenerate past/cancelled unique occurrences omitted by the future-only query.
        var allDates = await db.ClassSessions.Where(s => s.SeriesId == series.Id).Select(s => s.OccurrenceDate).ToListAsync();
        foreach (var day in desired.Except(allDates))
        {
            var start = ToUtc(day, series.StartTime);
            db.ClassSessions.Add(new ClassSession { CourseId = series.CourseId, SeriesId = series.Id, OccurrenceDate = day, StartsAt = start, EndsAt = start.AddMinutes(series.DurationMinutes), Capacity = series.Capacity, CreatedByUserId = actor });
        }
        return preserved;
    }
    public async Task EnsureHorizon()
    {
        await using var transaction = await db.Database.BeginTransactionAsync();
        await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(746392802)");
        foreach (var series in await db.ClassSeries.Where(s => s.Active && s.Course.Active).ToListAsync())
            await Materialize(series, series.AppliesFrom > Today ? series.AppliesFrom : Today, series.CreatedByUserId);
        await db.SaveChangesAsync(); await transaction.CommitAsync();
    }
    public async Task<List<SessionDto>> Sessions(DateOnly? from, DateOnly? to, bool staff)
    {
        var first = from ?? Today; var last = to ?? first.AddDays(7);
        if (last < first || last.DayNumber-first.DayNumber > 93) throw new ApiException(400, "Choisissez une période de 93 jours maximum.");
        var start = ToUtc(first, TimeOnly.MinValue); var end = ToUtc(last.AddDays(1), TimeOnly.MinValue);
        var sessions = await db.ClassSessions.Include(s => s.Course).Where(s => s.StartsAt >= start && s.StartsAt < end && (staff || s.Course.PubliclyVisible && s.Course.Active)).OrderBy(s => s.StartsAt).ToListAsync();
        return sessions.Select(s => Dto(s, staff)).ToList();
    }
    public async Task<SessionDto> Session(Guid id, bool staff)
    {
        var s = await db.ClassSessions.Include(s => s.Course).SingleOrDefaultAsync(s => s.Id == id && (staff || s.Course.PubliclyVisible && s.Course.Active)) ?? throw new ApiException(404, "Séance introuvable."); return Dto(s, staff);
    }
    public async Task<SessionDto> EditSession(Guid id, SessionRequest input, Guid actor)
    {
        if (input.StartsAt <= DateTimeOffset.UtcNow || input.EndsAt <= input.StartsAt || input.EndsAt - input.StartsAt > TimeSpan.FromHours(4)) throw new ApiException(400, "Horaire invalide (séance future, durée maximale de 4 heures).");
        var affected = await db.ClassSessions.Where(s => s.Id == id && s.StartsAt > DateTime.UtcNow && s.Status == "Scheduled" && s.BookedCount <= input.Capacity).ExecuteUpdateAsync(u => u.SetProperty(s => s.StartsAt, input.StartsAt.UtcDateTime).SetProperty(s => s.EndsAt, input.EndsAt.UtcDateTime).SetProperty(s => s.Capacity, input.Capacity).SetProperty(s => s.CoachOverride, input.CoachOverride).SetProperty(s => s.NotesOverride, input.NotesOverride).SetProperty(s => s.IsOverride, true).SetProperty(s => s.UpdatedAt, DateTime.UtcNow).SetProperty(s => s.UpdatedByUserId, actor));
        if (affected == 0) throw new ApiException(409, "Séance absente, passée, annulée ou capacité inférieure au nombre de réservations.");
        return await Session(id, true);
    }
    public async Task CancelSession(Guid id, Guid actor)
    {
        var count = await db.ClassSessions.Where(s => s.Id == id && s.StartsAt > DateTime.UtcNow).ExecuteUpdateAsync(u => u.SetProperty(s => s.Status, "Cancelled").SetProperty(s => s.CancelledAt, DateTime.UtcNow).SetProperty(s => s.IsOverride, true).SetProperty(s => s.UpdatedByUserId, actor).SetProperty(s => s.UpdatedAt, DateTime.UtcNow));
        if (count == 0) throw new ApiException(404, "Séance future introuvable.");
    }
}
