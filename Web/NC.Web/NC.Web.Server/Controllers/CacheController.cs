using Microsoft.AspNetCore.Mvc;
using NC.Core.Services;

namespace NC.Web.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]

    public class CacheController(CacheService cacheService) : ControllerBase
    {
        [HttpPost("remove")]
        public Task Remove([FromQuery] string key)
        {
            cacheService.Remove(key);
            return Task.FromResult(Ok());
        }

        [HttpPost("clear")]
        public Task Clear()
        {
            cacheService.Clear();
            return Task.FromResult(Ok());
        }

    }
}
