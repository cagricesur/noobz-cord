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
        var claim = User.Claims.FirstOrDefault(entity => entity.Type == ClaimTypes.Name);

        var request = new ConferenceRequest()
        {
            Name = claim?.Value ?? "Unknown"
        };
        var response = await conferenceService.Join(request, cancellationToken);
        return response.ToControllerResponse();
    }
}
