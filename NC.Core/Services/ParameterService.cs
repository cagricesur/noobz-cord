using Microsoft.EntityFrameworkCore;
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

    public async Task<Dictionary<string, string>> GetParameteters(
        CancellationToken cancellationToken)
    {

        return await cacheService.AddSliding(GetParametersCacheKey(), async (entry) =>
        {
            return (await context.Parameters
                             .AsNoTracking()
                             .ToListAsync(cancellationToken: cancellationToken))
                             .ToDictionary(entity => entity.Name, entity => entity.Value);
        }, TimeSpan.FromHours(1));
    }

    public async Task<string?> GetParameter(string name, CancellationToken cancellationToken)
    {
        var parameters = await GetParameteters(cancellationToken);
        parameters.TryGetValue(name, out string? value);
        return value;
    }

    public async Task<Dictionary<string, string>> GetTranslations(
        string language,
        CancellationToken cancellationToken)
    {

        return await cacheService.AddSliding(GetTranslationsCacheKey(language), async (entry) =>
        {
            return (await context.Translations
                             .AsNoTracking()
                             .Where(entity => entity.Language == language)
                             .ToListAsync(cancellationToken: cancellationToken))
                             .ToDictionary(entity => entity.Name, entity => entity.Value);
        }, TimeSpan.FromHours(1));
    }
    public async Task AddMissingTranslations(
        string language,
        IReadOnlyDictionary<string, string>? entries,
        CancellationToken cancellationToken)
    {
        if (entries == null || entries.Count == 0)
            return;

        foreach (var (name, value) in entries)
        {
            var existing = await context.Translations.FirstOrDefaultAsync(entity => entity.Name == name && entity.Language == language, cancellationToken);

            if (existing == null)
            {
                await context.Translations.AddAsync(new Translation
                {
                    ID = Guid.NewGuid(),
                    Name = name,
                    Language = language,
                    Value = value,
                }, cancellationToken);

                cacheService.Remove(GetTranslationsCacheKey(language));
            }
        }

        await context.SaveChangesAsync(cancellationToken);
    }
}
