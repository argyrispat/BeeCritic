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
    public async Task<ActionResult<TmdbPagedResponse>> Search(
        [FromQuery] string q,
        [FromQuery] int page = 1,
        [FromQuery] int? year = null)
    {
        if (string.IsNullOrWhiteSpace(q))
            return BadRequest(new ApiError("Search query is required."));

        return Ok(await _tmdb.SearchMoviesAsync(q.Trim(), page, year));
    }

    [HttpGet("discover")]
    public async Task<ActionResult<TmdbPagedResponse>> Discover(
        [FromQuery] int page = 1,
        [FromQuery] string? withGenres = null,
        [FromQuery] int? year = null,
        [FromQuery] int? yearFrom = null,
        [FromQuery] int? yearTo = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] double? minRating = null,
        [FromQuery] int? minVotes = null)
    {
        var query = new DiscoverMoviesQuery(page, withGenres, year, yearFrom, yearTo, sortBy, minRating, minVotes);
        return Ok(await _tmdb.DiscoverMoviesAsync(query));
    }

    [HttpGet("genres")]
    public async Task<ActionResult<IReadOnlyList<TmdbGenre>>> Genres()
        => Ok(await _tmdb.GetGenresAsync());

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
