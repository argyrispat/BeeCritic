using BeeCritic.Api.Data;
using BeeCritic.Api.DTOs;
using Microsoft.EntityFrameworkCore;

namespace BeeCritic.Api.Services;

public interface IUserService
{
    Task<UserProfileDto> GetByUsernameAsync(string username);
}

public class UserService : IUserService
{
    private readonly AppDbContext _db;

    public UserService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<UserProfileDto> GetByUsernameAsync(string username)
    {
        var user = await _db.Users
            .AsNoTracking()
            .Where(u => u.Username.ToLower() == username.ToLower())
            .Select(u => new UserProfileDto(
                u.Id,
                u.Username,
                u.CreatedAt,
                u.Reviews.Count
            ))
            .FirstOrDefaultAsync()
            ?? throw new AppException("User not found.", StatusCodes.Status404NotFound);

        return user;
    }
}
