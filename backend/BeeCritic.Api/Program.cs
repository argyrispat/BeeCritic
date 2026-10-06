using System.Text;
using System.Threading.RateLimiting;
using BeeCritic.Api.Configuration;
using BeeCritic.Api.Data;
using BeeCritic.Api.Helpers;
using BeeCritic.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection(JwtSettings.SectionName));
builder.Services.Configure<TmdbSettings>(builder.Configuration.GetSection(TmdbSettings.SectionName));

// Prefer ASP.NET connection string; fall back to Render's linked-database DATABASE_URL.
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(connectionString))
    connectionString = builder.Configuration["DATABASE_URL"];

if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException(
        "Database connection string is missing. Set ConnectionStrings__DefaultConnection " +
        "or DATABASE_URL (Render → Environment → Add from Database).");
}

connectionString = NormalizePostgresConnectionString(connectionString);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));
builder.Services.AddMemoryCache();
builder.Services.AddHttpClient<ITmdbService, TmdbService>(client =>
{
    var baseUrl = builder.Configuration[$"{TmdbSettings.SectionName}:BaseUrl"] ?? "https://api.themoviedb.org/3";
    client.BaseAddress = new Uri(baseUrl.TrimEnd('/') + "/");
    client.Timeout = TimeSpan.FromSeconds(30);
});

builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IReviewService, ReviewService>();
builder.Services.AddScoped<ICommentService, CommentService>();
builder.Services.AddScoped<IVoteService, VoteService>();
builder.Services.AddScoped<IUserService, UserService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "BeeCritic API",
        Version = "v1",
        Description = "Movie review platform API powered by TMDB metadata."
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var jwtSettings = builder.Configuration.GetSection(JwtSettings.SectionName).Get<JwtSettings>()
    ?? throw new InvalidOperationException("JWT settings are missing.");

if (string.IsNullOrWhiteSpace(jwtSettings.Key) || jwtSettings.Key.Length < 32)
    throw new InvalidOperationException("JWT key must be at least 32 characters.");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidAudience = jwtSettings.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key)),
            ClockSkew = TimeSpan.FromMinutes(1)
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddFixedWindowLimiter("api", limiter =>
    {
        limiter.Window = TimeSpan.FromMinutes(1);
        limiter.PermitLimit = 300;
        limiter.QueueLimit = 20;
    });
});

var frontendOrigin = builder.Configuration["Cors:FrontendOrigin"] ?? "http://localhost:5173";
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy.WithOrigins(frontendOrigin)
            .AllowAnyHeader()
            .AllowAnyMethod());
});

var app = builder.Build();

app.UseMiddleware<ExceptionMiddleware>();
app.UseMiddleware<SecurityHeadersMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    // Only meaningful when the API is served over HTTPS (e.g. production reverse proxy terminates TLS).
    app.UseHsts();
    app.UseHttpsRedirection();
}

app.UseCors("Frontend");
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers().RequireRateLimiting("api");

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await DbSeeder.SeedAsync(db);
}

app.Run();

public partial class Program
{
    /// <summary>
    /// Accepts Render Internal Database URLs (postgres:// / postgresql://) or classic Npgsql key=value strings.
    /// </summary>
    private static string NormalizePostgresConnectionString(string raw)
    {
        var value = raw.Trim().Trim('"', '\'');

        if (value.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) ||
            value.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
        {
            if (!Uri.TryCreate(value, UriKind.Absolute, out var uri))
            {
                throw new InvalidOperationException(
                    "ConnectionStrings__DefaultConnection looks like a Postgres URL but is invalid. " +
                    "Copy Internal Database URL from Render (must include user:password@host/db).");
            }

            var userInfo = uri.UserInfo.Split(':', 2);
            if (userInfo.Length != 2 || string.IsNullOrEmpty(uri.Host) || string.IsNullOrEmpty(uri.AbsolutePath.Trim('/')))
            {
                throw new InvalidOperationException(
                    "Postgres URL is missing user, password, host, or database. " +
                    "Expected postgresql://USER:PASSWORD@HOST/DATABASE");
            }

            var username = Uri.UnescapeDataString(userInfo[0]);
            var password = Uri.UnescapeDataString(userInfo[1]);
            var database = Uri.UnescapeDataString(uri.AbsolutePath.Trim('/'));
            var port = uri.IsDefaultPort ? 5432 : uri.Port;

            // Render requires SSL.
            return
                $"Host={uri.Host};Port={port};Database={database};Username={username};Password={password};" +
                "SSL Mode=Require;Trust Server Certificate=true";
        }

        if (!value.Contains('=', StringComparison.Ordinal))
        {
            throw new InvalidOperationException(
                "ConnectionStrings__DefaultConnection must be a postgresql:// URL or Host=...;Username=...;Password=... string. " +
                $"Got length={value.Length}, starts with '{value[..Math.Min(12, value.Length)]}'.");
        }

        return value;
    }
}
