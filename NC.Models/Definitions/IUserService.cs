using NC.Models.Contracts;

namespace NC.Models.Definitions
{
    public interface IUserService
    {
        Task<RegistrationResponse> Register(RegistrationRequest request, CancellationToken cancellationToken);
        Task<ActivationResponse> Activate(ActivationRequest request, CancellationToken cancellationToken);
        Task<LoginResponse> Login(LoginRequest request, CancellationToken cancellationToken);
        Task<Guid?> GetUserID(string name, CancellationToken cancellationToken);

    }
}
