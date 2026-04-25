using Microsoft.AspNetCore.Mvc;
using NC.Core;
using NC.Models;
using NC.Models.Contracts;
using NC.Models.Definitions;
using System.Security.Claims;

namespace NC.Web.Server.Controllers;

public class TokenController(ITokenService tokenService) : ServiceController
{
    [HttpPost]
    [ProducesResponseType<RefreshTokenResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ServiceError>(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RefreshJwtToken(RefreshTokenRequest request, CancellationToken cancellationToken)
    {
        var claim = User.Claims.FirstOrDefault(entity => entity.Type == ClaimTypes.NameIdentifier);
        if (claim != null && Guid.TryParse(claim.Value, out var userId))
        {
            return (await tokenService.RefreshJwtToken(request, userId, Request.Headers.Authorization.FirstOrDefault(), cancellationToken)).ToControllerResponse();
        }
        return BadRequest(new ServiceError { Code = "ERROR.TOKENCONTROLLER.REFRESHJWTTOKEN.INVADLIDREQUEST" });
    }
}
