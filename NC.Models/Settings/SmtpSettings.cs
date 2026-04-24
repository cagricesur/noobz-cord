namespace NC.Models.Settings
{
    public class SmtpSettings
    {
        public const string Section = nameof(SmtpSettings);
        public required string UserName { get; set; }
        public required string Password { get; set; }
        public required string Host { get; set;  }
        public required int Port { get; set; }   
    }
}
