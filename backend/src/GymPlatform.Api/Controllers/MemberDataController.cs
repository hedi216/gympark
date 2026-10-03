using GymPlatform.Api.Auth;
using GymPlatform.Api.Contracts;
using GymPlatform.Api.Services;
using GymPlatform.Domain;
using GymPlatform.Domain.Entities;
using GymPlatform.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GymPlatform.Api.Controllers;
[ApiController, Route("api/me"), Authorize(Policy = Policies.Member)]
public class MemberDataController(MemberDataService data) : ControllerBase
{
    [HttpGet] public Task<object> Get() => data.Details(User.OwnMemberId(), false);
    [HttpPut("profile")] public Task<object> Profile(MemberProfileRequest input) => data.Profile(User.OwnMemberId(), input);
}
[ApiController, Route("api/operations"), Authorize(Policy = Policies.Staff)]
public class OperationsController(MemberDataService data, GymDbContext db) : ControllerBase
{
    [HttpGet("members/{memberId:guid}")] public Task<object> Detail(Guid memberId) => data.Details(memberId, true);
    [HttpPost("members/{memberId:guid}/subscriptions")] public Task<object> Subscribe(Guid memberId, SubscriptionRequest input) => data.Subscribe(memberId, input);
    [HttpPost("subscriptions/{id:guid}/cancel")] public async Task<IActionResult> CancelSubscription(Guid id)
    {
        var changed = await db.Subscriptions.Where(s => s.Id == id).ExecuteUpdateAsync(u => u.SetProperty(s => s.Status, MembershipStatus.Cancelled).SetProperty(s => s.UpdatedAt, DateTime.UtcNow));
        if (changed == 0) return NotFound(); return NoContent();
    }
    [HttpGet("subscriptions")] public async Task<object> Subscriptions() => await db.Subscriptions.OrderByDescending(s => s.CreatedAt).Take(200).Select(s => new { s.Id, s.MemberId, Member = s.Member!.Email, Plan = s.MembershipPlan!.Name, s.StartDate, s.EndDate, Status = s.Status.ToString(), s.AmountPaid }).ToListAsync();
    [HttpGet("attendance")] public async Task<object> Attendance() => await db.CheckIns.OrderByDescending(c => c.CheckedInAt).Take(200).Select(c => new { c.Id, c.MemberId, Member = c.Member!.Email, c.CheckedInAt }).ToListAsync();
    [HttpPost("attendance")] public async Task<object> Attendance(CheckInRequest input)
    {
        if (!await db.UserAccounts.AnyAsync(a => a.MemberId == input.MemberId && a.IsActive && !a.Member!.IsSuspended)) throw new ApiException(400, "Adhérent inactif ou introuvable.");
        var checkin = new CheckIn { MemberId = input.MemberId, CheckedInByStaffId = User.UserId().ToString(), WasManualOverride = true };
        db.CheckIns.Add(checkin); await db.SaveChangesAsync(); return new { checkin.Id, checkin.CheckedInAt };
    }
    [HttpGet("payments")] public async Task<object> Payments() => await db.Payments.OrderByDescending(p => p.CreatedAt).Take(200).Select(p => new { p.Id, p.MemberId, Member = p.Member!.Email, p.Amount, p.Method, Status = p.Status.ToString(), p.CreatedAt }).ToListAsync();
    [HttpPost("payments")] public async Task<object> Payment(PaymentRequest input)
    {
        if (!await db.Members.AnyAsync(m => m.Id == input.MemberId)) throw new ApiException(404, "Adhérent introuvable.");
        var payment = new Payment { MemberId = input.MemberId, Amount = input.Amount, Method = input.Method, Status = PaymentStatus.Paid };
        db.Payments.Add(payment); await db.SaveChangesAsync(); return new { payment.Id, payment.Amount, payment.CreatedAt };
    }
    [HttpGet("overview")] public async Task<object> Overview() => new { Members = await db.UserAccounts.CountAsync(a => a.Role == AccountRoles.Member && a.IsActive), UpcomingSessions = await db.ClassSessions.CountAsync(s => s.StartsAt > DateTime.UtcNow && s.Status == "Scheduled"), UpcomingReservations = await db.ClassReservations.CountAsync(r => r.ClassSession.StartsAt > DateTime.UtcNow && r.Status == "Booked" && r.ClassSession.Status != "Cancelled") };
}
