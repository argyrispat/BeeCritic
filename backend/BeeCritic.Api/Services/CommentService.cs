using BeeCritic.Api.Data;
using BeeCritic.Api.DTOs;
using BeeCritic.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace BeeCritic.Api.Services;

public interface ICommentService
{
    Task<PagedResult<CommentDto>> GetByReviewAsync(Guid reviewId, int page, int pageSize);
    Task<CommentDto> CreateAsync(Guid userId, Guid reviewId, CreateCommentRequest request);
    Task<CommentDto> UpdateAsync(Guid userId, Guid commentId, UpdateCommentRequest request);
    Task DeleteAsync(Guid userId, Guid commentId);
}

public class CommentService : ICommentService
{
    private readonly AppDbContext _db;

    public CommentService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<PagedResult<CommentDto>> GetByReviewAsync(Guid reviewId, int page, int pageSize)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize is < 1 or > 50 ? 20 : pageSize;

        var reviewExists = await _db.Reviews.AnyAsync(r => r.Id == reviewId);
        if (!reviewExists)
            throw new AppException("Review not found.", StatusCodes.Status404NotFound);

        var query = _db.Comments
            .AsNoTracking()
            .Where(c => c.ReviewId == reviewId)
            .OrderBy(c => c.CreatedAt);

        var total = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new CommentDto(
                c.Id,
                c.ReviewId,
                c.UserId,
                c.User.Username,
                c.Content,
                c.CreatedAt,
                c.UpdatedAt
            ))
            .ToListAsync();

        var totalPages = (int)Math.Ceiling(total / (double)pageSize);
        return new PagedResult<CommentDto>(items, page, pageSize, total, totalPages);
    }

    public async Task<CommentDto> CreateAsync(Guid userId, Guid reviewId, CreateCommentRequest request)
    {
        var content = ValidateContent(request.Content);

        var reviewExists = await _db.Reviews.AnyAsync(r => r.Id == reviewId);
        if (!reviewExists)
            throw new AppException("Review not found.", StatusCodes.Status404NotFound);

        var now = DateTime.UtcNow;
        var comment = new Comment
        {
            Id = Guid.NewGuid(),
            ReviewId = reviewId,
            UserId = userId,
            Content = content,
            CreatedAt = now,
            UpdatedAt = now
        };

        _db.Comments.Add(comment);
        await _db.SaveChangesAsync();

        return await GetDto(comment.Id);
    }

    public async Task<CommentDto> UpdateAsync(Guid userId, Guid commentId, UpdateCommentRequest request)
    {
        var content = ValidateContent(request.Content);
        var comment = await _db.Comments.FirstOrDefaultAsync(c => c.Id == commentId)
            ?? throw new AppException("Comment not found.", StatusCodes.Status404NotFound);

        if (comment.UserId != userId)
            throw new AppException("You can only edit your own comments.", StatusCodes.Status403Forbidden);

        comment.Content = content;
        comment.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return await GetDto(comment.Id);
    }

    public async Task DeleteAsync(Guid userId, Guid commentId)
    {
        var comment = await _db.Comments.FirstOrDefaultAsync(c => c.Id == commentId)
            ?? throw new AppException("Comment not found.", StatusCodes.Status404NotFound);

        if (comment.UserId != userId)
            throw new AppException("You can only delete your own comments.", StatusCodes.Status403Forbidden);

        _db.Comments.Remove(comment);
        await _db.SaveChangesAsync();
    }

    private async Task<CommentDto> GetDto(Guid id)
    {
        return await _db.Comments
            .AsNoTracking()
            .Where(c => c.Id == id)
            .Select(c => new CommentDto(
                c.Id,
                c.ReviewId,
                c.UserId,
                c.User.Username,
                c.Content,
                c.CreatedAt,
                c.UpdatedAt
            ))
            .FirstAsync();
    }

    private static string ValidateContent(string content)
    {
        if (string.IsNullOrWhiteSpace(content))
            throw new AppException("Comment cannot be empty.");

        var trimmed = content.Trim();
        if (trimmed.Length > 2000)
            throw new AppException("Comment must be 2000 characters or fewer.");

        return trimmed;
    }
}
