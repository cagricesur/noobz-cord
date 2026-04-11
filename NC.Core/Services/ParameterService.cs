using Microsoft.EntityFrameworkCore;
using NC.Core.Models.Transfer;
using NC.Data.Models;

namespace NC.Core.Services;

public class ParameterService(NoobzCordContext context, CacheService cacheService)
{
    private string GetParametersCacheKey()
    {
        return string.Join(".", nameof(ParameterService), nameof(GetParameteters));
    }
    private string GetTranslationsCacheKey(string language)
    {
        return string.Join(".", nameof(ParameterService), nameof(GetTranslations), language);
    }

    public async Task<List<ParameterData>> GetParameteters(
        CancellationToken cancellationToken)
    {

        return await cacheService.AddSliding(GetParametersCacheKey(), async (entry) =>
        {
            return (await context.Parameters
                             .AsNoTracking()
                             .ToListAsync(cancellationToken: cancellationToken))
                             .Select(entity => new ParameterData()
                             {
                                 ID = entity.ID,
                                 Name = entity.Name,
                                 Value = entity.Value,
                             })
                             .ToList();
        }, TimeSpan.FromHours(1));
    }

    public async Task<ParameterData?> GetParameter(string name, CancellationToken cancellationToken)
    {
        var parameters = await GetParameteters(cancellationToken);
        return parameters.FirstOrDefault(entity => entity.Name == name);
    }

    public async Task<string?> GetTranslation(string language, string name, CancellationToken cancellationToken)
    {
        var translations = await GetTranslations(language, cancellationToken);
        return translations.FirstOrDefault(entity => entity.Name == name)?.Value;
    }

    public async Task<List<TranslationData>> GetTranslations(
        string language,
        CancellationToken cancellationToken)
    {

        return await cacheService.AddSliding(GetTranslationsCacheKey(language), async (entry) =>
        {
            return (await context.Translations
                             .AsNoTracking()
                             .Where(entity => entity.Language == language)
                             .ToListAsync(cancellationToken: cancellationToken))
                             .Select(entity => new TranslationData()
                             {
                                 ID = entity.ID,
                                 Name = entity.Name,
                                 Value = entity.Value,
                                 Language = entity.Language
                             })
                             .ToList();
        }, TimeSpan.FromHours(1));
    }
    public async Task AddMissingTranslations(
        List<TranslationData>? translations,
        CancellationToken cancellationToken)
    {
        if (translations == null)
            return;

        foreach (var translation in translations)
        {
            var existing = await context.Translations.FirstOrDefaultAsync(entity => entity.Name == translation.Name && entity.Language == translation.Language, cancellationToken);

            if (existing == null)
            {
                await context.Translations.AddAsync(new Translation
                {
                    ID = Guid.NewGuid(),
                    Name = translation.Name,
                    Language = translation.Language,
                    Value = translation.Value,
                }, cancellationToken);
            }
        }

        await context.SaveChangesAsync(cancellationToken);

        var languages = translations.Select(entity => entity.Language).Distinct();
        foreach (var language in languages)
        {
            cacheService.Remove(GetTranslationsCacheKey(language));
        }
    }
}
