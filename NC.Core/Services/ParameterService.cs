using Microsoft.EntityFrameworkCore;
using NC.Data.Models;

namespace NC.Core.Services;

public class ParameterService(NoobzCordContext context)
{
    public async Task<IReadOnlyDictionary<string, string>> GetTranslations(
        string language,
        CancellationToken cancellationToken = default)
    {
        return (await context.Translations
                             .AsNoTracking()
                             .Where(entity => entity.Language == language)
                             .ToListAsync(cancellationToken: cancellationToken))
                             .ToDictionary(entity => entity.Name, entity => entity.Value);

    }
    public async Task AddMissingTranslations(
        string language,
        IReadOnlyDictionary<string, string>? entries,
        CancellationToken cancellationToken = default)
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
                });
            }
        }

        await context.SaveChangesAsync(cancellationToken);
    }
}
