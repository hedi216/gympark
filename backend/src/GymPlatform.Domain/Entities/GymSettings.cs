namespace GymPlatform.Domain.Entities;

public class GymSettings : BaseEntity
{
    public string Name { get; set; } = GymParkConfiguration.Text("name");
    public string AddressLine { get; set; } = GymParkConfiguration.Text("addressLine");
    public string City { get; set; } = GymParkConfiguration.Text("city");
    public string PostalCode { get; set; } = string.Empty;
    public string Country { get; set; } = GymParkConfiguration.Text("country");
    public string Phone { get; set; } = GymParkConfiguration.Text("phone");
    public string? WhatsAppNumber { get; set; }
    public string? LogoUrl { get; set; } = GymParkConfiguration.Text("logo");
    public string PrimaryColor { get; set; } = GymParkConfiguration.Text("primaryColor");
    public string AccentColor { get; set; } = GymParkConfiguration.Text("accentColor");
}

public class OpeningHours : BaseEntity
{
    // New-install defaults only; callers must not replace existing rows automatically.
    public static IReadOnlyList<OpeningHours> CreateGymParkDefaults() =>
        GymParkConfiguration.Data.GetProperty("openingHours").EnumerateArray()
            .Select(hours => new OpeningHours
            {
                DayOfWeek = (DayOfWeek)hours.GetProperty("day").GetInt32(),
                OpenTime = TimeOnly.ParseExact(hours.GetProperty("open").GetString()!, "HH:mm", System.Globalization.CultureInfo.InvariantCulture),
                CloseTime = TimeOnly.ParseExact(hours.GetProperty("close").GetString()!, "HH:mm", System.Globalization.CultureInfo.InvariantCulture),
                Closed = false
            }).ToList();

    public DayOfWeek DayOfWeek { get; set; }
    public TimeOnly? OpenTime { get; set; }
    public TimeOnly? CloseTime { get; set; }
    public bool Closed { get; set; }
}

public class SpecialDate : BaseEntity
{
    public DateOnly Date { get; set; }
    public string Label { get; set; } = string.Empty;
    public TimeOnly? OpenTime { get; set; }
    public TimeOnly? CloseTime { get; set; }
    public bool Closed { get; set; }
}
