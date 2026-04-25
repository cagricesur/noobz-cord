
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using NC.Models.Contracts;
using NC.Models.Definitions;
using NC.Models.Settings;
using System.IdentityModel.Tokens.Jwt;
using System.Text;



namespace NC.Services
{
    public class ConferenceService(IUserService userService, IOptions<LiveKitSettings> liveKitSettings) : IConferenceService
    {
        public async Task<ConferenceResponse> Join(ConferenceRequest request, Guid userID, CancellationToken cancellationToken)
        {
            var response = new ConferenceResponse();

            var user = await userService.GetUser(userID, cancellationToken);

            if (user == null)
            {
                response.SetError(StatusCodes.Status404NotFound, "ERROR.USERNOTFOUND");
            }
            else
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
                        { JwtRegisteredClaimNames.Sub, userID},
                        { JwtRegisteredClaimNames.Name, user.Name },
                        { JwtRegisteredClaimNames.Nbf, nbf.ToUnixTimeSeconds() },
                        { JwtRegisteredClaimNames.Exp, exp.ToUnixTimeSeconds() },
                        { "video", videoGrant },
                    };

                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(liveKitSettings.Value.ApiSecret));
                var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
                var header = new JwtHeader(creds);
                var token = new JwtSecurityToken(header, payload);
                response.Server = liveKitSettings.Value.Server;
                response.Room = liveKitSettings.Value.RoomName;
                response.Token = new JwtSecurityTokenHandler().WriteToken(token);
                response.SetSuccess();
            }
            return response;
        }
    }
}
