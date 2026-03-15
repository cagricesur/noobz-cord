using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using NC.Core;
using Scalar.AspNetCore;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddNoobzCordDbContext(builder.Configuration.GetConnectionString("NoobzCord"));
builder.Services.AddNoobzCordServices();

var jwtSecret = builder.Configuration["Jwt:Secret"] ?? throw new InvalidOperationException("Jwt:Secret must be set in configuration (e.g. appsettings.json or environment).");
var key = Encoding.UTF8.GetBytes(jwtSecret);
if (key.Length < 32)
    throw new InvalidOperationException("Jwt:Secret must be at least 32 characters for HS256.");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "NoobzCord",
            ValidAudience = builder.Configuration["Jwt:Audience"] ?? "NoobzCord",
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

app.MapFallbackToFile("/index.html");

app.Run();
