namespace NC.Models.Data
{
    public class JwtTokenData
    {
        public required string Token { get; set;  }
        public required Guid RefreshToken { get; set; }
        public required DateTime Expires { get; set; }
    }
}
