using BeeCritic.Api.DTOs;
using BeeCritic.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace BeeCritic.Api.Controllers;

[ApiController]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly IUserService _users;
    private readonly IReviewService _reviews;

    public UsersController(IUserService users, IReviewService reviews)
    {
        _users = users;
        _reviews = reviews;
    }

    [HttpGet("{username}")]
    public async Task<ActionResult<UserProfileDto>> GetProfile(string username)
    {
        return Ok(await _users.GetByUsernameAsync(username));
    }

    [HttpGet("{username}/reviews")]
    public async Task<ActionResult<PagedResult<ReviewDto>>> GetReviews(
        string username,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        return Ok(await _reviews.GetUserReviewsAsync(username, page, pageSize));
    }
}
