namespace GymPlatform.Domain.Entities;

public class StaffUser : BaseEntity
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public StaffRole Role { get; set; } = StaffRole.Reception;
    public bool Active { get; set; } = true;
}
