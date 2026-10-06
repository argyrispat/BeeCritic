using BeeCritic.Api.DTOs;
using BeeCritic.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace BeeCritic.Api.Controllers;

[ApiController]
[Route("api/tmdb")]
public class TmdbController : ControllerBase
{
    private readonly ITmdbService _tmdb;

    public TmdbController(ITmdbService tmdb)
    {
        _tmdb = tmdb;
    }

    [HttpGet("search")]
    public async Task<ActionResult<TmdbPagedResponse>> Search([FromQuery] string q, [FromQuery] int page = 1)
    {
        if (string.IsNullOrWhiteSpace(q))
            return BadRequest(new ApiError("Search query is required."));

        return Ok(await _tmdb.SearchMoviesAsync(q.Trim(), page));
    }

    [HttpGet("movies/{id:int}")]
    public async Task<ActionResult<TmdbMovieDetails>> GetMovie(int id)
    {
        var movie = await _tmdb.GetMovieDetailsAsync(id);
        if (movie is null) return NotFound(new ApiError("Movie not found."));
        return Ok(movie);
    }

    [HttpGet("trending")]
    public async Task<ActionResult<TmdbPagedResponse>> Trending([FromQuery] int page = 1)
        => Ok(await _tmdb.GetTrendingAsync(page));

    [HttpGet("popular")]
    public async Task<ActionResult<TmdbPagedResponse>> Popular([FromQuery] int page = 1)
        => Ok(await _tmdb.GetPopularAsync(page));

    [HttpGet("top-rated")]
    public async Task<ActionResult<TmdbPagedResponse>> TopRated([FromQuery] int page = 1)
        => Ok(await _tmdb.GetTopRatedAsync(page));

    [HttpGet("now-playing")]
    public async Task<ActionResult<TmdbPagedResponse>> NowPlaying([FromQuery] int page = 1)
        => Ok(await _tmdb.GetNowPlayingAsync(page));

    [HttpGet("movies/{id:int}/similar")]
    public async Task<ActionResult<TmdbPagedResponse>> Similar(int id, [FromQuery] int page = 1)
        => Ok(await _tmdb.GetSimilarAsync(id, page));
}
