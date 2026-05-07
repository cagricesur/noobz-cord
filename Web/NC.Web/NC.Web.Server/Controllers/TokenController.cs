using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NC.Core;
using NC.Models;
using NC.Models.Contracts;
using NC.Models.Definitions;

namespace NC.Web.Server.Controllers;

public class TokenController(ITokenService tokenService) : ServiceController
{
    [AllowAnonymous]
    [HttpPost]
    [ProducesResponseType<RefreshTokenResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ServiceError>(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RefreshJwtToken(RefreshTokenRequest request, CancellationToken cancellationToken)
    {
        return (await tokenService.RefreshJwtToken(request, Request.Headers.Authorization.FirstOrDefault(), cancellationToken)).ToControllerResponse();
    }
}
