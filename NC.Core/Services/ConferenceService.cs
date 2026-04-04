using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using NC.Core.Models;
using NC.Core.Models.Contracts;
using NC.Core.Models.Settings;
using System.IdentityModel.Tokens.Jwt;
using System.Text;

namespace NC.Core.Services
{
    public class ConferenceService(UserService userService, IOptions<LiveKitSettings> liveKitSettings)
    {
        public async Task<ServiceResponse<ConferenceResponse>> Join(ConferenceRequest request, CancellationToken cancellationToken)
        {
            var response = new ServiceResponse<ConferenceResponse>();

            var user = await userService.GetUser(request.UserID, cancellationToken);

            if(user == null)
               response.SetError(StatusCodes.Status404NotFound, "ERROR.USERNOTFOUND");

            if (user != null)
            {
                var validFor = TimeSpan.FromMinutes(1);
                var now = DateTime.UtcNow;
                var nbf = new DateTimeOffset(now);
                var exp = new DateTimeOffset(now.Add(validFor));

                var videoGrant = new Dictionary<string, object>
                {
                    ["room"] = liveKitSettings.Value.RoomName,
                    ["roomJoin"] = true,
                    ["canPublish"] = true,
                    ["canPublishData"] = true,
                    ["canSubscribe"] = true,
                    ["canUpdateOwnMetadata"] = true,
                };

                var payload = new JwtPayload
                {
                    { JwtRegisteredClaimNames.Iss, liveKitSettings.Value.ApiKey },
                    { JwtRegisteredClaimNames.Sub, request.UserID },
                    { JwtRegisteredClaimNames.Name, user.Name  },
                    { JwtRegisteredClaimNames.Nbf, nbf.ToUnixTimeSeconds() },
                    { JwtRegisteredClaimNames.Exp, exp.ToUnixTimeSeconds() },
                    { "video", videoGrant },
                };

                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(liveKitSettings.Value.ApiSecret));
                var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
                var header = new JwtHeader(creds);
                var token = new JwtSecurityToken(header, payload);
                response.SetSuccess(new ConferenceResponse
                {
                    Server = liveKitSettings.Value.Server,
                    Room = liveKitSettings.Value.RoomName,
                    Token = new JwtSecurityTokenHandler().WriteToken(token)
                });
            }
            return response;
        }
    }
}
