using NC.Models.Contracts;

namespace NC.Models.Definitions
{
    public interface IConferenceService
    {
        Task<ConferenceResponse> Join(ConferenceRequest request, Guid userID, CancellationToken cancellationToken);
    }
}
