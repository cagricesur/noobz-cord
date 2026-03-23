using Microsoft.AspNetCore.Mvc;
using NC.Core.Models.Contracts;
using NC.Core.Services;

namespace NC.Web.Server.Controllers;
public class AuthController(UserService userService) : BaseController
{

    [HttpPost]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<LoginResponse>(StatusCodes.Status200OK)]
    public async Task<IActionResult> Login(LoginRequest request, CancellationToken cancellationToken)
    {
        var response = await userService.Login(request, cancellationToken);
        return response.ToControllerResponse();
    }

    [HttpPost]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<RegistrationResponse>(StatusCodes.Status201Created)]
    public async Task<IActionResult> Register(RegistrationRequest request, CancellationToken cancellationToken)
    {
        var response= await userService.Register(request, cancellationToken);
        return response.ToControllerResponse();
    }

    [HttpPost]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ActivationResponse>(StatusCodes.Status200OK)]
    public async Task<IActionResult> Activate(ActivationRequest request, CancellationToken cancellationToken)
    {
        var response = await userService.Activate(request, cancellationToken);
        return response.ToControllerResponse();
    }
}
