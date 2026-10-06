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

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' is missing.");

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

public partial class Program;
