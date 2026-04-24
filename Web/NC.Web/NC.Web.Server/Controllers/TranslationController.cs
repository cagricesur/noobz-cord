using Microsoft.AspNetCore.Mvc;
using NC.Core;
using NC.Models.Data;
using NC.Models.Definitions;

namespace NC.Web.Server.Controllers;

public class TranslationController(ITranslationService translationService) : ServiceController
{
    [HttpGet]
    [ProducesResponseType<List<TranslationData>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTranslations([FromQuery] string language, CancellationToken cancellationToken)
    {
        var translations = await translationService.GetTranslations(language, cancellationToken);
        return new ObjectResult(translations)
        {
             StatusCode = StatusCodes.Status200OK
        };
    }

    [HttpPost]
    [ProducesResponseType<OkResult>(StatusCodes.Status200OK)]
    public async Task<IActionResult> AddMissingTranslations(List<TranslationData> translations, CancellationToken cancellationToken)
    {
        await translationService.AddMissingTranslations(translations, cancellationToken);
        return Ok();
    }

    [HttpGet]
    [ProducesResponseType<OkResult>(StatusCodes.Status200OK)]
    public async Task<IActionResult> ClearCache()
    {
        translationService.ClearCache();
        return Ok();
    }
}
