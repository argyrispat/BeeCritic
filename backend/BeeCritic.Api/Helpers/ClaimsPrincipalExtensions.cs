using System.Security.Claims;

namespace BeeCritic.Api.Helpers;

public static class ClaimsPrincipalExtensions
{
    public static Guid GetUserId(this ClaimsPrincipal user)
    {
        var value = user.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? user.FindFirstValue("sub");

        if (value is null || !Guid.TryParse(value, out var id))
            throw new UnauthorizedAccessException("Invalid user identity.");

        return id;
    }

    public static Guid? TryGetUserId(this ClaimsPrincipal user)
    {
        if (user.Identity?.IsAuthenticated != true)
            return null;

        var value = user.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? user.FindFirstValue("sub");

        return value is not null && Guid.TryParse(value, out var id) ? id : null;
    }
}
