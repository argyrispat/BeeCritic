using BeeCritic.Api.DTOs;
using BeeCritic.Api.Helpers;
using BeeCritic.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BeeCritic.Api.Controllers;

[ApiController]
[Route("api")]
public class CommentsController : ControllerBase
{
    private readonly ICommentService _comments;

    public CommentsController(ICommentService comments)
    {
        _comments = comments;
    }

    [HttpGet("reviews/{reviewId:guid}/comments")]
    public async Task<ActionResult<PagedResult<CommentDto>>> GetComments(
        Guid reviewId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        return Ok(await _comments.GetByReviewAsync(reviewId, page, pageSize));
    }

    [HttpPost("reviews/{reviewId:guid}/comments")]
    [Authorize]
    public async Task<ActionResult<CommentDto>> CreateComment(Guid reviewId, [FromBody] CreateCommentRequest request)
    {
        var comment = await _comments.CreateAsync(User.GetUserId(), reviewId, request);
        return Created(string.Empty, comment);
    }

    [HttpPut("comments/{id:guid}")]
    [Authorize]
    public async Task<ActionResult<CommentDto>> UpdateComment(Guid id, [FromBody] UpdateCommentRequest request)
    {
        return Ok(await _comments.UpdateAsync(User.GetUserId(), id, request));
    }

    [HttpDelete("comments/{id:guid}")]
    [Authorize]
    public async Task<IActionResult> DeleteComment(Guid id)
    {
        await _comments.DeleteAsync(User.GetUserId(), id);
        return NoContent();
    }
}
