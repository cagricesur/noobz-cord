using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NC.Core;
using NC.Models;
using NC.Models.Contracts;
using NC.Models.Definitions;
using System.Security.Claims;

namespace NC.Web.Server.Controllers;

[Authorize]
public class ConferenceController(IConferenceService conferenceService) : ServiceController
{
    [HttpGet]
    [ProducesResponseType<ConferenceResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ServiceError>(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Join(CancellationToken cancellationToken)
    {
        var claim = User.Claims.FirstOrDefault(entity => entity.Type == ClaimTypes.NameIdentifier);
        if (claim != null && Guid.TryParse(claim.Value, out var userId))
        {
            return (await conferenceService.Join(new ConferenceRequest(), userId, cancellationToken)).ToControllerResponse();
        }
        return BadRequest(new ServiceError { Code = "ERROR.CONFERENCECONTROLLER.JOIN.INVADLIDREQUEST" });
    }
}
