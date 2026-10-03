using System.Net;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text.Json;
using GymPlatform.Api.Contracts;
using GymPlatform.Api.Services;
using GymPlatform.Infrastructure;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Xunit;

// These tests deliberately use real PostgreSQL transactions, constraints and HTTP authentication.
public class TestApp : WebApplicationFactory<Program>, IAsyncLifetime
{
    public readonly string Password = "Gp-" + Convert.ToHexString(RandomNumberGenerator.GetBytes(16));
    public readonly string DatabaseName = "gympark_test_" + Guid.NewGuid().ToString("N");
    public string Connection = "";
    string Maintenance = "";
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureAppConfiguration((_, c) => c.AddInMemoryCollection(new Dictionary<string,string?> {
            ["ConnectionStrings:GymDb"] = Connection, ["Database:AutoMigrate"]="true",
            ["GYMPARK_BOOTSTRAP_ADMIN_EMAIL"]="admin@test.local", ["GYMPARK_BOOTSTRAP_ADMIN_TEMP_PASSWORD"]=Password,
            ["GYMPARK_JWT_KEY"]=Convert.ToHexString(RandomNumberGenerator.GetBytes(48)),
            ["Logging:LogLevel:Default"]="Error"
        }));
    }
    public async Task InitializeAsync()
    {
        var connection = Environment.GetEnvironmentVariable("ConnectionStrings__GymDb") ?? throw new InvalidOperationException("Source .gympark/database.env before testing.");
        var b = new NpgsqlConnectionStringBuilder(connection) { Database = "postgres" }; Maintenance=b.ConnectionString;
        await using var db = new NpgsqlConnection(Maintenance); await db.OpenAsync();
        await new NpgsqlCommand($"CREATE DATABASE \"{DatabaseName}\"",db).ExecuteNonQueryAsync();
        b.Database=DatabaseName; Connection=b.ConnectionString;
    }
    public HttpClient Client()
    {
        var c=CreateClient(new WebApplicationFactoryClientOptions { HandleCookies=true, BaseAddress=new Uri("http://localhost") });
        c.DefaultRequestHeaders.Add("X-GymPark-Request","1"); return c;
    }
    async Task IAsyncLifetime.DisposeAsync()
    {
        await DisposeAsync(); NpgsqlConnection.ClearAllPools();
        await using var db=new NpgsqlConnection(Maintenance); await db.OpenAsync();
        await new NpgsqlCommand($"DROP DATABASE \"{DatabaseName}\" WITH (FORCE)",db).ExecuteNonQueryAsync();
    }
}
public class IntegrationTests(TestApp app) : IClassFixture<TestApp>
{
    static readonly string ChangedPassword="Gp-"+Convert.ToHexString(RandomNumberGenerator.GetBytes(16));
    static async Task<JsonElement> Json(HttpResponseMessage response)
    { Assert.True(response.IsSuccessStatusCode, $"HTTP {(int)response.StatusCode}: {await response.Content.ReadAsStringAsync()}"); return await response.Content.ReadFromJsonAsync<JsonElement>(); }
    static Task<HttpResponseMessage> Post(HttpClient c,string path,object? data=null)=>c.PostAsJsonAsync("/api/"+path,data??new {});
    async Task<HttpClient> Login(string email,string password,bool change=true)
    {
        var c=app.Client();var u=await Json(await Post(c,"auth/login",new {email,password}));
        if(change && u.GetProperty("mustChangePassword").GetBoolean()) await Json(await Post(c,"auth/change-password",new {currentPassword=password,newPassword=ChangedPassword,confirmPassword=ChangedPassword}));
        return c;
    }
    static object Course(string name)=>new {name,description="Integration test",category="Fitness",defaultDurationMinutes=60,defaultCapacity=2,reservationRequired=true,active=true,publiclyVisible=true};
    [Fact]
    public async Task Permissions_passwords_publication_capacity_and_history_work_together()
    {
        using var anonymous=app.Client();
        Assert.Equal(HttpStatusCode.Unauthorized,(await anonymous.GetAsync("/api/members")).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized,(await Post(anonymous,"courses",Course("Denied"))).StatusCode);
        using var admin=await Login("admin@test.local",app.Password,false);
        Assert.Equal(HttpStatusCode.Forbidden,(await admin.GetAsync("/api/members")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden,(await admin.GetAsync("/api/courses")).StatusCode);
        await Json(await Post(admin,"auth/change-password",new {currentPassword=app.Password,newPassword=ChangedPassword,confirmPassword=ChangedPassword}));
        using var oldPasswordClient=app.Client();
        Assert.Equal(HttpStatusCode.Unauthorized,(await Post(oldPasswordClient,"auth/login",new {email="admin@test.local",password=app.Password})).StatusCode);
        var employee=await Json(await Post(admin,"employees",new {email="employee@test.local"}));
        using var staff=await Login("employee@test.local",employee.GetProperty("temporaryPassword").GetString()!);
        var employeeId=employee.GetProperty("account").GetProperty("id").GetGuid();
        foreach(var path in new[]{"employees",$"employees/{employeeId}/reset-password",$"employees/{employeeId}/deactivate"})
            Assert.Equal(HttpStatusCode.Forbidden,(await Post(staff,path,new {email="denied@test.local"})).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden,(await staff.GetAsync("/api/employees")).StatusCode);
        var member=await Json(await Post(staff,"members",new {email="member@test.local",role="ADMIN"}));
        var account=member.GetProperty("account");var memberId=account.GetProperty("memberId").GetGuid();var accountId=account.GetProperty("id").GetGuid();
        Assert.Equal("MEMBER",account.GetProperty("role").GetString());Assert.True(account.GetProperty("mustChangePassword").GetBoolean());
        Assert.Equal(HttpStatusCode.Conflict,(await Post(admin,"employees",new {email="MEMBER@test.local"})).StatusCode);
        using var memberClient=await Login("member@test.local",member.GetProperty("temporaryPassword").GetString()!,false);
        Assert.Equal(HttpStatusCode.Forbidden,(await memberClient.GetAsync("/api/me")).StatusCode);
        await Json(await Post(memberClient,"auth/change-password",new {currentPassword=member.GetProperty("temporaryPassword").GetString(),newPassword=ChangedPassword,confirmPassword=ChangedPassword}));
        foreach(var path in new[]{"members","employees","courses"}) Assert.Equal(HttpStatusCode.Forbidden,(await Post(memberClient,path,Course("Denied"))).StatusCode);
        var own=await Json(await memberClient.GetAsync("/api/me"));Assert.Equal(memberId,own.GetProperty("id").GetGuid());
        var course=await Json(await Post(staff,"courses",Course("Published by employee")));
        await Json(await Post(admin,"courses",Course("Published by admin")));
        var date=CourseService.Today.AddDays(2);
        var seriesInput=new {courseId=course.GetProperty("id").GetGuid(),startDate=date,endDate=date.AddDays(14),recurrence="Weekly",weekdays=new[]{(int)date.DayOfWeek},startTime="18:00:00",durationMinutes=60,capacity=2,active=true};
        var series=await Json(await Post(staff,"class-series",seriesInput));
        var range=$"/api/class-sessions?from={date:yyyy-MM-dd}&to={date.AddDays(14):yyyy-MM-dd}";
        var sessions=await Json(await anonymous.GetAsync(range));Assert.Equal(3,sessions.GetArrayLength());
        var session=sessions[0];var id=session.GetProperty("id").GetGuid();Assert.Equal("Published by employee",session.GetProperty("courseName").GetString());Assert.Equal(17,session.GetProperty("startsAt").GetDateTime().Hour);
        Assert.Equal(HttpStatusCode.Unauthorized,(await anonymous.GetAsync($"/api/class-sessions/{id}/reservations")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden,(await memberClient.GetAsync($"/api/class-sessions/{id}/reservations")).StatusCode);
        Assert.DoesNotContain("email",sessions.ToString(),StringComparison.OrdinalIgnoreCase);
        Assert.True((await Post(staff,"class-series/generate")).IsSuccessStatusCode);
        Assert.Equal(3,(await Json(await anonymous.GetAsync(range))).GetArrayLength());
        await Json(await Post(memberClient,$"me/class-reservations/{id}",new {memberId=Guid.NewGuid()}));
        Assert.Equal(HttpStatusCode.Conflict,(await Post(memberClient,$"me/class-reservations/{id}")).StatusCode);
        var clients=new List<HttpClient>();
        for(int i=0;i<6;i++) {var p=await Json(await Post(staff,"members",new {email=$"race{i}@test.local"}));clients.Add(await Login($"race{i}@test.local",p.GetProperty("temporaryPassword").GetString()!));}
        var race=await Task.WhenAll(clients.Select(c=>Post(c,$"me/class-reservations/{id}")));
        Assert.Single(race,r=>r.IsSuccessStatusCode);Assert.Equal(5,race.Count(r=>r.StatusCode==HttpStatusCode.Conflict));
        var full=await Json(await anonymous.GetAsync($"/api/class-sessions/{id}"));Assert.Equal(2,full.GetProperty("bookedCount").GetInt32());Assert.Equal(0,full.GetProperty("remainingPlaces").GetInt32());
        var edit=new {startsAt=full.GetProperty("startsAt").GetDateTime(),endsAt=full.GetProperty("endsAt").GetDateTime(),capacity=1};
        Assert.Equal(HttpStatusCode.Conflict,(await staff.PutAsJsonAsync($"/api/class-sessions/{id}",edit)).StatusCode);
        var changed=await Json(await staff.PutAsJsonAsync($"/api/class-series/{series.GetProperty("id").GetGuid()}",new {seriesInput.courseId,seriesInput.startDate,seriesInput.endDate,seriesInput.recurrence,seriesInput.weekdays,startTime="19:00:00",durationMinutes=60,capacity=3,active=true}));
        Assert.Equal(1,changed.GetProperty("preservedBookedOrOverriddenSessions").GetInt32());
        Assert.Equal(17,(await Json(await anonymous.GetAsync($"/api/class-sessions/{id}"))).GetProperty("startsAt").GetDateTime().Hour);
        Assert.True((await memberClient.DeleteAsync($"/api/me/class-reservations/{id}")).IsSuccessStatusCode);
        Assert.Equal(1,(await Json(await anonymous.GetAsync($"/api/class-sessions/{id}"))).GetProperty("remainingPlaces").GetInt32());
        await Json(await Post(staff,$"class-sessions/{id}/reservations",new {memberId}));
        var participants=await Json(await staff.GetAsync($"/api/class-sessions/{id}/reservations"));Assert.Equal(2,participants.GetArrayLength());
        Assert.True((await Post(staff,$"class-sessions/{id}/cancel")).IsSuccessStatusCode);
        Assert.Equal("Cancelled",(await Json(await anonymous.GetAsync($"/api/class-sessions/{id}"))).GetProperty("status").GetString());
        Assert.Equal(HttpStatusCode.Conflict,(await Post(memberClient,$"me/class-reservations/{id}")).StatusCode);
        var reset=await Json(await Post(staff,$"members/{accountId}/reset-password"));
        Assert.Equal(HttpStatusCode.Unauthorized,(await memberClient.GetAsync("/api/auth/me")).StatusCode);
        using var resetClient=await Login("member@test.local",reset.GetProperty("temporaryPassword").GetString()!,false);
        Assert.Equal(HttpStatusCode.Forbidden,(await resetClient.GetAsync("/api/me")).StatusCode);
        await Json(await Post(staff,$"members/{accountId}/deactivate"));
        Assert.Equal(HttpStatusCode.Unauthorized,(await resetClient.GetAsync("/api/auth/me")).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized,(await Post(oldPasswordClient,"auth/login",new {email="member@test.local",password=reset.GetProperty("temporaryPassword").GetString()})).StatusCode);
        using var scope=app.Services.CreateScope();var db=scope.ServiceProvider.GetRequiredService<GymDbContext>();
        await scope.ServiceProvider.GetRequiredService<BootstrapService>().Initialize();
        Assert.Equal(1,await db.UserAccounts.CountAsync(a=>a.Role=="ADMIN"));
        var stored=await db.UserAccounts.SingleAsync(a=>a.Id==accountId);Assert.NotEqual(reset.GetProperty("temporaryPassword").GetString(),stored.PasswordHash);
        var fetched=await Json(await staff.GetAsync($"/api/members/{accountId}"));Assert.False(fetched.TryGetProperty("passwordHash",out _));Assert.False(fetched.TryGetProperty("temporaryPassword",out _));
        // Both additional recurrence types materialize only the bounded requested dates.
        var adminCourse=await Json(await Post(admin,"courses",Course("Admin public dates")));
        var adminCourseId=adminCourse.GetProperty("id").GetGuid();
        var otherDate=date.AddDays(21);
        await Json(await Post(admin,"class-series",new {courseId=adminCourseId,startDate=otherDate,recurrence="Once",weekdays=Array.Empty<int>(),startTime="09:00:00",durationMinutes=60,capacity=20,active=true}));
        await Json(await Post(staff,"class-series",new {courseId=adminCourseId,startDate=otherDate.AddDays(1),endDate=otherDate.AddDays(3),recurrence="Daily",weekdays=Array.Empty<int>(),startTime="10:00:00",durationMinutes=60,capacity=20,active=true}));
        var published=await Json(await anonymous.GetAsync($"/api/class-sessions?from={otherDate:yyyy-MM-dd}&to={otherDate.AddDays(4):yyyy-MM-dd}"));
        Assert.Equal(4,published.GetArrayLength());
        Assert.All(published.EnumerateArray(),s=>Assert.Equal(adminCourseId,s.GetProperty("courseId").GetGuid()));
        await Json(await admin.PutAsJsonAsync($"/api/courses/{adminCourseId}",new {name="Admin public dates",description="Private",category="Fitness",defaultDurationMinutes=60,defaultCapacity=20,active=true,publiclyVisible=false}));
        Assert.Equal(0,(await Json(await anonymous.GetAsync($"/api/class-sessions?from={otherDate:yyyy-MM-dd}&to={otherDate.AddDays(4):yyyy-MM-dd}"))).GetArrayLength());
        // Operational records remain real and scoped to the owning member.
        await Json(await Post(staff,$"operations/members/{memberId}/subscriptions",new {planCode="libre-1",startDate=date,amountPaid=130}));
        await Json(await Post(staff,"operations/payments",new {memberId,amount=130,method="Espèces"}));
        await Json(await Post(staff,$"members/{accountId}/reactivate"));
        await Json(await Post(staff,"operations/attendance",new {memberId}));
        var details=await Json(await staff.GetAsync($"/api/operations/members/{memberId}"));
        Assert.Equal(1,details.GetProperty("subscriptions").GetArrayLength());
        Assert.Equal(1,details.GetProperty("payments").GetArrayLength());
        Assert.Equal(1,details.GetProperty("attendance").GetArrayLength());
        foreach(var c in clients)c.Dispose();
    }
}

public class MigrationTests(TestApp app) : IClassFixture<TestApp>
{
    [Fact]
    public async Task Additive_migration_preserves_legacy_profile_and_imports_identity()
    {
        var options=new DbContextOptionsBuilder<PostgresGymDbContext>().UseNpgsql(app.Connection).Options;
        await using(var db=new PostgresGymDbContext(options)) {
            var migrator=Microsoft.EntityFrameworkCore.Infrastructure.AccessorExtensions.GetService<Microsoft.EntityFrameworkCore.Migrations.IMigrator>(db);
            await migrator.MigrateAsync("20261002195534_InitialPostgres");
            db.Members.Add(new GymPlatform.Domain.Entities.Member {Email="legacy@test.local",MemberNumber="LEGACY-001",FirstName="Legacy",LastName="Profile",ReferralCode="LEGACY",PasswordHash="preserved-old-hash"});
            await db.SaveChangesAsync();
        }
        using var client=app.Client(); // Startup applies additive migration and safe identity import.
        Assert.True((await client.GetAsync("/api/courses")).IsSuccessStatusCode);
        await using var upgraded=new PostgresGymDbContext(options);
        var profile=await upgraded.Members.SingleAsync();
        Assert.Equal("preserved-old-hash",profile.PasswordHash);
        Assert.Equal("LEGACY-001",profile.MemberNumber);
        var account=await upgraded.UserAccounts.SingleAsync(a=>a.MemberId==profile.Id);
        Assert.Equal("LEGACY@TEST.LOCAL",account.NormalizedEmail);
        Assert.True(account.MustChangePassword);
        Assert.NotEqual(profile.PasswordHash,account.PasswordHash);
    }
}
