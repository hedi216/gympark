using GymPlatform.Api.Auth;
using GymPlatform.Api.Contracts;
using GymPlatform.Api.Services;
using GymPlatform.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GymPlatform.Api.Controllers;

[ApiController]
public abstract class AccountsController(AccountService service, string role) : ControllerBase
{
    [HttpGet] public Task<PageDto<AccountDto>> List(string? search, bool? active, int page = 1, int pageSize = 20) => service.List(role, search, active, page, pageSize);
    [HttpGet("{id:guid}")] public async Task<AccountDto> Get(Guid id) => AccountService.Dto(await service.Find(id, role));
    [HttpPost] public Task<ProvisionedAccountDto> Create(CreateAccountRequest input) => service.Create(input, role, User.UserId());
    [HttpPut("{id:guid}")] public Task<AccountDto> Edit(Guid id, EditProfileRequest input) => service.Edit(id, role, input, User.UserId());
    [HttpPost("{id:guid}/reset-password")] public Task<ProvisionedAccountDto> Reset(Guid id) => service.Reset(id, role, User.UserId());
    [HttpPost("{id:guid}/deactivate")] public Task<AccountDto> Deactivate(Guid id) => service.SetActive(id, role, false, User.UserId());
    [HttpPost("{id:guid}/reactivate")] public Task<AccountDto> Reactivate(Guid id) => service.SetActive(id, role, true, User.UserId());
}
[Route("api/members"), Authorize(Policy = Policies.Staff)]
public class MembersController(AccountService service) : AccountsController(service, AccountRoles.Member);
[Route("api/employees"), Authorize(Policy = Policies.Admin)]
public class EmployeesController(AccountService service) : AccountsController(service, AccountRoles.Employee);
