namespace BeeCritic.Api.Configuration;

public class JwtSettings
{
    public const string SectionName = "Jwt";
    public string Key { get; set; } = string.Empty;
    public string Issuer { get; set; } = "BeeCritic";
    public string Audience { get; set; } = "BeeCritic";
    public int ExpirationHours { get; set; } = 72;
}

public class TmdbSettings
{
    public const string SectionName = "Tmdb";
    public string ApiKey { get; set; } = string.Empty;
    public string BaseUrl { get; set; } = "https://api.themoviedb.org/3";
    public string ImageBaseUrl { get; set; } = "https://image.tmdb.org/t/p";
}
