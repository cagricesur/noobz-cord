using NC.Models.Data;

namespace NC.Models.Contracts
{
    public class RefreshTokenResponse : ServiceResponse
    {
        public JwtTokenData? TokenData { get; set; }
    }
}
