using Microsoft.AspNetCore.Mvc;

namespace StunningBuilder.Api.Features.Integrations;

[ApiController]
[Route("api/v1/integrations")]
[Tags("Integrations")]
public sealed class IntegrationsController : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<IntegrationResponse>), StatusCodes.Status200OK)]
    public IActionResult GetIntegrations()
    {
        var integrations = IntegrationsCatalog.Supported;
        return Ok(integrations);
    }
}
