namespace BeeCritic.Api.DTOs;

public record TmdbMovieSummary(
    int Id,
    string Title,
    string? Overview,
    string? PosterPath,
    string? BackdropPath,
    string? ReleaseDate,
    double VoteAverage,
    int VoteCount,
    IReadOnlyList<int>? GenreIds,
    IReadOnlyList<TmdbGenre>? Genres,
    double Popularity = 0
);

public record TmdbGenre(int Id, string Name);

public record TmdbMovieDetails(
    int Id,
    string Title,
    string? Overview,
    string? PosterPath,
    string? BackdropPath,
    string? ReleaseDate,
    int? Runtime,
    double VoteAverage,
    int VoteCount,
    string? Tagline,
    string? Status,
    IReadOnlyList<TmdbGenre> Genres,
    TmdbCredits? Credits
);

public record TmdbCredits(
    IReadOnlyList<TmdbCastMember> Cast,
    IReadOnlyList<TmdbCrewMember> Crew
);

public record TmdbCastMember(
    int Id,
    string Name,
    string? Character,
    string? ProfilePath,
    int Order
);

public record TmdbCrewMember(
    int Id,
    string Name,
    string Job,
    string Department,
    string? ProfilePath
);

public record TmdbPagedResponse(
    int Page,
    IReadOnlyList<TmdbMovieSummary> Results,
    int TotalPages,
    int TotalResults
);

public record DiscoverMoviesQuery(
    int Page = 1,
    string? WithGenres = null,
    int? Year = null,
    int? YearFrom = null,
    int? YearTo = null,
    string? SortBy = null,
    double? MinRating = null,
    int? MinVotes = null
);
