using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using NC.Data.Models;

namespace NC.Core
{
    public static class IoC
    {
        public static IServiceCollection AddNoobzCordDbContext(this IServiceCollection services, string? connectionString)
        {
            return services.AddDbContext<NoobzCordContext>(options =>
            {
                options.UseSqlServer(connectionString);
            });
        }
    }
}
