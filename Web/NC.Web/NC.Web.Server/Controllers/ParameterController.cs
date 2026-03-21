using Microsoft.AspNetCore.Mvc;
using NC.Core.Services;

namespace NC.Web.Server.Controllers;

[ApiController]
[Route("api/[controller]/[action]")]
public class ParameterController(ParameterService parameterService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<KeyValuePair<string, string>>>> GetTranslations(
        [FromQuery] string language,
        CancellationToken cancellationToken)
    {
        var translations = await parameterService.GetTranslations(language, cancellationToken);
        return Ok(translations);
    }



    [HttpPost]
    public async Task<IActionResult> AddMissingTranslations(
        [FromQuery] string language,
        [FromBody] Dictionary<string, string>? entries,
        CancellationToken cancellationToken)
    {
        await parameterService.AddMissingTranslations(language, entries, cancellationToken);
        return Ok();
    }
}
