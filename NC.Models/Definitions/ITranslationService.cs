using NC.Models.Data;

namespace NC.Models.Definitions
{
    public interface ITranslationService
    {
        void ClearCache();
        Task<string> GetTranslation(string language, string name, CancellationToken cancellationToken);
        Task<List<TranslationData>> GetTranslations(string language, CancellationToken cancellationToken);
        Task AddMissingTranslations(List<TranslationData>? translations, CancellationToken cancellationToken);
    }
}
