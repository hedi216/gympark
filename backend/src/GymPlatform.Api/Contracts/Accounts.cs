using System.ComponentModel.DataAnnotations;

namespace GymPlatform.Api.Contracts;

public record LoginRequest([Required, EmailAddress, MaxLength(254)] string Email, [Required, MaxLength(128)] string Password);
public record ChangePasswordRequest([Required, MaxLength(128)] string CurrentPassword, [Required, MinLength(12), MaxLength(128)] string NewPassword, [Required] string ConfirmPassword);
public record CreateAccountRequest([Required, EmailAddress, MaxLength(254)] string Email, [MaxLength(100)] string? FirstName, [MaxLength(100)] string? LastName, [MaxLength(40)] string? Phone);
public record EditProfileRequest([Required, EmailAddress, MaxLength(254)] string Email, [MaxLength(100)] string? FirstName, [MaxLength(100)] string? LastName, [MaxLength(40)] string? Phone);
public record MemberProfileRequest([MaxLength(100)] string? FirstName, [MaxLength(100)] string? LastName, [MaxLength(40)] string? Phone);
public record AuthUserDto(Guid Id, string Email, string Role, bool MustChangePassword, Guid? MemberId, string FirstName, string LastName);
public record AccountDto(Guid Id, string Email, string Role, bool IsActive, bool MustChangePassword, Guid? MemberId, string? MemberNumber, string FirstName, string LastName, string? Phone, DateTime CreatedAt, DateTime? LastLoginAt);
public record ProvisionedAccountDto(AccountDto Account, string TemporaryPassword);
public record PageDto<T>(IReadOnlyList<T> Items, int Total, int Page, int PageSize);
