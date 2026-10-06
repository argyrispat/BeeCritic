using System.ComponentModel.DataAnnotations;

namespace BeeCritic.Api.DTOs;

public record RegisterRequest(
    [Required, MinLength(3), MaxLength(50)] string Username,
    [Required, EmailAddress, MaxLength(256)] string Email,
    [Required, MinLength(8), MaxLength(100)] string Password,
    [Required] string ConfirmPassword
);

public record LoginRequest(
    [Required, EmailAddress] string Email,
    [Required] string Password
);

public record AuthResponse(
    string Token,
    Guid UserId,
    string Username,
    string Email
);

public record CreateReviewRequest(
    [Range(1, 10)] int Rating,
    [Required, MinLength(10), MaxLength(5000)] string Content
);

public record UpdateReviewRequest(
    [Range(1, 10)] int Rating,
    [Required, MinLength(10), MaxLength(5000)] string Content
);

public record ReviewDto(
    Guid Id,
    Guid UserId,
    string Username,
    int TmdbMovieId,
    int Rating,
    string Content,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    int CommentCount
);

public record CreateCommentRequest(
    [Required, MinLength(1), MaxLength(2000)] string Content
);

public record UpdateCommentRequest(
    [Required, MinLength(1), MaxLength(2000)] string Content
);

public record CommentDto(
    Guid Id,
    Guid ReviewId,
    Guid UserId,
    string Username,
    string Content,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record UserProfileDto(
    Guid Id,
    string Username,
    DateTime CreatedAt,
    int ReviewCount
);

public record PagedResult<T>(
    IReadOnlyList<T> Items,
    int Page,
    int PageSize,
    int TotalCount,
    int TotalPages
);

public record MovieStatsDto(
    int TmdbMovieId,
    double? AverageRating,
    int ReviewCount
);

public record PopularMovieDto(
    int TmdbMovieId,
    double AverageRating,
    int ReviewCount
);

public record ApiError(string Message, IDictionary<string, string[]>? Errors = null);
