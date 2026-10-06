using BeeCritic.Api.Data;
using BeeCritic.Api.DTOs;
using BeeCritic.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace BeeCritic.Api.Services;

public interface IVoteService
{
    Task<VoteResultDto> SetReviewVoteAsync(Guid userId, Guid reviewId, int value);
    Task<VoteResultDto> ClearReviewVoteAsync(Guid userId, Guid reviewId);
    Task<VoteResultDto> SetCommentVoteAsync(Guid userId, Guid commentId, int value);
    Task<VoteResultDto> ClearCommentVoteAsync(Guid userId, Guid commentId);
}

public class VoteService : IVoteService
{
    private readonly AppDbContext _db;

    public VoteService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<VoteResultDto> SetReviewVoteAsync(Guid userId, Guid reviewId, int value)
    {
        var voteValue = ValidateVote(value);

        var reviewExists = await _db.Reviews.AnyAsync(r => r.Id == reviewId);
        if (!reviewExists)
            throw new AppException("Review not found.", StatusCodes.Status404NotFound);

        var existing = await _db.ReviewVotes
            .FirstOrDefaultAsync(v => v.ReviewId == reviewId && v.UserId == userId);

        if (existing is null)
        {
            var now = DateTime.UtcNow;
            _db.ReviewVotes.Add(new ReviewVote
            {
                Id = Guid.NewGuid(),
                ReviewId = reviewId,
                UserId = userId,
                Value = voteValue,
                CreatedAt = now,
                UpdatedAt = now
            });
        }
        else if (existing.Value == voteValue)
        {
            // Toggle off when clicking the same vote again.
            _db.ReviewVotes.Remove(existing);
        }
        else
        {
            existing.Value = voteValue;
            existing.UpdatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();
        return await GetReviewVoteResultAsync(reviewId, userId);
    }

    public async Task<VoteResultDto> ClearReviewVoteAsync(Guid userId, Guid reviewId)
    {
        var reviewExists = await _db.Reviews.AnyAsync(r => r.Id == reviewId);
        if (!reviewExists)
            throw new AppException("Review not found.", StatusCodes.Status404NotFound);

        var existing = await _db.ReviewVotes
            .FirstOrDefaultAsync(v => v.ReviewId == reviewId && v.UserId == userId);

        if (existing is not null)
        {
            _db.ReviewVotes.Remove(existing);
            await _db.SaveChangesAsync();
        }

        return await GetReviewVoteResultAsync(reviewId, userId);
    }

    public async Task<VoteResultDto> SetCommentVoteAsync(Guid userId, Guid commentId, int value)
    {
        var voteValue = ValidateVote(value);

        var commentExists = await _db.Comments.AnyAsync(c => c.Id == commentId);
        if (!commentExists)
            throw new AppException("Comment not found.", StatusCodes.Status404NotFound);

        var existing = await _db.CommentVotes
            .FirstOrDefaultAsync(v => v.CommentId == commentId && v.UserId == userId);

        if (existing is null)
        {
            var now = DateTime.UtcNow;
            _db.CommentVotes.Add(new CommentVote
            {
                Id = Guid.NewGuid(),
                CommentId = commentId,
                UserId = userId,
                Value = voteValue,
                CreatedAt = now,
                UpdatedAt = now
            });
        }
        else if (existing.Value == voteValue)
        {
            _db.CommentVotes.Remove(existing);
        }
        else
        {
            existing.Value = voteValue;
            existing.UpdatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();
        return await GetCommentVoteResultAsync(commentId, userId);
    }

    public async Task<VoteResultDto> ClearCommentVoteAsync(Guid userId, Guid commentId)
    {
        var commentExists = await _db.Comments.AnyAsync(c => c.Id == commentId);
        if (!commentExists)
            throw new AppException("Comment not found.", StatusCodes.Status404NotFound);

        var existing = await _db.CommentVotes
            .FirstOrDefaultAsync(v => v.CommentId == commentId && v.UserId == userId);

        if (existing is not null)
        {
            _db.CommentVotes.Remove(existing);
            await _db.SaveChangesAsync();
        }

        return await GetCommentVoteResultAsync(commentId, userId);
    }

    private async Task<VoteResultDto> GetReviewVoteResultAsync(Guid reviewId, Guid userId)
    {
        var upvotes = await _db.ReviewVotes.CountAsync(v => v.ReviewId == reviewId && v.Value == 1);
        var downvotes = await _db.ReviewVotes.CountAsync(v => v.ReviewId == reviewId && v.Value == -1);
        var myVote = await _db.ReviewVotes
            .Where(v => v.ReviewId == reviewId && v.UserId == userId)
            .Select(v => (int?)v.Value)
            .FirstOrDefaultAsync();

        return new VoteResultDto(upvotes, downvotes, myVote);
    }

    private async Task<VoteResultDto> GetCommentVoteResultAsync(Guid commentId, Guid userId)
    {
        var upvotes = await _db.CommentVotes.CountAsync(v => v.CommentId == commentId && v.Value == 1);
        var downvotes = await _db.CommentVotes.CountAsync(v => v.CommentId == commentId && v.Value == -1);
        var myVote = await _db.CommentVotes
            .Where(v => v.CommentId == commentId && v.UserId == userId)
            .Select(v => (int?)v.Value)
            .FirstOrDefaultAsync();

        return new VoteResultDto(upvotes, downvotes, myVote);
    }

    private static short ValidateVote(int value)
    {
        if (value is not (1 or -1))
            throw new AppException("Vote must be 1 (upvote) or -1 (downvote).");

        return (short)value;
    }
}
