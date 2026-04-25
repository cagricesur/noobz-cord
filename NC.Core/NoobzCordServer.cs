using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using NC.Entities.Models;
using NC.Models.Definitions;
using NC.Models.Settings;
using NC.Services;
using Scalar.AspNetCore;
using System.Text;
using System.Text.Json.Serialization;

namespace NC.Core
{
    internal static class NoobzCordServerExtensions
    {
        internal static void ConfigureSettings(this WebApplicationBuilder builder, out JwtSettings jwtSettings)
        {
            var jwtSection = builder.Configuration.GetSection(JwtSettings.Section);
            builder.Services
                   .Configure<JwtSettings>(jwtSection)
                   .Configure<SmtpSettings>(builder.Configuration.GetSection(SmtpSettings.Section))
                   .Configure<LiveKitSettings>(builder.Configuration.GetSection(LiveKitSettings.Section));

            jwtSettings = new JwtSettings()
            {
                Audience = "",
                Expiration = 0,
                Issuer = "",
                Secret = ""
            };
            jwtSection.Bind(jwtSettings);
        }
        internal static void ConfigureServices(this WebApplicationBuilder builder)
        {
            builder.Services
                    .AddSingleton<ICacheService, CacheService>()
                    .AddScoped<IUserService, UserService>()
                    .AddScoped<ITokenService, TokenService>()
                    .AddScoped<IConferenceService, ConferenceService>()
                    .AddScoped<ITranslationService, TranslationService>()
                    .AddScoped<IHttpContextService, HttpContextService>();
        }

        internal static void ConfigureDbContext(this WebApplicationBuilder builder)
        {
            builder.Services.AddDbContext<NoobzCordContext>(options =>
            {
                options.UseSqlServer(builder.Configuration.GetConnectionString("NoobzCord"));
            });
        }
    }
    public class NoobzCordServer
    {
        public static void Run(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Services
                .AddControllers()
                .AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
                });
            builder.Services.ConfigureHttpJsonOptions(options =>
            {
                options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
            });
            builder.Services.AddOpenApi();
            builder.Services.AddMemoryCache(options => builder.Configuration.GetSection("MemoryCache").Bind(options));
            builder.ConfigureSettings(out JwtSettings jwtSettings);
            builder.ConfigureDbContext();
            builder.ConfigureServices();
            builder.Services.AddHttpContextAccessor();
            builder.Services.AddSignalR();


            builder.Services
                .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.Events = new JwtBearerEvents
                    {
                        OnMessageReceived = context =>
                        {
                            var accessToken = context.Request.Query["access_token"];
                            var path = context.HttpContext.Request.Path;

                            if (!string.IsNullOrEmpty(accessToken) &&
                                path.StartsWithSegments("/hubs/noobzcord"))
                            {
                                context.Token = accessToken;
                            }

                            return Task.CompletedTask;
                        }
                    };
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Secret)),
                        ValidIssuer = jwtSettings.Issuer,
                        ValidAudience = jwtSettings.Audience,
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ClockSkew = TimeSpan.FromMinutes(2),
                    };
                });

            var app = builder.Build();

            app.UseDefaultFiles();
            app.MapStaticAssets();

            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
                app.MapScalarApiReference();
            }

            app.UseHttpsRedirection();

            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();

            app.MapHub<NoobzCordHub>("/hubs/noobzcord");
            app.MapFallbackToFile("/index.html");

            app.Run();

        }
    }
}
