using Microsoft.AspNetCore.Mvc;
using NC.Core.Services;

namespace NC.Web.Server.Controllers
{
    public class CacheController(CacheService cacheService) : BaseController
    {
        [HttpPost]
        public Task Remove([FromQuery] string key)
        {
            cacheService.Remove(key);
            return Task.FromResult(Ok());
        }

        [HttpPost]
        public Task Clear()
        {
            cacheService.Clear();
            return Task.FromResult(Ok());
        }
    }
}
