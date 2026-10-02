using GymPlatform.Domain;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace GymPlatform.Api.Controllers;

[ApiController]
[Route("api/gymprofile")]
public class GymProfileController : ControllerBase
{
    // Read-only integration point for the typed frontend configuration.
    // Promotion visibility and date checks are still required by consumers.
    [HttpGet]
    public ActionResult<JsonElement> Get() => Ok(GymParkConfiguration.Data);
}
