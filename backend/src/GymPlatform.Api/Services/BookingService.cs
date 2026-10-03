using GymPlatform.Api.Contracts;
using GymPlatform.Domain.Entities;
using GymPlatform.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace GymPlatform.Api.Services;

public class BookingEligibility(GymDbContext db, IConfiguration configuration)
{
    public async Task Check(Guid memberId)
    {
        if (!await db.UserAccounts.AnyAsync(a => a.MemberId == memberId && a.IsActive && a.Member != null && !a.Member.IsSuspended)) throw new ApiException(403, "Ce compte adhérent n’est pas actif.");
        // Explicitly opt in once the club has imported and validated subscription records.
        if (configuration.GetValue<bool>("Booking:RequireActiveSubscription") && !await db.Subscriptions.AnyAsync(s => s.MemberId == memberId && s.Status == GymPlatform.Domain.MembershipStatus.Active && s.StartDate <= CourseService.Today && s.EndDate >= CourseService.Today))
            throw new ApiException(403, "Un abonnement actif est nécessaire pour réserver.", "membership_required");
    }
}
public class BookingService(GymDbContext db, BookingEligibility eligibility)
{
    public static ReservationDto Dto(ClassReservation r, bool staff) => new(r.Id, r.MemberId, staff ? $"{r.Member.FirstName} {r.Member.LastName}".Trim() : null, staff ? r.Member.Email : null, staff ? r.Member.MemberNumber : null, r.Status, r.CreatedAt, r.CancelledAt, CourseService.Dto(r.ClassSession, staff));
    public async Task<ReservationDto> Book(Guid sessionId, Guid memberId, Guid actor, bool staff)
    {
        await using var transaction = await db.Database.BeginTransactionAsync();
        // Conditional row update acquires a PostgreSQL row lock; simultaneous writers recheck the capacity predicate.
        var updated = await db.ClassSessions.Where(s => s.Id == sessionId && s.Status == "Scheduled" && s.StartsAt > DateTime.UtcNow && s.BookedCount < s.Capacity && s.Course.Active && (staff || s.Course.PubliclyVisible)).ExecuteUpdateAsync(u => u.SetProperty(s => s.BookedCount, s => s.BookedCount + 1));
        if (updated == 0) throw new ApiException(409, "Séance complète, annulée, passée ou indisponible.", "session_unavailable");
        await eligibility.Check(memberId);
        var reservation = await db.ClassReservations.SingleOrDefaultAsync(r => r.ClassSessionId == sessionId && r.MemberId == memberId);
        if (reservation?.Status == "Booked") throw new ApiException(409, "Vous avez déjà réservé cette séance.", "duplicate_booking");
        if (reservation is null) { reservation = new ClassReservation { ClassSessionId = sessionId, MemberId = memberId, CreatedByUserId = actor }; db.ClassReservations.Add(reservation); }
        else { reservation.Status = "Booked"; reservation.CancelledAt = null; reservation.UpdatedAt = DateTime.UtcNow; reservation.UpdatedByUserId = actor; }
        await db.SaveChangesAsync(); await transaction.CommitAsync();
        return await Get(reservation.Id, staff);
    }
    public async Task Cancel(Guid sessionId, Guid memberId, Guid actor)
    {
        await using var transaction = await db.Database.BeginTransactionAsync();
        // Lock order is always session then reservation, including when staff cancels.
        var locked = await db.ClassSessions.Where(s => s.Id == sessionId && s.StartsAt > DateTime.UtcNow).ExecuteUpdateAsync(u => u.SetProperty(s => s.BookedCount, s => s.BookedCount));
        if (locked == 0) throw new ApiException(409, "Cette séance est passée ou introuvable.");
        var changed = await db.ClassReservations.Where(r => r.ClassSessionId == sessionId && r.MemberId == memberId && r.Status == "Booked").ExecuteUpdateAsync(u => u.SetProperty(r => r.Status, "Cancelled").SetProperty(r => r.CancelledAt, DateTime.UtcNow).SetProperty(r => r.UpdatedAt, DateTime.UtcNow).SetProperty(r => r.UpdatedByUserId, actor));
        if (changed == 0) throw new ApiException(404, "Réservation active introuvable.");
        await db.ClassSessions.Where(s => s.Id == sessionId).ExecuteUpdateAsync(u => u.SetProperty(s => s.BookedCount, s => s.BookedCount - 1));
        await transaction.CommitAsync();
    }
    private IQueryable<ClassReservation> Query => db.ClassReservations.Include(r => r.Member).Include(r => r.ClassSession).ThenInclude(s => s.Course);
    public async Task<ReservationDto> Get(Guid id, bool staff) => Dto(await Query.SingleAsync(r => r.Id == id), staff);
    public async Task<List<ReservationDto>> List(Guid? sessionId, Guid? memberId, bool staff)
    {
        var rows = await Query.Where(r => (!sessionId.HasValue || r.ClassSessionId == sessionId) && (!memberId.HasValue || r.MemberId == memberId)).OrderByDescending(r => r.ClassSession.StartsAt).ToListAsync();
        return rows.Select(r => Dto(r, staff)).ToList();
    }
}
