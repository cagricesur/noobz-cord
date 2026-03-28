using NC.Core.Models.Base;

namespace NC.Core.Models.Contracts
{
    public class LoginResponse : BaseResponse
    {
        public string Name { get; set; } = null!;
        public string Token { get; set; } = null!;
        public UserRoleEnum Role { get; set; }
    }
}
