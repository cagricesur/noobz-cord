using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using NC.Models.Settings;

namespace NC.Utils.Helpers
{
    public class MailHelper
    {
        public static async Task SendMail(SmtpSettings settings, string receiver, string subject, string textContent, string htmlContent, CancellationToken cancellationToken)
        {
            var message = new MimeMessage();
            message.From.Add(MailboxAddress.Parse(settings.UserName));
            message.To.Add(MailboxAddress.Parse(receiver));
            message.Subject = subject;

            var builder = new BodyBuilder
            {
                TextBody = textContent,
                HtmlBody = htmlContent
            };
            message.Body = builder.ToMessageBody();

            using var client = new SmtpClient();
            await client.ConnectAsync(settings.Host, settings.Port, SecureSocketOptions.StartTls, cancellationToken);
            await client.AuthenticateAsync(settings.UserName, settings.Password, cancellationToken);
            await client.SendAsync(message, cancellationToken);
            await client.DisconnectAsync(true, cancellationToken);
        }
    }
}
