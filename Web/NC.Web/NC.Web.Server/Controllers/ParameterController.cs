using Microsoft.AspNetCore.Mvc;
using NC.Core.Services;

namespace NC.Web.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ParameterController(ParameterService parameterService) : ControllerBase
{
    [HttpGet("translations/{language}")]
    public async Task<ActionResult<IReadOnlyDictionary<string, string>>> GetTranslations(
        string language,
        CancellationToken cancellationToken)
    {
        var translations = await parameterService.GetTranslations(language, cancellationToken);
        return Ok(translations);
    }



    [HttpPost("translations/add/{language}")]
    public async Task<IActionResult> AddMissingTranslations(
        string language,
        [FromBody] Dictionary<string, string>? entries,
        CancellationToken cancellationToken)
    {
        await parameterService.AddMissingTranslations(language, entries, cancellationToken);
        return Ok();
    }
}
