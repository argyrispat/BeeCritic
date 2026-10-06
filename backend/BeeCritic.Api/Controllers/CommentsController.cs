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
    private readonly IVoteService _votes;

    public CommentsController(ICommentService comments, IVoteService votes)
    {
        _comments = comments;
        _votes = votes;
    }

    [HttpGet("reviews/{reviewId:guid}/comments")]
    public async Task<ActionResult<PagedResult<CommentDto>>> GetComments(
        Guid reviewId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        return Ok(await _comments.GetByReviewAsync(reviewId, page, pageSize, User.TryGetUserId()));
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

    [HttpPost("comments/{id:guid}/vote")]
    [Authorize]
    public async Task<ActionResult<VoteResultDto>> VoteComment(Guid id, [FromBody] VoteRequest request)
    {
        return Ok(await _votes.SetCommentVoteAsync(User.GetUserId(), id, request.Value));
    }

    [HttpDelete("comments/{id:guid}/vote")]
    [Authorize]
    public async Task<ActionResult<VoteResultDto>> ClearCommentVote(Guid id)
    {
        return Ok(await _votes.ClearCommentVoteAsync(User.GetUserId(), id));
    }
}
