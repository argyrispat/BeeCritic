namespace BeeCritic.Api.Models;

public class ReviewVote
{
    public Guid Id { get; set; }
    public Guid ReviewId { get; set; }
    public Guid UserId { get; set; }
    /// <summary>1 = upvote, -1 = downvote.</summary>
    public short Value { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Review Review { get; set; } = null!;
    public User User { get; set; } = null!;
}
