namespace GymPlatform.Domain.Entities;

public class SupportTicket : BaseEntity
{
    public Guid MemberId { get; set; }
    public Member? Member { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public SupportTicketStatus Status { get; set; } = SupportTicketStatus.Open;
    public Guid? AssignedStaffId { get; set; }

    public ICollection<SupportMessage> Messages { get; set; } = new List<SupportMessage>();
}

public class SupportMessage : BaseEntity
{
    public Guid SupportTicketId { get; set; }
    public SupportTicket? SupportTicket { get; set; }
    public string AuthorName { get; set; } = string.Empty;
    public bool IsStaff { get; set; }
    public string Message { get; set; } = string.Empty;
    public bool InternalNote { get; set; }
}
