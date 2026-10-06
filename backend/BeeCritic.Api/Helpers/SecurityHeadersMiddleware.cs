namespace BeeCritic.Api.Helpers;

/// <summary>
/// Applies baseline security headers to API responses.
/// HSTS is only added when the request is HTTPS (typical production behind TLS).
/// CSP is intentionally permissive enough for a JSON API and Swagger UI in Development.
/// </summary>
public class SecurityHeadersMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IHostEnvironment _env;

    public SecurityHeadersMiddleware(RequestDelegate next, IHostEnvironment env)
    {
        _next = next;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        context.Response.OnStarting(() =>
        {
            var headers = context.Response.Headers;

            headers["X-Content-Type-Options"] = "nosniff";
            headers["X-Frame-Options"] = "DENY";
            headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
            headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()";
            headers["X-Permitted-Cross-Domain-Policies"] = "none";

            // API returns JSON; keep CSP tight. Swagger needs a slightly looser policy in Development.
            headers["Content-Security-Policy"] = _env.IsDevelopment()
                ? "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
                : "default-src 'none'; frame-ancestors 'none'; base-uri 'none'";

            if (context.Request.IsHttps)
            {
                headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains";
            }

            return Task.CompletedTask;
        });

        await _next(context);
    }
}
