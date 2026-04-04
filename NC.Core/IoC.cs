using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NC.Core.Models.Settings;
using NC.Core.Services;
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

        public static IServiceCollection AddNoobzCordServices(this IServiceCollection services, IConfiguration configuration)
        {
           

            return services
                    .Configure<AppSettings>(configuration.GetSection(AppSettings.Section))
                    .Configure<JwtSettings>(configuration.GetSection(JwtSettings.Section))
                    .Configure<SmtpSettings>(configuration.GetSection(SmtpSettings.Section))
                    .Configure<LiveKitSettings>(configuration.GetSection(LiveKitSettings.Section))
                    .AddSingleton<CacheService>()
                    .AddScoped<MailService>()
                    .AddScoped<UserService>()
                    .AddScoped<ConferenceService>()
                    .AddScoped<ParameterService>();
        }
    }
}
