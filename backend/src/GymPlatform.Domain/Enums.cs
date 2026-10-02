namespace GymPlatform.Domain;

public enum MembershipStatus
{
    Active,
    ExpiringSoon,
    Paused,
    Expired,
    Cancelled
}

public enum PaymentStatus
{
    Paid,
    Pending,
    Failed,
    Refunded
}

public enum PauseRequestStatus
{
    Pending,
    Approved,
    Rejected,
    Completed
}

public enum RewardStatus
{
    Available,
    Locked,
    Redeemed,
    OutOfStock
}

public enum ChallengeStatus
{
    Upcoming,
    Active,
    Completed,
    Expired
}

public enum MemberLevel
{
    Bronze,
    Silver,
    Gold,
    Platinum
}

public enum ReferralStatus
{
    InvitationSent,
    RegistrationCreated,
    PaymentPending,
    Validated,
    RewardIssued
}

public enum SupportTicketStatus
{
    Open,
    InReview,
    WaitingForMember,
    Resolved
}

public enum StaffRole
{
    SuperAdmin,
    Manager,
    Reception,
    Support,
    Marketing
}

public enum NotificationCategory
{
    SubscriptionExpiring,
    PaymentConfirmed,
    PauseApproved,
    RewardAvailable,
    ChallengeCompleted,
    OpeningHoursChanged,
    Promotion,
    Announcement,
    ReferralValidated
}
