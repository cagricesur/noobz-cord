namespace NC.Core.Models.Settings
{
    public class AppSettings
    {
        public const string Section = nameof(AppSettings);
        public string PublicUrl { get; set; } = null!;
    }
}
