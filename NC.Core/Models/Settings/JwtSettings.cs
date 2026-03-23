namespace NC.Core.Models.Settings
{
    public class JwtSettings
    {
        public const string Section = nameof(JwtSettings);
        public string Secret { get; set; } = null!;
        public  string Issuer { get; set; } = null!;
        public  string Audience { get; set; } = null!;
        public  int Expiration { get; set; }
    }
}
