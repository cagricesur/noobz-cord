using NC.Core.Models.Base;
using System.ComponentModel.DataAnnotations;
using GuidAttribute = NC.Core.Attributes.GuidAttribute;

namespace NC.Core.Models.Contracts
{
    public class ActivationRequest : BaseRequest
    {
        [Required(ErrorMessage = "VIEW.ACTIVATON.VALIDATON.TOKEN.REQUIRED")]
        [Guid(ErrorMessage = "VIEW.ACTIVATON.VALIDATON.TOKEN.FORMAT")]
        public required Guid Token { get; set; }
    }
}
