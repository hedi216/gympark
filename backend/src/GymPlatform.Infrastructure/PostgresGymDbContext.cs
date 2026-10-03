using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace GymPlatform.Infrastructure;

public class PostgresGymDbContext(DbContextOptions<PostgresGymDbContext> options) : GymDbContext(options);

// Retains an additive upgrade path for existing SQL Server databases; production uses PostgreSQL.
public class SqlServerDesignFactory : IDesignTimeDbContextFactory<GymDbContext>
{
    public GymDbContext CreateDbContext(string[] args) => new(new DbContextOptionsBuilder<GymDbContext>()
        .UseSqlServer("Server=(localdb)\\mssqllocaldb;Database=GymPlatform;Trusted_Connection=True").Options);
}
public class PostgresDesignFactory : IDesignTimeDbContextFactory<PostgresGymDbContext>
{
    public PostgresGymDbContext CreateDbContext(string[] args) => new(new DbContextOptionsBuilder<PostgresGymDbContext>()
        .UseNpgsql(Environment.GetEnvironmentVariable("ConnectionStrings__GymDb") ?? "Host=localhost;Port=55432;Database=gympark;Username=gympark").Options);
}
