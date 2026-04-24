using NC.Models.Data;

namespace NC.Models.Contracts
{
    public class LoginResponse : ServiceResponse
    {
        public UserData? User { get; set; }
        public string? Token { get; set; }
    }
}
