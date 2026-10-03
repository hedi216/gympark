using System.Threading.RateLimiting;
using GymPlatform.Api.Auth;
using GymPlatform.Api.Services;
using GymPlatform.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<PostgresGymDbContext>(options => options.UseNpgsql(builder.Configuration.GetConnectionString("GymDb")));
builder.Services.AddScoped<GymDbContext>(sp => sp.GetRequiredService<PostgresGymDbContext>());
builder.AddGymAuthentication();
builder.Services.AddScoped<AccountService>();
builder.Services.AddScoped<BootstrapService>();
builder.Services.AddScoped<CourseService>();
builder.Services.AddScoped<BookingService>();
builder.Services.AddScoped<BookingEligibility>();
builder.Services.AddScoped<MemberDataService>();
builder.Services.AddHostedService<ScheduleWorker>();
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = 429;
    options.AddPolicy("login", context => RateLimitPartition.GetFixedWindowLimiter(context.Connection.RemoteIpAddress?.ToString() ?? "unknown", _ => new FixedWindowRateLimiterOptions { PermitLimit = builder.Environment.IsEnvironment("Testing") ? 1000 : 20, Window = TimeSpan.FromMinutes(1), QueueLimit = 0 }));
});
var app = builder.Build();
app.Use(async (context, next) =>
{
    context.Response.Headers.CacheControl = "no-store";
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    try { await next(); }
    catch (ApiException ex) { context.Response.StatusCode = ex.Status; await context.Response.WriteAsJsonAsync(new { title = ex.Message, status = ex.Status, code = ex.Code }); }
    catch (DbUpdateException) { context.Response.StatusCode = 409; await context.Response.WriteAsJsonAsync(new { title = "Conflit de données. L’email ou l’enregistrement existe déjà. Rechargez puis réessayez.", status = 409 }); }
    catch (Exception ex) when (!context.Response.HasStarted) { app.Logger.LogError(ex, "Unhandled API failure for {Path}", context.Request.Path); context.Response.StatusCode = 500; await context.Response.WriteAsJsonAsync(new { title = "Le serveur a rencontré une erreur. Réessayez.", status = 500 }); }
});
if (app.Environment.IsDevelopment()) { app.UseSwagger(); app.UseSwaggerUI(); }
else if (!app.Environment.IsEnvironment("Testing")) { app.UseHsts(); app.UseHttpsRedirection(); }
app.UseCors("Frontend");
app.UseAuthentication();
app.Use(async (context, next) =>
{
    if (context.Request.Path.StartsWithSegments("/api") && context.Request.Method is not ("GET" or "HEAD" or "OPTIONS") && (context.User.Identity?.IsAuthenticated == true || context.Request.Path == "/api/auth/login"))
    {
        var origins = context.RequestServices.GetRequiredService<TokenSettings>().Origins;
        var origin = context.Request.Headers.Origin.ToString();
        if (context.Request.Headers["X-GymPark-Request"] != "1" || (origin.Length > 0 && !origins.Contains(origin, StringComparer.Ordinal)))
        { context.Response.StatusCode = 403; await context.Response.WriteAsJsonAsync(new { title = "Origine de requête non autorisée.", status = 403 }); return; }
    }
    await next();
});
app.Use(async (context, next) =>
{
    if (context.User.Identity?.IsAuthenticated == true && !context.User.HasClaim("passwordReady", "true") && context.Request.Path.StartsWithSegments("/api") && context.Request.Path.Value is not ("/api/auth/me" or "/api/auth/change-password" or "/api/auth/logout" or "/api/auth/login"))
    { context.Response.StatusCode = 403; await context.Response.WriteAsJsonAsync(new { title = "Modifiez votre mot de passe pour continuer.", code = "password_change_required", status = 403 }); return; }
    await next();
});
app.UseAuthorization();
app.UseRateLimiter();
app.MapControllers();
if (!app.Configuration.GetValue<bool>("Database:SkipInitialization"))
{
    await using var scope = app.Services.CreateAsyncScope();
    var db = scope.ServiceProvider.GetRequiredService<GymDbContext>();
    if (app.Environment.IsDevelopment() || app.Configuration.GetValue<bool>("Database:AutoMigrate")) await db.Database.MigrateAsync();
    await scope.ServiceProvider.GetRequiredService<BootstrapService>().Initialize();
    await scope.ServiceProvider.GetRequiredService<CourseService>().EnsureHorizon();
}
await app.RunAsync();
public partial class Program;
