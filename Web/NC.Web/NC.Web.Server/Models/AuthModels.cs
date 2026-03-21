using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace NC.Web.Server.Models
{
    [AttributeUsage(AttributeTargets.Property | AttributeTargets.Field, AllowMultiple = false)]
    public class PasswordAttribute(string[] patterns, string[] errors) : ValidationAttribute
    {
        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            for (int i = 0; i < patterns.Length; i++)
            {
                var pattern = new Regex(patterns[i]);
                if(!pattern.IsMatch(value?.ToString() ?? string.Empty))
                {
                    return new ValidationResult(errors[i]);
                }
            }

            return null;
        }
    }

    public class AuthRequest
    {
        [Required(ErrorMessage = "VIEW.LOGIN.FORM.VALIDATON.MAIL.FORMAT")]
        [EmailAddress(ErrorMessage = "VIEW.LOGIN.FORM.VALIDATON.MAIL.FORMAT")]
        [StringLength(50, ErrorMessage = "VIEW.LOGIN.FORM.VALIDATON.MAIL.FORMAT")]
        public required string Contact { get; set; }
    }

    public class AuthResponse
    {
        public string Name { get; set; } = null!;
        public string Token { get; set; } = null!;
    }
    public class LoginRequest : AuthRequest
    {
        [Required(ErrorMessage = "VIEW.LOGIN.FORM.VALIDATON.PASSWORD.REQUIRED")]
        [StringLength(10, MinimumLength = 8, ErrorMessage = "VIEW.LOGIN.FORM.VALIDATON.PASSWORD.LENGTH")]
        public required string Password { get; set; }
    }

    public class RegistrationRequest : AuthRequest
    {

        [Required(ErrorMessage = "VIEW.LOGIN.FORM.VALIDATON.NAME.REQUIRED")]
        [StringLength(20, MinimumLength = 5, ErrorMessage = "VIEW.LOGIN.FORM.VALIDATON.NAME.LENGTH")]
        [RegularExpression("^[A-Za-z][A-Za-z0-9]*$", ErrorMessage = "VIEW.LOGIN.FORM.VALIDATON.NAME.FORMAT")]
        public required string Name { get; set; }


        [Required(ErrorMessage = "VIEW.LOGIN.FORM.VALIDATON.PASSWORD.REQUIRED")]
        [StringLength(10, MinimumLength = 8, ErrorMessage = "VIEW.LOGIN.FORM.VALIDATON.PASSWORD.LENGTH")]
        [Password(
            [@"\d", "[a-z]", "[A-Z]", @"[\(\?\=\.\*\[\!\@\#\$\%\^\&\,\:\{\}\|\<\>_\-\+\]\)]"], 
            ["VIEW.LOGIN.FORM.VALIDATON.PASSWORD.ATLEAST1DIGIT", 
             "VIEW.LOGIN.FORM.VALIDATON.PASSWORD.ATLEAST1LOWERCASELETTER",
             "VIEW.LOGIN.FORM.VALIDATON.PASSWORD.ATLEAST1UPPERCASELETTER",
             "VIEW.LOGIN.FORM.VALIDATON.PASSWORD.ATLEAST1SPECIALCHAR"])]
        public required string Password { get; set; }

        [Compare("Password", ErrorMessage = "VIEW.LOGIN.FORM.VALIDATON.PASSWORDCONFIRM.MATCH")]       
        public required string PasswordConfirm { get; set; }
    }

    public class ActivationRequest
    {
        public string? Token { get; set; }
    }
}
