namespace BeeCritic.Api.Models;

public class Review
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public int TmdbMovieId { get; set; }
    public int Rating { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
}
