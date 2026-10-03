namespace GymPlatform.Api.Services;
public class ScheduleWorker(IServiceScopeFactory scopes, ILogger<ScheduleWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromHours(6));
        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            try { await using var scope = scopes.CreateAsyncScope(); await scope.ServiceProvider.GetRequiredService<CourseService>().EnsureHorizon(); }
            catch (Exception ex) { logger.LogError(ex, "Could not extend the course schedule horizon."); }
        }
    }
}
