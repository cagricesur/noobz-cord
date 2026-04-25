using NC.Models.Contracts;
using NC.Models.Data;

namespace NC.Models.Definitions
{
    public interface IUserService
    {
        Task<RegistrationResponse> Register(RegistrationRequest request, CancellationToken cancellationToken);
        Task<ActivationResponse> Activate(ActivationRequest request, CancellationToken cancellationToken);
        Task<LoginResponse> Login(LoginRequest request, CancellationToken cancellationToken);
        Task<UserData?> GetUser(Guid userID, CancellationToken cancellationToken);

    }
}
