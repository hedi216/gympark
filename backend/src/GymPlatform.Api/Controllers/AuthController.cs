using GymPlatform.Api.Auth;
using GymPlatform.Api.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace GymPlatform.Api.Controllers;
[ApiController, Route("api/auth")]
public class AuthController(AuthService auth) : ControllerBase
{
    [HttpPost("login"), AllowAnonymous, EnableRateLimiting("login")]
    public Task<AuthUserDto> Login(LoginRequest input) => auth.Login(input, Response);
    [HttpGet("me"), Authorize]
    public async Task<AuthUserDto> Me() => AuthService.UserDto(await auth.Current(User.UserId()));
    [HttpPost("change-password"), Authorize, EnableRateLimiting("login")]
    public Task<AuthUserDto> Change(ChangePasswordRequest input) => auth.Change(User.UserId(), input, Response);
    [HttpPost("logout"), Authorize]
    public async Task<IActionResult> Logout() { await auth.Logout(User, Response); return NoContent(); }
}
