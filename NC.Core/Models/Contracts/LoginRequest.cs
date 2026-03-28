using NC.Core.Models.Base;
using System.ComponentModel.DataAnnotations;

namespace NC.Core.Models.Contracts
{
    public class LoginRequest : BaseRequest
    {
        [Required(ErrorMessage = "VIEW.LOGIN.FORM.VALIDATON.MAIL.FORMAT")]
        [EmailAddress(ErrorMessage = "VIEW.LOGIN.FORM.VALIDATON.MAIL.FORMAT")]
        [StringLength(50, ErrorMessage = "VIEW.LOGIN.FORM.VALIDATON.MAIL.FORMAT")]
        public required string Contact { get; set; }


        [Required(ErrorMessage = "VIEW.LOGIN.FORM.VALIDATON.PASSWORD.REQUIRED")]
        [StringLength(16, MinimumLength = 8, ErrorMessage = "VIEW.LOGIN.FORM.VALIDATON.PASSWORD.LENGTH")]
        public required string Password { get; set; }
    }
}
