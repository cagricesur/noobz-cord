using NC.Core.Attributes;
using NC.Core.Models.Base;
using System.ComponentModel.DataAnnotations;

namespace NC.Core.Models.Contracts
{
    public class RegistrationRequest : BaseRequest
    {
        [Required(ErrorMessage = "VIEW.LOGIN.FORM.VALIDATON.MAIL.FORMAT")]
        [EmailAddress(ErrorMessage = "VIEW.LOGIN.FORM.VALIDATON.MAIL.FORMAT")]
        [StringLength(50, ErrorMessage = "VIEW.LOGIN.FORM.VALIDATON.MAIL.FORMAT")]
        public required string Contact { get; set; }

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
}
