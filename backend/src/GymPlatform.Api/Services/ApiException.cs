namespace GymPlatform.Api.Services;
public class ApiException(int status, string message, string? code = null) : Exception(message)
{
    public int Status { get; } = status;
    public string? Code { get; } = code;
}
