using Microsoft.AspNetCore.Mvc;
using NC.Core.Services;
using NC.Web.Server.Models;

namespace NC.Web.Server.Controllers;

[ApiController]
[Route("api/[controller]/[action]")]
public class AuthController(UserService userService) : ControllerBase
{

    [HttpPost]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request, CancellationToken cancellationToken)
    {
        var (name, token) = await userService.Login(request.Contact, request.Password, cancellationToken);
        if (string.IsNullOrEmpty(token))
        {
            return Unauthorized();
        }

        return Ok(new AuthResponse
        {
            Token = token,
            Name = name
        });
    }

    [HttpPost]
    public async Task<ActionResult<AuthResponse>> Register(RegistrationRequest request, CancellationToken cancellationToken)
    {
        var name = await userService.Register(request.Name, request.Contact, request.Password, cancellationToken);
        if (string.IsNullOrEmpty(name))
        {
            return BadRequest();
        }

        return Ok(new AuthResponse
        {
            Name = name
        });
    }

    [HttpPost]
    public async Task<IActionResult> Activate(ActivationRequest request, CancellationToken cancellationToken)
    {
        if (Guid.TryParse(request.Token, out Guid identifier) && await userService.Activate(identifier, cancellationToken))
        {
            return Ok();
        }
        return BadRequest();
    }
}
