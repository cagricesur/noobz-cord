using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using NC.Core.Models;
using NC.Data.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace NC.Core.Services
{
    public class UserService(NoobzCordContext context, ParameterService parameterService, MailService mailService, IOptions<JwtSettings> jwtSettings, IOptions<AppSettings> appSettings)
    {
        private string GenerateJwt(Guid userId, string name, string contact)
        {
            var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Value.Secret));
            var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(ClaimTypes.Name, name),
                new Claim(ClaimTypes.Email, contact),
            };

            var token = new JwtSecurityToken(
                jwtSettings.Value.Issuer,
                jwtSettings.Value.Audience,
                claims,
                expires: DateTime.UtcNow.AddSeconds(jwtSettings.Value.Expiration),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public async Task<(string name, string token)> Login(string contact, string password, CancellationToken cancellationToken)
        {
            var user = await context.Users
                .Include(entity => entity.UserPassword)
                .FirstOrDefaultAsync(entity => entity.Contact == contact && entity.Status == (byte)UserStatusEnum.Active, cancellationToken);

            if (user != null && user.UserPassword != null && BCrypt.Net.BCrypt.Verify(password, user.UserPassword.Hash))
            {
                return (user.Name, GenerateJwt(user.ID, user.Name, user.Contact));
            }

            return ("", "");
        }


        public async Task<string?> Register(string name, string contact, string password, CancellationToken cancellationToken)
        {
            var exists = await context.Users
                .AnyAsync(u => u.Name == name || u.Contact == contact, cancellationToken);

            if (!exists)
            {

                var registration = DateTime.UtcNow;
                var expiration = registration.AddMinutes(5);
                var token = Guid.NewGuid();

                var user = new User
                {
                    ID = Guid.NewGuid(),
                    Name = name,
                    Contact = contact,
                    RegistrationDate = registration,
                    Status = (byte)UserStatusEnum.WaitingForActivation,
                    Role = 0,
                };
                var hash = BCrypt.Net.BCrypt.HashPassword(password, BCrypt.Net.BCrypt.GenerateSalt(12));
                var userPassword = new UserPassword
                {
                    UserID = user.ID,
                    Hash = hash,
                };
                var userToken = new UserToken
                {
                    ID = token,
                    Expires = expiration,
                    Status = (byte)UserTokenStatus.Ready,
                    UserID = user.ID,
                };

                await context.Users.AddAsync(user, cancellationToken);
                await context.UserPasswords.AddAsync(userPassword, cancellationToken);
                await context.UserTokens.AddAsync(userToken, cancellationToken);
                await context.SaveChangesAsync(cancellationToken);

                var htmlContent = await parameterService.GetParameter("REGISTRATION.HTMLCONTENT", cancellationToken) ?? string.Empty;
                htmlContent = htmlContent.Replace("{{YEAR}}", registration.Year.ToString());
                htmlContent = htmlContent.Replace("{{USER_NAME}}", user.Name);

                var publicUri = new Uri(appSettings.Value.PublicUrl);

                htmlContent = htmlContent.Replace("{{PUBLIC_URL}}", publicUri.ToString());
                htmlContent = htmlContent.Replace("{{ACTIVATION_URL}}", new Uri(publicUri, $"activation?token={token}").ToString());

                TimeZoneInfo tz = TimeZoneInfo.FindSystemTimeZoneById("Europe/Istanbul");
                DateTimeOffset dto = TimeZoneInfo.ConvertTime(expiration, tz);

                htmlContent = htmlContent.Replace("{{EXPIRES_AT}}", dto.ToString("yyyy-MM-dd HH:mm:ss zzz") + " (" + tz.Id + ")");

                await mailService.SendMail(user.Contact, "Welcome to NoobzCord", string.Empty, htmlContent, cancellationToken);

                return user.Name;
            }

            return null;
        }

        public async Task<bool> Activate(Guid idenitifer, CancellationToken cancellationToken)
        {
            var token = await context.UserTokens.FirstOrDefaultAsync(entity => entity.ID == idenitifer, cancellationToken);
            if (token != null)
            {
                if (token.Status == (byte)UserTokenStatus.Ready && token.Expires > DateTime.UtcNow)
                {
                    var user = await context.Users.FirstOrDefaultAsync(entity => entity.ID == token.UserID, cancellationToken);
                    if (user != null && user.Status == (byte)UserStatusEnum.WaitingForActivation)
                    {
                        user.Status = (byte)UserStatusEnum.Active;
                        token.Status = (byte)UserTokenStatus.Used;
                        token.UsedAt = DateTime.UtcNow;
                        await context.SaveChangesAsync(cancellationToken);
                        return true;
                    }
                }
                else
                {
                    token.Status = (byte)UserTokenStatus.Expired;
                    await context.SaveChangesAsync(cancellationToken);
                }
            }

            return false;
        }
    }
}
