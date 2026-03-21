using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;
using NC.Core.Models;

namespace NC.Core.Services
{
    public class MailService(IOptions<SmtpSettings> smtpSettings)
    {
        public async Task SendMail(string receiver, string subject, string textContent, string htmlContent, CancellationToken cancellationToken)
        {
            var message = new MimeMessage();
            message.From.Add(MailboxAddress.Parse(smtpSettings.Value.UserName));
            message.To.Add(MailboxAddress.Parse(receiver));
            message.Subject = subject;

            var builder = new BodyBuilder
            {
                TextBody = textContent,
                HtmlBody = htmlContent
            };
            message.Body = builder.ToMessageBody();

            using var client = new SmtpClient();
            await client.ConnectAsync(smtpSettings.Value.Host, smtpSettings.Value.Port, SecureSocketOptions.StartTls, cancellationToken);
            await client.AuthenticateAsync(smtpSettings.Value.UserName, smtpSettings.Value.Password, cancellationToken);
            await client.SendAsync(message, cancellationToken);
            await client.DisconnectAsync(true, cancellationToken);
        }
    }
}
