using Microsoft.EntityFrameworkCore;
using NC.Core.Models;
using NC.Core.Models.Transfer;
using NC.Data.Models;

namespace NC.Core.Services
{
    public class ChannelService(NoobzCordContext context)
    {
        public async Task<List<ChannelData>> GetChannels()
        {
            return [.. (await context.Channels
                                        .Where(entity=> entity.Status == (byte)ChannelStatusEnum.Active)
                                        .ToListAsync())
                                        .Select(entity=> new ChannelData()
                                        {
                                             ID = entity.ID,
                                             Name = entity.Name,
                                             Kind = (ChannelKindEnum)entity.Kind
                                        })];
        }
    }
}
