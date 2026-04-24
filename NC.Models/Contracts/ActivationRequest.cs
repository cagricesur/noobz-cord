using NC.Models.Attributes;
using System.ComponentModel.DataAnnotations;

namespace NC.Models.Contracts
{
    public class ActivationRequest
    {
        [Required(ErrorMessage = "ERROR.VALIDATION.ACTIVATION.REQUEST.TOKEN.REQUIRED")]
        [Guid(ErrorMessage = "ERROR.VALIDATION.ACTIVATION.REQUEST.TOKEN.FORMAT")]
        public required Guid Token { get; set; }

        [Required(ErrorMessage = "ERROR.VALIDATION.ACTIVATION.REQUEST.TOKENHASH.REQUIRED")]
        public required string TokenHash { get; set; }

        [Required(ErrorMessage = "ERROR.VALIDATION.ACTIVATION.REQUEST.PIN.REQUIRED")]
        public required string Pin { get; set; }
    }
}
