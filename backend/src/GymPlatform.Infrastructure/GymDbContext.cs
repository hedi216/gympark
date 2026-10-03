using GymPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace GymPlatform.Infrastructure;

public class GymDbContext : DbContext
{
    public GymDbContext(DbContextOptions options) : base(options)
    {
    }

    public DbSet<Member> Members => Set<Member>();
    public DbSet<MembershipPlan> MembershipPlans => Set<MembershipPlan>();
    public DbSet<Subscription> Subscriptions => Set<Subscription>();
    public DbSet<PauseRequest> PauseRequests => Set<PauseRequest>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<CheckIn> CheckIns => Set<CheckIn>();
    public DbSet<AccessAttempt> AccessAttempts => Set<AccessAttempt>();
    public DbSet<LoyaltyAccount> LoyaltyAccounts => Set<LoyaltyAccount>();
    public DbSet<PointTransaction> PointTransactions => Set<PointTransaction>();
    public DbSet<Reward> Rewards => Set<Reward>();
    public DbSet<RewardRedemption> RewardRedemptions => Set<RewardRedemption>();
    public DbSet<Referral> Referrals => Set<Referral>();
    public DbSet<Achievement> Achievements => Set<Achievement>();
    public DbSet<MemberAchievement> MemberAchievements => Set<MemberAchievement>();
    public DbSet<Challenge> Challenges => Set<Challenge>();
    public DbSet<ChallengeProgress> ChallengeProgressEntries => Set<ChallengeProgress>();
    public DbSet<Announcement> Announcements => Set<Announcement>();
    public DbSet<Promotion> Promotions => Set<Promotion>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<SupportTicket> SupportTickets => Set<SupportTicket>();
    public DbSet<SupportMessage> SupportMessages => Set<SupportMessage>();
    public DbSet<StaffUser> StaffUsers => Set<StaffUser>();
    public DbSet<GymSettings> GymSettings => Set<GymSettings>();
    public DbSet<OpeningHours> OpeningHours => Set<OpeningHours>();
    public DbSet<SpecialDate> SpecialDates => Set<SpecialDate>();

    public DbSet<UserAccount> UserAccounts => Set<UserAccount>();
    public DbSet<AuthSession> AuthSessions => Set<AuthSession>();
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<ClassSeries> ClassSeries => Set<ClassSeries>();
    public DbSet<ClassSession> ClassSessions => Set<ClassSession>();
    public DbSet<ClassReservation> ClassReservations => Set<ClassReservation>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Member>()
            .HasIndex(m => m.Email)
            .IsUnique();

        modelBuilder.Entity<Member>()
            .HasIndex(m => m.MemberNumber)
            .IsUnique();

        modelBuilder.Entity<Member>()
            .HasIndex(m => m.ReferralCode)
            .IsUnique();

        modelBuilder.Entity<Member>()
            .HasOne(m => m.LoyaltyAccount)
            .WithOne(l => l.Member)
            .HasForeignKey<LoyaltyAccount>(l => l.MemberId);

        modelBuilder.Entity<MembershipPlan>()
            .Property(p => p.Price)
            .HasPrecision(10, 3);

        modelBuilder.Entity<MembershipPlan>()
            .Property(p => p.DiscountPrice)
            .HasPrecision(10, 3);

        modelBuilder.Entity<Subscription>()
            .Property(s => s.AmountPaid)
            .HasPrecision(10, 3);

        modelBuilder.Entity<Payment>()
            .Property(p => p.Amount)
            .HasPrecision(10, 3);

        modelBuilder.Entity<Payment>()
            .Property(p => p.DiscountApplied)
            .HasPrecision(10, 3);

        modelBuilder.Entity<Promotion>()
            .Property(p => p.Value)
            .HasPrecision(10, 3);

        modelBuilder.Entity<MembershipPlan>().HasIndex(p => p.CatalogCode).IsUnique().HasFilter("\"CatalogCode\" IS NOT NULL");
        var account = modelBuilder.Entity<UserAccount>();
        account.Property(a => a.Email).HasMaxLength(254);
        account.Property(a => a.NormalizedEmail).HasMaxLength(254);
        account.Property(a => a.Role).HasMaxLength(16);
        account.HasIndex(a => a.NormalizedEmail).IsUnique();
        account.HasIndex(a => a.Role).IsUnique().HasFilter("\"Role\" = 'ADMIN'");
        account.HasIndex(a => a.MemberId).IsUnique().HasFilter("\"MemberId\" IS NOT NULL");
        account.HasIndex(a => a.StaffUserId).IsUnique().HasFilter("\"StaffUserId\" IS NOT NULL");
        account.HasOne(a => a.Member).WithOne().HasForeignKey<UserAccount>(a => a.MemberId).OnDelete(DeleteBehavior.Restrict);
        account.HasOne(a => a.StaffUser).WithOne().HasForeignKey<UserAccount>(a => a.StaffUserId).OnDelete(DeleteBehavior.Restrict);
        account.ToTable(t => t.HasCheckConstraint("CK_UserAccounts_RoleProfile", "(\"Role\" = 'MEMBER' AND \"MemberId\" IS NOT NULL AND \"StaffUserId\" IS NULL) OR (\"Role\" IN ('ADMIN', 'EMPLOYEE') AND \"StaffUserId\" IS NOT NULL AND \"MemberId\" IS NULL)"));
        modelBuilder.Entity<AuthSession>().HasOne(s => s.UserAccount).WithMany().HasForeignKey(s => s.UserAccountId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<AuthSession>().HasIndex(s => s.ExpiresAt);
        modelBuilder.Entity<Course>().Property(c => c.Name).HasMaxLength(150);
        modelBuilder.Entity<ClassSeries>().HasOne(s => s.Course).WithMany().HasForeignKey(s => s.CourseId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<ClassSession>().HasOne(s => s.Course).WithMany().HasForeignKey(s => s.CourseId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<ClassSession>().HasOne(s => s.Series).WithMany().HasForeignKey(s => s.SeriesId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<ClassSession>().HasIndex(s => new { s.SeriesId, s.OccurrenceDate }).IsUnique();
        modelBuilder.Entity<ClassSession>().HasIndex(s => s.StartsAt);
        modelBuilder.Entity<ClassSession>().ToTable(t => t.HasCheckConstraint("CK_ClassSession_Capacity", "\"Capacity\" > 0 AND \"BookedCount\" >= 0 AND \"BookedCount\" <= \"Capacity\""));
        modelBuilder.Entity<ClassReservation>().HasIndex(r => new { r.ClassSessionId, r.MemberId }).IsUnique();
        modelBuilder.Entity<ClassReservation>().HasIndex(r => r.MemberId);
        modelBuilder.Entity<ClassReservation>().HasOne(r => r.ClassSession).WithMany().HasForeignKey(r => r.ClassSessionId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<ClassReservation>().HasOne(r => r.Member).WithMany().HasForeignKey(r => r.MemberId).OnDelete(DeleteBehavior.Restrict);
        foreach (var type in new[] { typeof(UserAccount), typeof(Course), typeof(ClassSeries), typeof(ClassSession), typeof(ClassReservation) })
        {
            modelBuilder.Entity(type).HasOne(typeof(UserAccount), null).WithMany().HasForeignKey("CreatedByUserId").OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity(type).HasOne(typeof(UserAccount), null).WithMany().HasForeignKey("UpdatedByUserId").OnDelete(DeleteBehavior.Restrict);
        }
        // SQL Server and SQLite return DateTime with unspecified Kind; persisted instants are UTC.
        foreach (var entity in modelBuilder.Model.GetEntityTypes())
        foreach (var property in entity.GetProperties())
            if (property.ClrType == typeof(DateTime))
                property.SetValueConverter(new Microsoft.EntityFrameworkCore.Storage.ValueConversion.ValueConverter<DateTime, DateTime>(v => v, v => DateTime.SpecifyKind(v, DateTimeKind.Utc)));
    }
}
