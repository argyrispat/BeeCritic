using BeeCritic.Api.DTOs;
using BeeCritic.Api.Helpers;
using BeeCritic.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BeeCritic.Api.Controllers;

[ApiController]
[Route("api")]
public class ReviewsController : ControllerBase
{
    private readonly IReviewService _reviews;

    public ReviewsController(IReviewService reviews)
    {
        _reviews = reviews;
    }

    [HttpGet("movies/{tmdbMovieId:int}/reviews")]
    public async Task<ActionResult<PagedResult<ReviewDto>>> GetMovieReviews(
        int tmdbMovieId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        return Ok(await _reviews.GetMovieReviewsAsync(tmdbMovieId, page, pageSize));
    }

    [HttpGet("movies/{tmdbMovieId:int}/stats")]
    public async Task<ActionResult<MovieStatsDto>> GetMovieStats(int tmdbMovieId)
    {
        return Ok(await _reviews.GetMovieStatsAsync(tmdbMovieId));
    }

    [HttpGet("movies/{tmdbMovieId:int}/my-review")]
    [Authorize]
    public async Task<ActionResult<ReviewDto>> GetMyReview(int tmdbMovieId)
    {
        var review = await _reviews.GetUserReviewForMovieAsync(User.GetUserId(), tmdbMovieId);
        if (review is null) return NotFound(new ApiError("You have not reviewed this movie yet."));
        return Ok(review);
    }

    [HttpPost("movies/{tmdbMovieId:int}/reviews")]
    [Authorize]
    public async Task<ActionResult<ReviewDto>> CreateReview(int tmdbMovieId, [FromBody] CreateReviewRequest request)
    {
        var review = await _reviews.CreateAsync(User.GetUserId(), tmdbMovieId, request);
        return CreatedAtAction(nameof(GetReview), new { id = review.Id }, review);
    }

    [HttpGet("reviews/{id:guid}")]
    public async Task<ActionResult<ReviewDto>> GetReview(Guid id)
    {
        var review = await _reviews.GetByIdAsync(id);
        if (review is null) return NotFound(new ApiError("Review not found."));
        return Ok(review);
    }

    [HttpPut("reviews/{id:guid}")]
    [Authorize]
    public async Task<ActionResult<ReviewDto>> UpdateReview(Guid id, [FromBody] UpdateReviewRequest request)
    {
        return Ok(await _reviews.UpdateAsync(User.GetUserId(), id, request));
    }

    [HttpDelete("reviews/{id:guid}")]
    [Authorize]
    public async Task<IActionResult> DeleteReview(Guid id)
    {
        await _reviews.DeleteAsync(User.GetUserId(), id);
        return NoContent();
    }

    [HttpGet("platform/popular-movies")]
    public async Task<ActionResult<IReadOnlyList<PopularMovieDto>>> GetPopularOnPlatform([FromQuery] int limit = 12)
    {
        return Ok(await _reviews.GetPopularOnPlatformAsync(Math.Clamp(limit, 1, 24)));
    }
}
