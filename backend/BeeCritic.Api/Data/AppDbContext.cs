using BeeCritic.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace BeeCritic.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<ReviewVote> ReviewVotes => Set<ReviewVote>();
    public DbSet<CommentVote> CommentVotes => Set<CommentVote>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.HasIndex(u => u.Username).IsUnique();
            entity.HasIndex(u => u.Email).IsUnique();
            entity.Property(u => u.Username).HasMaxLength(50).IsRequired();
            entity.Property(u => u.Email).HasMaxLength(256).IsRequired();
            entity.Property(u => u.PasswordHash).IsRequired();
        });

        modelBuilder.Entity<Review>(entity =>
        {
            entity.HasKey(r => r.Id);
            entity.HasIndex(r => new { r.UserId, r.TmdbMovieId }).IsUnique();
            entity.Property(r => r.Content).HasMaxLength(5000).IsRequired();
            entity.Property(r => r.Rating).IsRequired();
            entity.ToTable(t => t.HasCheckConstraint("CK_Review_Rating", "\"Rating\" >= 1 AND \"Rating\" <= 10"));

            entity.HasOne(r => r.User)
                .WithMany(u => u.Reviews)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Comment>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.Property(c => c.Content).HasMaxLength(2000).IsRequired();

            entity.HasOne(c => c.Review)
                .WithMany(r => r.Comments)
                .HasForeignKey(c => c.ReviewId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(c => c.User)
                .WithMany(u => u.Comments)
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<ReviewVote>(entity =>
        {
            entity.HasKey(v => v.Id);
            entity.HasIndex(v => new { v.ReviewId, v.UserId }).IsUnique();
            entity.Property(v => v.Value).IsRequired();
            entity.ToTable(t => t.HasCheckConstraint("CK_ReviewVote_Value", "\"Value\" = 1 OR \"Value\" = -1"));

            entity.HasOne(v => v.Review)
                .WithMany(r => r.Votes)
                .HasForeignKey(v => v.ReviewId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(v => v.User)
                .WithMany(u => u.ReviewVotes)
                .HasForeignKey(v => v.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<CommentVote>(entity =>
        {
            entity.HasKey(v => v.Id);
            entity.HasIndex(v => new { v.CommentId, v.UserId }).IsUnique();
            entity.Property(v => v.Value).IsRequired();
            entity.ToTable(t => t.HasCheckConstraint("CK_CommentVote_Value", "\"Value\" = 1 OR \"Value\" = -1"));

            entity.HasOne(v => v.Comment)
                .WithMany(c => c.Votes)
                .HasForeignKey(v => v.CommentId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(v => v.User)
                .WithMany(u => u.CommentVotes)
                .HasForeignKey(v => v.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
