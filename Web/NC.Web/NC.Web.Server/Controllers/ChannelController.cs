using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NC.Core.Models.Transfer;
using NC.Core.Services;

namespace NC.Web.Server.Controllers;

[Authorize]
public class ChannelController(ChannelService channelService) : BaseController
{

    [HttpGet]
    public Task<List<ChannelData>> GetChannels(CancellationToken cancellationToken)
    {
        return channelService.GetChannels();
    }
}
