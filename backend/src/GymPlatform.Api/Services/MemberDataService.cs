using GymPlatform.Api.Contracts;
using GymPlatform.Domain;
using GymPlatform.Domain.Entities;
using GymPlatform.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace GymPlatform.Api.Services;
public class MemberDataService(GymDbContext db, BookingService bookings)
{
    public async Task<object> Details(Guid memberId, bool staff)
    {
        var member = await db.Members.FindAsync(memberId) ?? throw new ApiException(404, "Adhérent introuvable.");
        var subscriptions = await db.Subscriptions.Where(s => s.MemberId == memberId).OrderByDescending(s => s.StartDate).Select(s => new { s.Id, Name = s.MembershipPlan!.Name, s.StartDate, s.EndDate, Status = s.Status.ToString(), s.AmountPaid, AccessMode = s.MembershipPlan.AccessMode }).ToListAsync();
        var payments = await db.Payments.Where(p => p.MemberId == memberId).OrderByDescending(p => p.CreatedAt).Select(p => new { p.Id, p.Amount, p.Method, Status = p.Status.ToString(), p.CreatedAt }).ToListAsync();
        var attendance = await db.CheckIns.Where(c => c.MemberId == memberId).OrderByDescending(c => c.CheckedInAt).Select(c => new { c.Id, c.CheckedInAt }).ToListAsync();
        var reservations = await bookings.List(null, memberId, staff);
        return new { member.Id, member.MemberNumber, member.FirstName, member.LastName, member.Email, member.Phone, member.CreatedAt, member.IsSuspended, Subscriptions = subscriptions, Payments = payments, Attendance = attendance, Reservations = reservations };
    }
    public async Task<object> Profile(Guid id, MemberProfileRequest input)
    {
        var m = await db.Members.FindAsync(id) ?? throw new ApiException(404, "Adhérent introuvable.");
        m.FirstName = input.FirstName?.Trim() ?? ""; m.LastName = input.LastName?.Trim() ?? ""; m.Phone = input.Phone?.Trim() ?? ""; m.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(); return new { m.FirstName, m.LastName, m.Phone };
    }
    public async Task<object> Subscribe(Guid memberId, SubscriptionRequest input)
    {
        if (!await db.Members.AnyAsync(m => m.Id == memberId)) throw new ApiException(404, "Adhérent introuvable.");
        if (input.StartDate.Year is < 2020 or > 2100) throw new ApiException(400, "Date de début invalide.");
        var catalog = GymParkConfiguration.Data.GetProperty("plans").EnumerateArray().FirstOrDefault(p => p.GetProperty("id").GetString() == input.PlanCode);
        if (catalog.ValueKind == System.Text.Json.JsonValueKind.Undefined) throw new ApiException(400, "Formule inconnue.");
        await using var transaction = await db.Database.BeginTransactionAsync();
        await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(746392803)");
        var plan = await db.MembershipPlans.SingleOrDefaultAsync(p => p.CatalogCode == input.PlanCode);
        if (plan is null)
        {
            var mode = catalog.GetProperty("accessMode").GetString()!;
            int? months = mode == "sessions" ? catalog.GetProperty("validityMonths").GetInt32() : mode is "morning" or "full" ? int.Parse(catalog.GetProperty("durationLabel").GetString()!.Split(' ')[0]) : null;
            plan = new MembershipPlan { CatalogCode = input.PlanCode, Name = $"{catalog.GetProperty("name").GetString()} · {catalog.GetProperty("durationLabel").GetString()}", Price = catalog.GetProperty("price").GetDecimal(), AccessMode = mode, DurationMonths = months, DurationDays = mode == "short" ? catalog.GetProperty("validityDays").GetInt32() : 0, SessionLimit = mode == "sessions" ? catalog.GetProperty("sessionLimit").GetInt32() : null, AccessStartTime = mode == "morning" ? TimeOnly.Parse(catalog.GetProperty("accessStartTime").GetString()!) : null, AccessEndTime = mode == "morning" ? TimeOnly.Parse(catalog.GetProperty("accessEndTime").GetString()!) : null };
            db.MembershipPlans.Add(plan);
        }
        var subscription = new Subscription { MemberId = memberId, MembershipPlanId = plan.Id, StartDate = input.StartDate, EndDate = (plan.DurationMonths.HasValue ? input.StartDate.AddMonths(plan.DurationMonths.Value) : input.StartDate.AddDays(plan.DurationDays)).AddDays(-1), AmountPaid = input.AmountPaid, Status = MembershipStatus.Active };
        db.Subscriptions.Add(subscription); await db.SaveChangesAsync(); await transaction.CommitAsync();
        return new { subscription.Id, subscription.StartDate, subscription.EndDate };
    }
}
