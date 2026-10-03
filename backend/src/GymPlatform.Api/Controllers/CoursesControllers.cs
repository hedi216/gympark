using GymPlatform.Api.Auth;
using GymPlatform.Api.Contracts;
using GymPlatform.Api.Services;
using GymPlatform.Domain.Entities;
using GymPlatform.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GymPlatform.Api.Controllers;

[ApiController, Route("api/courses")]
public class CoursesController(CourseService courses) : ControllerBase
{
    [HttpGet, AllowAnonymous] public Task<List<CourseDto>> List() => courses.Courses(false);
    [HttpGet("manage"), Authorize(Policy = Policies.Staff)] public Task<List<CourseDto>> Manage() => courses.Courses(true);
    [HttpPost, Authorize(Policy = Policies.Staff)] public Task<CourseDto> Create(CourseRequest input) => courses.SaveCourse(input, User.UserId());
    [HttpPut("{id:guid}"), Authorize(Policy = Policies.Staff)] public Task<CourseDto> Edit(Guid id, CourseRequest input) => courses.SaveCourse(input, User.UserId(), id);
}
[ApiController, Route("api/class-series"), Authorize(Policy = Policies.Staff)]
public class ClassSeriesController(CourseService courses, GymDbContext db) : ControllerBase
{
    [HttpGet] public async Task<object> List() => await db.ClassSeries.OrderByDescending(s => s.CreatedAt).Select(s => new { s.Id, s.CourseId, CourseName = s.Course.Name, s.StartDate, s.EndDate, s.Recurrence, s.Weekdays, s.StartTime, s.DurationMinutes, s.Capacity, s.Active }).ToListAsync();
    [HttpPost] public Task<object> Create(SeriesRequest input) => courses.SaveSeries(input, User.UserId());
    [HttpPut("{id:guid}")] public Task<object> Edit(Guid id, SeriesRequest input) => courses.SaveSeries(input, User.UserId(), id);
    [HttpPost("generate")] public async Task<IActionResult> Generate() { await courses.EnsureHorizon(); return NoContent(); }
}
[ApiController, Route("api/class-sessions")]
public class ClassSessionsController(CourseService courses, BookingService bookings) : ControllerBase
{
    [HttpGet, AllowAnonymous] public Task<List<SessionDto>> List(DateOnly? from, DateOnly? to) => courses.Sessions(from, to, false);
    [HttpGet("manage"), Authorize(Policy = Policies.Staff)] public Task<List<SessionDto>> Manage(DateOnly? from, DateOnly? to) => courses.Sessions(from, to, true);
    [HttpGet("{id:guid}"), AllowAnonymous] public Task<SessionDto> Get(Guid id) => courses.Session(id, false);
    [HttpPut("{id:guid}"), Authorize(Policy = Policies.Staff)] public Task<SessionDto> Edit(Guid id, SessionRequest input) => courses.EditSession(id, input, User.UserId());
    [HttpPost("{id:guid}/cancel"), Authorize(Policy = Policies.Staff)] public async Task<IActionResult> Cancel(Guid id) { await courses.CancelSession(id, User.UserId()); return NoContent(); }
    [HttpGet("{id:guid}/reservations"), Authorize(Policy = Policies.Staff)] public Task<List<ReservationDto>> Participants(Guid id) => bookings.List(id, null, true);
    [HttpPost("{id:guid}/reservations"), Authorize(Policy = Policies.Staff)] public Task<ReservationDto> Book(Guid id, ManualBookingRequest input) => bookings.Book(id, input.MemberId, User.UserId(), true);
    [HttpDelete("{id:guid}/reservations/{memberId:guid}"), Authorize(Policy = Policies.Staff)] public async Task<IActionResult> CancelBooking(Guid id, Guid memberId) { await bookings.Cancel(id, memberId, User.UserId()); return NoContent(); }
}
[ApiController, Route("api/me/class-reservations"), Authorize(Policy = Policies.Member)]
public class MyReservationsController(BookingService bookings) : ControllerBase
{
    [HttpGet] public Task<List<ReservationDto>> List() => bookings.List(null, User.OwnMemberId(), false);
    [HttpPost("{sessionId:guid}")] public Task<ReservationDto> Book(Guid sessionId) => bookings.Book(sessionId, User.OwnMemberId(), User.UserId(), false);
    [HttpDelete("{sessionId:guid}")] public async Task<IActionResult> Cancel(Guid sessionId) { await bookings.Cancel(sessionId, User.OwnMemberId(), User.UserId()); return NoContent(); }
}
