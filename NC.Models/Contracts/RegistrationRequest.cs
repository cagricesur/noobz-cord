using System.ComponentModel.DataAnnotations;

namespace NC.Models.Contracts
{
    public class RegistrationRequest
    {
        [Required(ErrorMessage = "ERROR.VALIDATION.REGISTRATION.REQUEST.CONTACT.REQUIRED")]
        [EmailAddress(ErrorMessage = "ERROR.VALIDATION.REGISTRATION.REQUEST.CONTACT.FORMAT")]
        [StringLength(50, ErrorMessage = "ERROR.VALIDATION.REGISTRATION.REQUEST.CONTACT.LENGTH")]
        public required string Contact { get; set; }

        [Required(ErrorMessage = "ERROR.VALIDATION.REGISTRATION.REQUEST.NAME.REQUIRED")]
        [StringLength(20, MinimumLength = 5, ErrorMessage = "ERROR.VALIDATION.REGISTRATION.REQUEST.NAME.LENGTH")]
        [RegularExpression("^[A-Za-z][A-Za-z0-9]*$", ErrorMessage = "ERROR.VALIDATION.REGISTRATION.REQUEST.NAME.PATTERN")]
        public required string Name { get; set; }

        [Required(ErrorMessage = "ERROR.VALIDATION.REGISTRATION.REQUEST.PASSWORD.REQUIRED")]
        [StringLength(16, MinimumLength = 8, ErrorMessage = "ERROR.VALIDATION.REGISTRATION.REQUEST.PASSWORD.LENGTH")]
        [RegularExpression("^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>?`~]).+$", ErrorMessage = "ERROR.VALIDATION.REGISTRATION.REQUEST.PASSWORD.PATTERN")]
        public required string Password { get; set; }

        [Compare("Password", ErrorMessage = "ERROR.VALIDATON.REGISTRATION.REQUEST.PASSWORD.MATCH")]
        public required string PasswordConfirm { get; set; }
    }
}
