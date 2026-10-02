using GymPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace GymPlatform.Infrastructure;

public class GymDbContext : DbContext
{
    public GymDbContext(DbContextOptions<GymDbContext> options) : base(options)
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
    }
}
