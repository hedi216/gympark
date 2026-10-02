using GymPlatform.Domain.Entities;
using GymPlatform.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GymPlatform.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MembershipPlansController : ControllerBase
{
    private readonly GymDbContext _db;

    public MembershipPlansController(GymDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MembershipPlan>>> GetAll()
    {
        var plans = await _db.MembershipPlans
            .Where(p => p.Visible)
            .OrderBy(p => p.DurationDays)
            .ToListAsync();

        return Ok(plans);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<MembershipPlan>> GetById(Guid id)
    {
        var plan = await _db.MembershipPlans.FindAsync(id);
        return plan is null ? NotFound() : Ok(plan);
    }
}
