using NC.Core.Models.Base;

namespace NC.Core.Models.Contracts
{
    public class ConferenceResponse : BaseResponse
    {
        public string Server { get; set; } = null!;
        public string Room { get; set; } = null!;
        public string Token { get; set; } = null!;
    }
}
