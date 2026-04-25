using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using NC.Entities.Models;
using NC.Models;
using NC.Models.Contracts;
using NC.Models.Data;
using NC.Models.Definitions;
using NC.Models.Settings;
using NC.Utils;
using NC.Utils.Helpers;
using System.Text.Json;

namespace NC.Services
{
    public class UserService(NoobzCordContext context, ITokenService tokenService, ITranslationService translationService, IHttpContextService httpContextService, IOptions<SmtpSettings> smtpSettings) : IUserService
    {
        public async Task<RegistrationResponse> Register(RegistrationRequest request, CancellationToken cancellationToken)
        {
            var response = new RegistrationResponse();

            if (await context.Users.AnyAsync(entity => entity.Name == request.Name || entity.Contact == request.Contact, cancellationToken))
            {
                response.SetError(StatusCodes.Status400BadRequest, "ERROR.USERSERVICE.REGISTRATION.ERROR");
            }
            else
            {
                var tokenData = tokenService.CreateActivationToken();
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
                            token.UsedOn = DateTime.UtcNow;
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

            var user = await context.Users
                                 .Include(entity => entity.UserPassword)
                                 .FirstOrDefaultAsync(entity => entity.Contact == request.Contact, cancellationToken);

            if(user != null && user.UserPassword != null && HashHelper.Verify(request.Password, user.UserPassword.Hash))
            {
                var userRole = user.Role.ToEnum<UserRoleEnum>();
                response.TokenData = await tokenService.CreateJwtToken(user.ID, user.Name, userRole, cancellationToken);
                response.UserData = new UserData() { Name = user.Name, Role = userRole };
            }
            else
            {
                response.SetError(StatusCodes.Status400BadRequest, "ERROR.USERSERVICE.LOGIN.ERROR");
            }

            return response;
        }

        
        public async Task<UserData?> GetUser(Guid userID, CancellationToken cancellationToken)
        {
            var user = await context.Users.FirstOrDefaultAsync(entity => entity.ID == userID, cancellationToken);
            if (user != null)
            {
                return new UserData() { Name = user.Name, Role = user.Role.ToEnum<UserRoleEnum>() };

            }
            else
            {
                return null;
            }
        }
    }
}
