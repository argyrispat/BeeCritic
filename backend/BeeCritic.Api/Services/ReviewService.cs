using BeeCritic.Api.Data;
using BeeCritic.Api.DTOs;
using BeeCritic.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace BeeCritic.Api.Services;

public interface IReviewService
{
    Task<PagedResult<ReviewDto>> GetMovieReviewsAsync(int tmdbMovieId, int page, int pageSize);
    Task<ReviewDto?> GetByIdAsync(Guid id);
    Task<ReviewDto?> GetUserReviewForMovieAsync(Guid userId, int tmdbMovieId);
    Task<ReviewDto> CreateAsync(Guid userId, int tmdbMovieId, CreateReviewRequest request);
    Task<ReviewDto> UpdateAsync(Guid userId, Guid reviewId, UpdateReviewRequest request);
    Task DeleteAsync(Guid userId, Guid reviewId);
    Task<MovieStatsDto> GetMovieStatsAsync(int tmdbMovieId);
    Task<IReadOnlyList<PopularMovieDto>> GetPopularOnPlatformAsync(int limit = 12);
    Task<PagedResult<ReviewDto>> GetUserReviewsAsync(string username, int page, int pageSize);
}

public class ReviewService : IReviewService
{
    private readonly AppDbContext _db;

    public ReviewService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<PagedResult<ReviewDto>> GetMovieReviewsAsync(int tmdbMovieId, int page, int pageSize)
    {
        (page, pageSize) = NormalizePaging(page, pageSize);

        var query = _db.Reviews
            .AsNoTracking()
            .Where(r => r.TmdbMovieId == tmdbMovieId)
            .OrderByDescending(r => r.CreatedAt);

        var total = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(ToDto)
            .ToListAsync();

        return new PagedResult<ReviewDto>(items, page, pageSize, total, TotalPages(total, pageSize));
    }

    public async Task<ReviewDto?> GetByIdAsync(Guid id)
    {
        return await _db.Reviews
            .AsNoTracking()
            .Where(r => r.Id == id)
            .Select(ToDto)
            .FirstOrDefaultAsync();
    }

    public async Task<ReviewDto?> GetUserReviewForMovieAsync(Guid userId, int tmdbMovieId)
    {
        return await _db.Reviews
            .AsNoTracking()
            .Where(r => r.UserId == userId && r.TmdbMovieId == tmdbMovieId)
            .Select(ToDto)
            .FirstOrDefaultAsync();
    }

    public async Task<ReviewDto> CreateAsync(Guid userId, int tmdbMovieId, CreateReviewRequest request)
    {
        ValidateReview(request.Rating, request.Content);

        var exists = await _db.Reviews.AnyAsync(r => r.UserId == userId && r.TmdbMovieId == tmdbMovieId);
        if (exists)
            throw new AppException("You have already reviewed this movie. Edit your existing review instead.", StatusCodes.Status409Conflict);

        var now = DateTime.UtcNow;
        var review = new Review
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            TmdbMovieId = tmdbMovieId,
            Rating = request.Rating,
            Content = request.Content.Trim(),
            CreatedAt = now,
            UpdatedAt = now
        };

        _db.Reviews.Add(review);

        try
        {
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            throw new AppException("You have already reviewed this movie.", StatusCodes.Status409Conflict);
        }

        return (await GetByIdAsync(review.Id))!;
    }

    public async Task<ReviewDto> UpdateAsync(Guid userId, Guid reviewId, UpdateReviewRequest request)
    {
        ValidateReview(request.Rating, request.Content);

        var review = await _db.Reviews.FirstOrDefaultAsync(r => r.Id == reviewId)
            ?? throw new AppException("Review not found.", StatusCodes.Status404NotFound);

        if (review.UserId != userId)
            throw new AppException("You can only edit your own reviews.", StatusCodes.Status403Forbidden);

        review.Rating = request.Rating;
        review.Content = request.Content.Trim();
        review.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return (await GetByIdAsync(review.Id))!;
    }

    public async Task DeleteAsync(Guid userId, Guid reviewId)
    {
        var review = await _db.Reviews.FirstOrDefaultAsync(r => r.Id == reviewId)
            ?? throw new AppException("Review not found.", StatusCodes.Status404NotFound);

        if (review.UserId != userId)
            throw new AppException("You can only delete your own reviews.", StatusCodes.Status403Forbidden);

        _db.Reviews.Remove(review);
        await _db.SaveChangesAsync();
    }

    public async Task<MovieStatsDto> GetMovieStatsAsync(int tmdbMovieId)
    {
        var reviews = await _db.Reviews
            .AsNoTracking()
            .Where(r => r.TmdbMovieId == tmdbMovieId)
            .Select(r => r.Rating)
            .ToListAsync();

        return new MovieStatsDto(
            tmdbMovieId,
            reviews.Count == 0 ? null : Math.Round(reviews.Average(), 1),
            reviews.Count
        );
    }

    public async Task<IReadOnlyList<PopularMovieDto>> GetPopularOnPlatformAsync(int limit = 12)
    {
        var grouped = await _db.Reviews
            .AsNoTracking()
            .GroupBy(r => r.TmdbMovieId)
            .Select(g => new
            {
                TmdbMovieId = g.Key,
                AverageRating = g.Average(r => r.Rating),
                ReviewCount = g.Count()
            })
            .OrderByDescending(m => m.ReviewCount)
            .ThenByDescending(m => m.AverageRating)
            .Take(limit)
            .ToListAsync();

        return grouped
            .Select(m => new PopularMovieDto(
                m.TmdbMovieId,
                Math.Round(m.AverageRating, 1),
                m.ReviewCount
            ))
            .ToList();
    }

    public async Task<PagedResult<ReviewDto>> GetUserReviewsAsync(string username, int page, int pageSize)
    {
        (page, pageSize) = NormalizePaging(page, pageSize);

        var user = await _db.Users.AsNoTracking()
            .FirstOrDefaultAsync(u => u.Username.ToLower() == username.ToLower())
            ?? throw new AppException("User not found.", StatusCodes.Status404NotFound);

        var query = _db.Reviews
            .AsNoTracking()
            .Where(r => r.UserId == user.Id)
            .OrderByDescending(r => r.CreatedAt);

        var total = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(ToDto)
            .ToListAsync();

        return new PagedResult<ReviewDto>(items, page, pageSize, total, TotalPages(total, pageSize));
    }

    private static System.Linq.Expressions.Expression<Func<Review, ReviewDto>> ToDto => r => new ReviewDto(
        r.Id,
        r.UserId,
        r.User.Username,
        r.TmdbMovieId,
        r.Rating,
        r.Content,
        r.CreatedAt,
        r.UpdatedAt,
        r.Comments.Count
    );

    private static void ValidateReview(int rating, string content)
    {
        if (rating is < 1 or > 10)
            throw new AppException("Rating must be between 1 and 10.");

        if (string.IsNullOrWhiteSpace(content) || content.Trim().Length < 10)
            throw new AppException("Review must be at least 10 characters.");
    }

    private static (int page, int pageSize) NormalizePaging(int page, int pageSize)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize is < 1 or > 50 ? 10 : pageSize;
        return (page, pageSize);
    }

    private static int TotalPages(int total, int pageSize)
        => pageSize == 0 ? 0 : (int)Math.Ceiling(total / (double)pageSize);
}
