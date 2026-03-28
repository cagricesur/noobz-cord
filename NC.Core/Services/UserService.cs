using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using NC.Core.Helpers;
using NC.Core.Models;
using NC.Core.Models.Contracts;
using NC.Core.Models.Settings;
using NC.Data.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace NC.Core.Services
{
    public class UserService(NoobzCordContext context, ParameterService parameterService, MailService mailService, IOptions<JwtSettings> jwtSettings, IOptions<AppSettings> appSettings)
    {
        private string GenerateJwt(User user)
        {
            var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Value.Secret));
            var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.ID.ToString()),
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Email, user.Contact),
                new Claim(ClaimTypes.Role, ((UserRoleEnum)user.Role).ToString()),
            };

            var token = new JwtSecurityToken(
                jwtSettings.Value.Issuer,
                jwtSettings.Value.Audience,
                claims,
                expires: DateTime.UtcNow.AddSeconds(jwtSettings.Value.Expiration),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public async Task<ServiceResponse<LoginResponse>> Login(LoginRequest request, CancellationToken cancellationToken)
        {
            var response = new ServiceResponse<LoginResponse>();
            response.SetError(StatusCodes.Status401Unauthorized, "ERROR.LOGIN.UNAUTHORIZED");

            var user = await context.Users.FirstOrDefaultAsync(entity => entity.Contact == request.Contact, cancellationToken);

            if (user != null)
            {
                var status = (UserStatusEnum)user.Status;
                switch (status)
                {
                    case UserStatusEnum.WaitingForActivation:
                        response.SetError(StatusCodes.Status401Unauthorized, "ERROR.LOGIN.PENDINGACTIVATION");
                        break;
                    case UserStatusEnum.Active:
                        var userPassword = await context.UserPasswords.FirstOrDefaultAsync(entity => entity.UserID == user.ID, cancellationToken);
                        if (userPassword != null && HashHelper.Verify(request.Password, userPassword.Hash))
                        {
                            response.SetSuccess(StatusCodes.Status200OK, new LoginResponse()
                            {
                                Name = user.Name,
                                Token = GenerateJwt(user),
                                Role = (UserRoleEnum)user.Role
                            });
                        }
                        break;
                }
            }
            return response;
        }


        public async Task<ServiceResponse<RegistrationResponse>> Register(RegistrationRequest request, CancellationToken cancellationToken)
        {
            var response = new ServiceResponse<RegistrationResponse>();
            var exists = await context.Users.AnyAsync(entity => entity.Name == request.Name || entity.Contact == request.Contact, cancellationToken);
            if (exists)
            {
                response.SetError(StatusCodes.Status400BadRequest, "ERROR.REGISTER.EXISTINGUSER");
            }
            else
            {

                var registration = DateTime.UtcNow;
                var expiration = registration.AddMinutes(5);
                var token = Guid.NewGuid();

                var user = new User
                {
                    ID = Guid.NewGuid(),
                    Name = request.Name,
                    Contact = request.Contact,
                    RegistrationDate = registration,
                    Status = (byte)UserStatusEnum.WaitingForActivation,
                    Role = (byte)UserRoleEnum.Member
                };
                var hash = HashHelper.Hash(request.Password);
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

                response.SetSuccess(StatusCodes.Status201Created, new RegistrationResponse()
                {
                    Name = user.Name
                });
            }

            return response;
        }

        public async Task<ServiceResponse<ActivationResponse>> Activate(ActivationRequest request, CancellationToken cancellationToken)
        {
            var response = new ServiceResponse<ActivationResponse>();
            response.SetError(StatusCodes.Status400BadRequest, "");
            var token = await context.UserTokens.FirstOrDefaultAsync(entity => entity.ID == request.Token, cancellationToken);

            if (token != null && token.Status == (byte)UserTokenStatus.Ready && token.Expires > DateTime.UtcNow)
            {
                var user = await context.Users.FirstOrDefaultAsync(entity => entity.ID == token.UserID, cancellationToken);
                if (user != null && user.Status == (byte)UserStatusEnum.WaitingForActivation)
                {
                    user.Status = (byte)UserStatusEnum.Active;
                    token.Status = (byte)UserTokenStatus.Used;
                    token.UsedAt = DateTime.UtcNow;
                    await context.SaveChangesAsync(cancellationToken);
                    response.SetSuccess(StatusCodes.Status200OK);
                }
            }

            return response;
        }
    }
}
