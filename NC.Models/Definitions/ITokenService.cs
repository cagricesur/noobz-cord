using NC.Models.Contracts;
using NC.Models.Data;

namespace NC.Models.Definitions
{
    public interface ITokenService
    {
        ActivationTokenData CreateActivationToken();
        Task<JwtTokenData> CreateJwtToken(Guid userID, string userName, UserRoleEnum userRole, CancellationToken cancellationToken);

        Task<RefreshTokenResponse> RefreshJwtToken(RefreshTokenRequest request, Guid userID, string? jwtToken, CancellationToken cancellationToken);
    }
}
