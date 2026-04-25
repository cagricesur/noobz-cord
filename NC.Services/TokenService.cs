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
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;


namespace NC.Services
{
    public class TokenService(NoobzCordContext context, IOptions<JwtSettings> jwtSettings) : ITokenService
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
        public ActivationTokenData CreateActivationToken()
        {
            return new ActivationTokenData() { Pin = GenerateActivationCode(6) };
        }
        public async Task<JwtTokenData> CreateJwtToken(Guid userID, string userName, UserRoleEnum userRole, CancellationToken cancellationToken)
        {
            var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Value.Secret));
            var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userID.ToString()),
                new Claim(ClaimTypes.Role, userRole.ToString()),
            };

            var expires = DateTime.UtcNow.AddSeconds(jwtSettings.Value.Expiration);
            var jwtSecurityToken = new JwtSecurityToken(
                jwtSettings.Value.Issuer,
                jwtSettings.Value.Audience,
                claims,
                expires,
                signingCredentials: credentials);
            var jwtToken = new JwtSecurityTokenHandler().WriteToken(jwtSecurityToken);

            var token = new Token()
            {
                Expires = expires.AddDays(1),
                ID = Guid.NewGuid(),
                UserID = userID,
                Data = jwtToken,
                Status = TokenStatusEnum.Active.ToByte(),
            };

            await context.Tokens.AddAsync(token, cancellationToken);
            await context.SaveChangesAsync(cancellationToken);

            return new JwtTokenData()
            {
                Token = jwtToken,
                RefreshToken = token.ID,
                Expires = expires
            };
        }

        public async Task<RefreshTokenResponse> RefreshJwtToken(RefreshTokenRequest request, Guid userID, string? jwtToken, CancellationToken cancellationToken)
        {
            var response = new RefreshTokenResponse();
            response.SetError(StatusCodes.Status400BadRequest, "ERROR.TOKENSERVICE.REFRESHJWTTOKEN.INVADLIDREQUEST");
            if (jwtToken != null)
            {
                jwtToken = jwtToken.Split("Bearer").Last().Trim();
                var token = await context.Tokens.FirstOrDefaultAsync(entity => entity.ID == request.RefreshToken, cancellationToken);
                if (token != null &&  token.Status == TokenStatusEnum.Active.ToByte())
                {
                    if (token.Expires < DateTime.UtcNow)
                    {
                        token.Status = TokenStatusEnum.Expired.ToByte();
                        await context.SaveChangesAsync(cancellationToken);
                    }
                    else if(token.UserID == userID && token.Data == jwtToken)
                    {
                        var user = await context.Users.FirstOrDefaultAsync(entity => entity.ID == userID, cancellationToken);
                        if (user != null)
                        {
                            token.UsedOn = DateTime.UtcNow;
                            token.Status = TokenStatusEnum.Passive.ToByte();
                            await context.SaveChangesAsync(cancellationToken);

                            response.TokenData = await CreateJwtToken(userID, user.Name, user.Role.ToEnum<UserRoleEnum>(), cancellationToken);
                            response.SetSuccess();
                        }
                    }
                }
            }
            return response;
        }
    }
}
