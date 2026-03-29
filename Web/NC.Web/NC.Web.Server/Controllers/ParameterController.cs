using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NC.Core.Models;
using NC.Core.Services;

namespace NC.Web.Server.Controllers;

public class ParameterController(ParameterService parameterService) : BaseController
{
    [HttpGet]
    public Task<List<TranslationData>> GetTranslations(
        [FromQuery] string language,
        CancellationToken cancellationToken)
    {
        return parameterService.GetTranslations(language, cancellationToken);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AddMissingTranslations(List<TranslationData> translations, CancellationToken cancellationToken)
    {
        await parameterService.AddMissingTranslations(translations, cancellationToken);
        return Ok();
    }
}
