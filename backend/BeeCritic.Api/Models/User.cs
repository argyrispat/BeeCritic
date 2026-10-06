namespace BeeCritic.Api.Models;

public class User
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Review> Reviews { get; set; } = new List<Review>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public ICollection<ReviewVote> ReviewVotes { get; set; } = new List<ReviewVote>();
    public ICollection<CommentVote> CommentVotes { get; set; } = new List<CommentVote>();
}
