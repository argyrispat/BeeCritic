using BeeCritic.Api.Data;
using BeeCritic.Api.DTOs;
using BeeCritic.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace BeeCritic.Api.Services;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
}

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly IJwtTokenService _jwt;

    public AuthService(AppDbContext db, IJwtTokenService jwt)
    {
        _db = db;
        _jwt = jwt;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        if (request.Password != request.ConfirmPassword)
            throw new AppException("Passwords do not match.", StatusCodes.Status400BadRequest);

        if (!IsValidPassword(request.Password))
            throw new AppException("Password must be at least 8 characters and include a letter and a number.", StatusCodes.Status400BadRequest);

        var username = request.Username.Trim();
        var email = request.Email.Trim().ToLowerInvariant();

        if (!System.Text.RegularExpressions.Regex.IsMatch(username, @"^[a-zA-Z0-9_]+$"))
            throw new AppException("Username may only contain letters, numbers, and underscores.", StatusCodes.Status400BadRequest);

        if (await _db.Users.AnyAsync(u => u.Username.ToLower() == username.ToLower()))
            throw new AppException("Username is already taken.", StatusCodes.Status409Conflict);

        if (await _db.Users.AnyAsync(u => u.Email == email))
            throw new AppException("Email is already registered.", StatusCodes.Status409Conflict);

        var user = new User
        {
            Id = Guid.NewGuid(),
            Username = username,
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            CreatedAt = DateTime.UtcNow
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return new AuthResponse(_jwt.CreateToken(user), user.Id, user.Username, user.Email);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);

        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new AppException("Invalid email or password.", StatusCodes.Status401Unauthorized);

        return new AuthResponse(_jwt.CreateToken(user), user.Id, user.Username, user.Email);
    }

    private static bool IsValidPassword(string password)
    {
        if (password.Length < 8) return false;
        return password.Any(char.IsLetter) && password.Any(char.IsDigit);
    }
}
