namespace NC.Core.Models
{
    public class AppSettings
    {
        public const string Section = nameof(AppSettings);
        public string PublicUrl { get; set; } = null!;
    }
}
