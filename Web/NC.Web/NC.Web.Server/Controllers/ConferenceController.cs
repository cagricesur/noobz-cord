using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NC.Core.Models.Contracts;
using NC.Core.Services;
using System.Security.Claims;

namespace NC.Web.Server.Controllers;

[Authorize]
public sealed class ConferenceController(ConferenceService conferenceService) : BaseController
{

    [HttpPost]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ConferenceResponse>(StatusCodes.Status200OK)]
    public async Task<IActionResult> Join( CancellationToken cancellationToken)
    {
        var claim = User.Claims.FirstOrDefault(entity => entity.Type == ClaimTypes.NameIdentifier);
        if(claim != null && Guid.TryParse(claim.Value, out Guid userID))
        {
            var request = new ConferenceRequest()
            {
                UserID = userID
            };
            var response = await conferenceService.Join(request, cancellationToken);
            return response.ToControllerResponse();
        }
        return Unauthorized();
    }


}
