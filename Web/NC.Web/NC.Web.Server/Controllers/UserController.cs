using Microsoft.AspNetCore.Mvc;
using NC.Core;
using NC.Models;
using NC.Models.Contracts;
using NC.Models.Definitions;

namespace NC.Web.Server.Controllers;
public class UserController(IUserService userService) : ServiceController
{
    [HttpPost]
    [ProducesResponseType<RegistrationResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ServiceError>(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register(RegistrationRequest request, CancellationToken cancellationToken)
    {
        return (await userService.Register(request, cancellationToken)).ToControllerResponse();
    }

    [HttpPost]
    [ProducesResponseType<ActivationResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ServiceError>(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Activate(ActivationRequest request, CancellationToken cancellationToken)
    {
        return (await userService.Activate(request, cancellationToken)).ToControllerResponse();
    }

    [HttpPost]
    [ProducesResponseType<LoginResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ServiceError>(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Login(LoginRequest request, CancellationToken cancellationToken)
    {
        return (await userService.Login(request, cancellationToken)).ToControllerResponse();
    }
}
