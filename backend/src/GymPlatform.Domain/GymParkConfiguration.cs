using System.Text.Json;

namespace GymPlatform.Domain;

// Shared, version-controlled business facts. This does not overwrite persisted client data.
public static class GymParkConfiguration
{
    public static JsonElement Data { get; } = Load();

    private static JsonElement Load()
    {
        using var stream = typeof(GymParkConfiguration).Assembly
            .GetManifestResourceStream("GymPlatform.gym-park.json")
            ?? throw new InvalidOperationException("Gym Park configuration is missing.");
        using var document = JsonDocument.Parse(stream);
        return document.RootElement.Clone();
    }

    public static string Text(string property) => Data.GetProperty(property).GetString()
        ?? throw new InvalidOperationException($"Gym Park configuration property {property} is missing.");
}
