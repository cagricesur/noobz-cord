namespace NC.Core.Models
{
    public class SmtpSettings
    {
        public const string Section = nameof(SmtpSettings);
        public string UserName { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string Host { get; set;  } = null!;
        public int Port { get; set; }   
    }
}
