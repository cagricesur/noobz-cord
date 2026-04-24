namespace NC.Models.Settings
{
    public class JwtSettings
    {
        public const string Section = nameof(JwtSettings);
        public required string Secret { get; set; }
        public required string Issuer { get; set; }
        public required string Audience { get; set; }
        public required int Expiration { get; set; }
    }
}
