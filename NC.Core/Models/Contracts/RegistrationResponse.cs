using NC.Core.Models.Base;

namespace NC.Core.Models.Contracts
{
    public class RegistrationResponse : BaseResponse
    {
        public string Name { get; set; } = null!;
    }
}
