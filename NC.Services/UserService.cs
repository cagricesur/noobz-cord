using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using NC.Entities.Models;
using NC.Models;
using NC.Models.Contracts;
using NC.Models.Data;
using NC.Models.Definitions;
using NC.Models.Settings;
using NC.Utils;
using NC.Utils.Helpers;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;

namespace NC.Services
{
    public class UserService(NoobzCordContext context, ITranslationService translationService, IHttpContextService httpContextService, IOptions<JwtSettings> jwtSettings, IOptions<SmtpSettings> smtpSettings) : IUserService
    {

        private static string GenerateActivationCode(int length)
        {
            var pins = new List<int>();
            var random = new Random();
            for (int i = 0; i < length; i++)
            {
                pins.Add(random.Next(i == 0 ? 1 : 0, 10));
            }
            return string.Join("", pins);
        }
        private string GenerateJwt(User user)
        {
            var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Value.Secret));
            var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.ID.ToString()),
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Role, user.Role.ToEnum<UserRoleEnum>().ToString()),
            };

            var token = new JwtSecurityToken(
                jwtSettings.Value.Issuer,
                jwtSettings.Value.Audience,
                claims,
                expires: DateTime.UtcNow.AddSeconds(jwtSettings.Value.Expiration),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
        public async Task<RegistrationResponse> Register(RegistrationRequest request, CancellationToken cancellationToken)
        {
            var response = new RegistrationResponse();

            if (await context.Users.AnyAsync(entity => entity.Name == request.Name || entity.Contact == request.Contact, cancellationToken))
            {
                response.SetError(StatusCodes.Status400BadRequest, "ERROR.USERSERVICE.REGISTRATION.ERROR");
            }
            else
            {
                var tokenData = new ActivationTokenData()
                {
                    Pin = GenerateActivationCode(6)
                };

                var user = new User()
                {
                    Contact = request.Contact,
                    ID = Guid.NewGuid(),
                    Name = request.Name,
                    RegistrationDate = DateTime.UtcNow,
                    Role = UserRoleEnum.Member.ToByte(),
                    Status = UserStatusEnum.Pending.ToByte(),
                };

                var password = new UserPassword()
                {
                    Hash = HashHelper.Hash(request.Password),
                    UserID = user.ID
                };

                var token = new Token()
                {
                    Data = Convert.ToBase64String(JsonSerializer.SerializeToUtf8Bytes(tokenData)),
                    Expires = DateTime.UtcNow.AddHours(1),
                    ID = Guid.NewGuid(),
                    Status = TokenStatusEnum.Active.ToByte(),
                    UserID = user.ID
                };

                await context.Users.AddAsync(user, cancellationToken);
                await context.UserPasswords.AddAsync(password, cancellationToken);
                await context.Tokens.AddAsync(token, cancellationToken);
                await context.SaveChangesAsync(cancellationToken);

                var language = httpContextService.Language();
                var title = await translationService.GetTranslation(language, "REGISTRATION.MAILTITLE", cancellationToken);
                var htmlContent = await translationService.GetTranslation(language, "REGISTRATION.HTMLCONTENT", cancellationToken);
                htmlContent = htmlContent.Replace("{{YEAR}}", DateTime.UtcNow.Year.ToString());
                htmlContent = htmlContent.Replace("{{USER_NAME}}", user.Name);
                htmlContent = htmlContent.Replace("{{ACTIVATION_CODE}}", tokenData.Pin);
                var tz = TimeZoneInfo.FindSystemTimeZoneById("Europe/Istanbul");
                var dto = TimeZoneInfo.ConvertTime(token.Expires, tz);
                htmlContent = htmlContent.Replace("{{EXPIRES_AT}}", dto.ToString("yyyy-MM-dd HH:mm:ss zzz") + " (" + tz.Id + ")");

                await MailHelper.SendMail(smtpSettings.Value, user.Contact, title, string.Empty, htmlContent, cancellationToken);
                response.Token = token.ID;
                response.TokenHash = HashHelper.Hash(string.Join(".", token.ID, user.ID));
            }

            return response;
        }
        public async Task<ActivationResponse> Activate(ActivationRequest request, CancellationToken cancellationToken)
        {
            var response = new ActivationResponse();
            response.SetError(StatusCodes.Status400BadRequest, "ERROR.USERSERVICE.ACTIVATION.ERROR");
            var token = await context.Tokens.FirstOrDefaultAsync(entity => entity.ID == request.Token, cancellationToken);
            if (token != null && token.Status == TokenStatusEnum.Active.ToByte())
            {
                if (token.Expires < DateTime.UtcNow)
                {
                    token.Status = TokenStatusEnum.Expired.ToByte();
                    await context.SaveChangesAsync(cancellationToken);
                }
                else if (token.Data != null && HashHelper.Verify(string.Join(".", token.ID, token.UserID), request.TokenHash))
                {
                    var data = JsonSerializer.Deserialize<ActivationTokenData>(Convert.FromBase64String(token.Data));
                    if (data != null && data.Pin == request.Pin)
                    {
                        var user = await context.Users.FirstOrDefaultAsync(entity => entity.ID == token.UserID, cancellationToken);
                        if (user != null && user.Status.ToEnum<UserStatusEnum>() == UserStatusEnum.Pending)
                        {
                            user.Status = UserStatusEnum.Active.ToByte();
                            token.Status = TokenStatusEnum.Passive.ToByte();
                            await context.SaveChangesAsync(cancellationToken);
                            response.SetSuccess();
                        }
                    }
                }
            }
            return response;
        }
        public async Task<LoginResponse> Login(LoginRequest request, CancellationToken cancellationToken)
        {
            var response = new LoginResponse();

            var q = await context.Users
                                 .Include(entity => entity.UserPassword)
                                 .FirstOrDefaultAsync(entity => entity.Contact == request.Contact, cancellationToken);

            if(q != null && q.UserPassword != null && HashHelper.Verify(request.Password, q.UserPassword.Hash))
            {
                response.Token = GenerateJwt(q);
                response.User = new UserData() { Name = q.Name };
            }
            else
            {
                response.SetError(StatusCodes.Status400BadRequest, "ERROR.USERSERVICE.LOGIN.ERROR");
            }

            return response;
        }

        
        public async Task<Guid?> GetUserID(string name, CancellationToken cancellationToken)
        {
            return (await context.Users.FirstOrDefaultAsync(entity => entity.Name == name, cancellationToken))?.ID;
        }
    }
}
