using System.ComponentModel.DataAnnotations;

namespace NC.Models.Contracts
{
    public class LoginRequest
    {
        [Required(ErrorMessage = "ERROR.VALIDATION.LOGIN.REQUEST.CONTACT.REQUIRED")]
        [EmailAddress(ErrorMessage = "ERROR.VALIDATION.LOGIN.REQUEST.CONTACT.FORMAT")]
        [StringLength(50, ErrorMessage = "ERROR.VALIDATION.LOGIN.REQUEST.CONTACT.LENGTH")]
        public required string Contact { get; set; }


        [Required(ErrorMessage = "ERROR.VALIDATION.LOGIN.REQUEST.PASSWORD.REQUIRED")]
        [StringLength(16, MinimumLength = 8, ErrorMessage = "ERROR.VALIDATION.LOGIN.REQUEST.PASSWORD.LENGTH")]
        public required string Password { get; set; }
    }
}
