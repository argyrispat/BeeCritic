using System.Globalization;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using BeeCritic.Api.Configuration;
using BeeCritic.Api.DTOs;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;

namespace BeeCritic.Api.Services;

public interface ITmdbService
{
    Task<TmdbPagedResponse> SearchMoviesAsync(string query, int page = 1, int? year = null);
    Task<TmdbPagedResponse> DiscoverMoviesAsync(DiscoverMoviesQuery query);
    Task<IReadOnlyList<TmdbGenre>> GetGenresAsync();
    Task<TmdbMovieDetails?> GetMovieDetailsAsync(int movieId);
    Task<TmdbPagedResponse> GetTrendingAsync(int page = 1);
    Task<TmdbPagedResponse> GetPopularAsync(int page = 1);
    Task<TmdbPagedResponse> GetTopRatedAsync(int page = 1);
    Task<TmdbPagedResponse> GetNowPlayingAsync(int page = 1);
    Task<TmdbPagedResponse> GetSimilarAsync(int movieId, int page = 1);
}

public class TmdbService : ITmdbService
{
    private readonly HttpClient _http;
    private readonly TmdbSettings _settings;
    private readonly IMemoryCache _cache;
    private readonly ILogger<TmdbService> _logger;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    public TmdbService(HttpClient http, IOptions<TmdbSettings> settings, IMemoryCache cache, ILogger<TmdbService> logger)
    {
        _http = http;
        _settings = settings.Value;
        _cache = cache;
        _logger = logger;
    }

    public Task<TmdbPagedResponse> SearchMoviesAsync(string query, int page = 1, int? year = null)
    {
        var path = new StringBuilder($"search/movie?query={Uri.EscapeDataString(query)}&page={page}&include_adult=false");
        if (year is int y)
            path.Append($"&primary_release_year={y}");
        return GetPagedAsync(path.ToString(), cacheKey: null, cacheMinutes: 0);
    }

    public Task<TmdbPagedResponse> DiscoverMoviesAsync(DiscoverMoviesQuery query)
    {
        var page = Math.Clamp(query.Page, 1, 500);
        var parts = new List<string>
        {
            $"page={page}",
            "include_adult=false",
            "language=en-US"
        };

        if (!string.IsNullOrWhiteSpace(query.WithGenres))
            parts.Add($"with_genres={Uri.EscapeDataString(query.WithGenres.Trim())}");

        if (query.Year is int year)
            parts.Add($"primary_release_year={year}");
        else
        {
            if (query.YearFrom is int yearFrom)
                parts.Add($"primary_release_date.gte={yearFrom:D4}-01-01");
            if (query.YearTo is int yearTo)
                parts.Add($"primary_release_date.lte={yearTo:D4}-12-31");
        }

        var sortBy = SanitizeSortBy(query.SortBy);
        parts.Add($"sort_by={Uri.EscapeDataString(sortBy)}");

        if (query.MinRating is double minRating and >= 0)
            parts.Add($"vote_average.gte={minRating.ToString(CultureInfo.InvariantCulture)}");

        if (query.MinVotes is int minVotes and > 0)
            parts.Add($"vote_count.gte={minVotes}");
        else if (query.MinRating is > 0)
            parts.Add("vote_count.gte=50");

        var path = $"discover/movie?{string.Join("&", parts)}";
        var cacheKey = $"tmdb:discover:{string.Join("|", parts)}";
        return GetPagedAsync(path, cacheKey, 15);
    }

    public async Task<IReadOnlyList<TmdbGenre>> GetGenresAsync()
    {
        const string cacheKey = "tmdb:genres";
        if (_cache.TryGetValue(cacheKey, out IReadOnlyList<TmdbGenre>? cached) && cached is not null)
            return cached;

        var raw = await GetAsync<TmdbGenreListRaw>("genre/movie/list?language=en-US")
            ?? throw new AppException("Failed to fetch genres from TMDB.", StatusCodes.Status502BadGateway);

        var genres = raw.Genres
            .Select(g => new TmdbGenre(g.Id, g.Name ?? ""))
            .Where(g => !string.IsNullOrWhiteSpace(g.Name))
            .OrderBy(g => g.Name, StringComparer.OrdinalIgnoreCase)
            .ToList();

        _cache.Set(cacheKey, (IReadOnlyList<TmdbGenre>)genres, TimeSpan.FromHours(24));
        return genres;
    }

    private static readonly HashSet<string> AllowedSortBy = new(StringComparer.Ordinal)
    {
        "popularity.desc",
        "popularity.asc",
        "vote_average.desc",
        "vote_average.asc",
        "primary_release_date.desc",
        "primary_release_date.asc",
        "title.asc",
        "title.desc",
        "revenue.desc"
    };

    private static string SanitizeSortBy(string? sortBy)
        => !string.IsNullOrWhiteSpace(sortBy) && AllowedSortBy.Contains(sortBy)
            ? sortBy
            : "popularity.desc";

    public async Task<TmdbMovieDetails?> GetMovieDetailsAsync(int movieId)
    {
        var cacheKey = $"tmdb:movie:{movieId}";
        if (_cache.TryGetValue(cacheKey, out TmdbMovieDetails? cached) && cached is not null)
            return cached;

        try
        {
            var raw = await GetAsyncWithRetry<TmdbMovieDetailsRaw>($"movie/{movieId}?append_to_response=credits");
            if (raw is null) return null;

            var details = MapDetails(raw);
            _cache.Set(cacheKey, details, TimeSpan.FromHours(6));
            return details;
        }
        catch (HttpRequestException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return null;
        }
    }

    public Task<TmdbPagedResponse> GetTrendingAsync(int page = 1)
        => GetPagedAsync($"trending/movie/week?page={page}", $"tmdb:trending:{page}", 30);

    public Task<TmdbPagedResponse> GetPopularAsync(int page = 1)
        => GetPagedAsync($"movie/popular?page={page}", $"tmdb:popular:{page}", 30);

    public Task<TmdbPagedResponse> GetTopRatedAsync(int page = 1)
        => GetPagedAsync($"movie/top_rated?page={page}", $"tmdb:toprated:{page}", 60);

    public Task<TmdbPagedResponse> GetNowPlayingAsync(int page = 1)
        => GetPagedAsync($"movie/now_playing?page={page}", $"tmdb:nowplaying:{page}", 30);

    public Task<TmdbPagedResponse> GetSimilarAsync(int movieId, int page = 1)
        => GetPagedAsync($"movie/{movieId}/similar?page={page}", $"tmdb:similar:{movieId}:{page}", 60);

    private async Task<TmdbPagedResponse> GetPagedAsync(string path, string? cacheKey, int cacheMinutes)
    {
        if (cacheKey is not null && _cache.TryGetValue(cacheKey, out TmdbPagedResponse? cached) && cached is not null)
            return cached;

        var raw = await GetAsync<TmdbPagedRaw>(path)
            ?? throw new AppException("Failed to fetch movies from TMDB.", StatusCodes.Status502BadGateway);

        var result = new TmdbPagedResponse(
            raw.Page,
            raw.Results.Select(MapSummary).ToList(),
            raw.TotalPages,
            raw.TotalResults
        );

        if (cacheKey is not null && cacheMinutes > 0)
            _cache.Set(cacheKey, result, TimeSpan.FromMinutes(cacheMinutes));

        return result;
    }

    private async Task<T?> GetAsyncWithRetry<T>(string path, int attempts = 3)
    {
        Exception? last = null;
        for (var i = 1; i <= attempts; i++)
        {
            try
            {
                return await GetAsync<T>(path);
            }
            catch (AppException ex) when (ex.StatusCode is StatusCodes.Status502BadGateway or StatusCodes.Status503ServiceUnavailable)
            {
                last = ex;
                if (i == attempts) throw;
                await Task.Delay(200 * i);
            }
            catch (HttpRequestException ex) when (ex.StatusCode != System.Net.HttpStatusCode.NotFound)
            {
                last = ex;
                if (i == attempts) throw;
                await Task.Delay(200 * i);
            }
        }

        throw last ?? new AppException("Failed to reach TMDB.", StatusCodes.Status502BadGateway);
    }

    private async Task<T?> GetAsync<T>(string path)
    {
        if (string.IsNullOrWhiteSpace(_settings.ApiKey))
            throw new AppException("TMDB API key is not configured. Set Tmdb:ApiKey in appsettings.Development.json.", StatusCodes.Status503ServiceUnavailable);

        var separator = path.Contains('?') ? "&" : "?";
        var url = $"{path}{separator}api_key={_settings.ApiKey}";

        try
        {
            using var response = await _http.GetAsync(url);
            if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                throw new HttpRequestException("Not found", null, response.StatusCode);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("TMDB request failed: {Status} {Path}", response.StatusCode, path);
                var detail = response.StatusCode switch
                {
                    System.Net.HttpStatusCode.Unauthorized => "TMDB rejected the API key.",
                    System.Net.HttpStatusCode.TooManyRequests => "TMDB rate limit hit. Try again in a moment.",
                    _ => $"TMDB returned {(int)response.StatusCode}."
                };
                throw new AppException(detail, StatusCodes.Status502BadGateway);
            }

            return await response.Content.ReadFromJsonAsync<T>(JsonOptions);
        }
        catch (AppException)
        {
            throw;
        }
        catch (HttpRequestException)
        {
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "TMDB request error for {Path}", path);
            throw new AppException("Failed to reach TMDB.", StatusCodes.Status502BadGateway);
        }
    }

    private static TmdbMovieSummary MapSummary(TmdbMovieRaw m) => new(
        m.Id,
        m.Title ?? m.Name ?? "Untitled",
        m.Overview,
        m.PosterPath,
        m.BackdropPath,
        m.ReleaseDate,
        m.VoteAverage,
        m.VoteCount,
        m.GenreIds,
        m.Genres?.Select(g => new TmdbGenre(g.Id, g.Name ?? "")).ToList(),
        m.Popularity
    );

    private static TmdbMovieDetails MapDetails(TmdbMovieDetailsRaw m) => new(
        m.Id,
        m.Title ?? "Untitled",
        m.Overview,
        m.PosterPath,
        m.BackdropPath,
        m.ReleaseDate,
        m.Runtime,
        m.VoteAverage,
        m.VoteCount,
        m.Tagline,
        m.Status,
        m.Genres?.Select(g => new TmdbGenre(g.Id, g.Name ?? "")).ToList() ?? [],
        m.Credits is null ? null : new TmdbCredits(
            m.Credits.Cast?.Select(c => new TmdbCastMember(c.Id, c.Name ?? "", c.Character, c.ProfilePath, c.Order)).ToList() ?? [],
            m.Credits.Crew?.Select(c => new TmdbCrewMember(c.Id, c.Name ?? "", c.Job ?? "", c.Department ?? "", c.ProfilePath)).ToList() ?? []
        )
    );

    private sealed class TmdbPagedRaw
    {
        public int Page { get; set; }
        public List<TmdbMovieRaw> Results { get; set; } = [];
        [JsonPropertyName("total_pages")] public int TotalPages { get; set; }
        [JsonPropertyName("total_results")] public int TotalResults { get; set; }
    }

    private class TmdbMovieRaw
    {
        public int Id { get; set; }
        public string? Title { get; set; }
        public string? Name { get; set; }
        public string? Overview { get; set; }
        [JsonPropertyName("poster_path")] public string? PosterPath { get; set; }
        [JsonPropertyName("backdrop_path")] public string? BackdropPath { get; set; }
        [JsonPropertyName("release_date")] public string? ReleaseDate { get; set; }
        [JsonPropertyName("vote_average")] public double VoteAverage { get; set; }
        [JsonPropertyName("vote_count")] public int VoteCount { get; set; }
        public double Popularity { get; set; }
        [JsonPropertyName("genre_ids")] public List<int>? GenreIds { get; set; }
        public List<TmdbGenreRaw>? Genres { get; set; }
    }

    private sealed class TmdbMovieDetailsRaw : TmdbMovieRaw
    {
        public int? Runtime { get; set; }
        public string? Tagline { get; set; }
        public string? Status { get; set; }
        public TmdbCreditsRaw? Credits { get; set; }
    }

    private sealed class TmdbGenreListRaw
    {
        public List<TmdbGenreRaw> Genres { get; set; } = [];
    }

    private sealed class TmdbGenreRaw
    {
        public int Id { get; set; }
        public string? Name { get; set; }
    }

    private sealed class TmdbCreditsRaw
    {
        public List<TmdbCastRaw>? Cast { get; set; }
        public List<TmdbCrewRaw>? Crew { get; set; }
    }

    private sealed class TmdbCastRaw
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Character { get; set; }
        [JsonPropertyName("profile_path")] public string? ProfilePath { get; set; }
        public int Order { get; set; }
    }

    private sealed class TmdbCrewRaw
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Job { get; set; }
        public string? Department { get; set; }
        [JsonPropertyName("profile_path")] public string? ProfilePath { get; set; }
    }
}
