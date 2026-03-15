using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using NC.Core.Services;
using NC.Web.Server.Models;

namespace NC.Web.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(UserService userService, IConfiguration configuration) : ControllerBase
{

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        var user = await userService.ValidateUserAsync(request.Contact, request.Password, cancellationToken).ConfigureAwait(false);
        if (user == null)
            return Unauthorized(new { message = "Invalid contact or password." });

        var token = GenerateJwt(user.ID, user.Name, user.Contact);
        return Ok(new AuthResponse
        {
            Token = token,
            UserId = user.ID,
            Name = user.Name,
            Contact = user.Contact,
        });
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request, CancellationToken cancellationToken)
    {
        var (user, error) = await userService.CreateUserAsync(request.Name, request.Contact, request.Password, cancellationToken).ConfigureAwait(false);
        if (user == null)
            return BadRequest(new { message = error ?? "Registration failed." });

        var token = GenerateJwt(user.ID, user.Name, user.Contact);
        return Ok(new AuthResponse
        {
            Token = token,
            UserId = user.ID,
            Name = user.Name,
            Contact = user.Contact,
        });
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<AuthResponse>> Me(CancellationToken cancellationToken)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var user = await userService.GetByIdAsync(userId, cancellationToken).ConfigureAwait(false);
        if (user == null)
            return Unauthorized();

        return Ok(new AuthResponse
        {
            Token = "", // Client should keep existing token
            UserId = user.ID,
            Name = user.Name,
            Contact = user.Contact,
        });
    }

    private string GenerateJwt(Guid userId, string name, string contact)
    {
        var key = configuration["Jwt:Secret"] ?? throw new InvalidOperationException("Jwt:Secret is not configured.");
        var issuer = configuration["Jwt:Issuer"] ?? "NoobzCord";
        var audience = configuration["Jwt:Audience"] ?? "NoobzCord";
        var expirationMinutes = int.TryParse(configuration["Jwt:ExpirationMinutes"], out var min) ? min : 60;

        var keyBytes = System.Text.Encoding.UTF8.GetBytes(key);
        if (keyBytes.Length < 32)
            throw new InvalidOperationException("Jwt:Secret must be at least 32 characters for HS256.");

        var signingKey = new SymmetricSecurityKey(keyBytes);
        var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Name, name),
            new Claim(ClaimTypes.Email, contact),
        };

        var token = new JwtSecurityToken(
            issuer,
            audience,
            claims,
            expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
