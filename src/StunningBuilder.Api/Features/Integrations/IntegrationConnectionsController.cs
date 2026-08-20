using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StunningBuilder.Api.Common.Database;

namespace StunningBuilder.Api.Features.Integrations;

[ApiController]
[Route("api/v1/apps/{appId:guid}/integrations")]
[Tags("App Integrations")]
public sealed class IntegrationConnectionsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<IntegrationConnectionResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetConnections(
        [FromRoute] Guid appId,
        CancellationToken cancellationToken = default)
    {
        var appExists = await db.Apps.AnyAsync(a => a.Id == appId, cancellationToken);
        if (!appExists)
        {
            return Problem(statusCode: StatusCodes.Status404NotFound, title: "App Not Found", detail: $"No app found with ID '{appId}'.");
        }

        var connections = await db.IntegrationConnections
            .AsNoTracking()
            .Where(c => c.AppId == appId)
            .Select(c => new IntegrationConnectionResponse(
                c.Id,
                c.AppId,
                c.IntegrationId,
                c.IntegrationId,
                c.AccountName,
                c.ExternalIdentifier,
                c.Status,
                c.LastSyncedAt,
                c.CreatedAt,
                c.UpdatedAt
            ))
            .ToListAsync(cancellationToken);

        return Ok(connections);
    }

    [HttpGet("{integrationId}")]
    [ProducesResponseType(typeof(IntegrationConnectionResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetConnection(
        [FromRoute] Guid appId,
        [FromRoute] string integrationId,
        CancellationToken cancellationToken = default)
    {
        var connection = await db.IntegrationConnections
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.AppId == appId && c.IntegrationId == integrationId.ToLower(), cancellationToken);

        if (connection is null)
        {
            return Problem(statusCode: StatusCodes.Status404NotFound, title: "Connection Not Found", detail: $"Integration '{integrationId}' is not connected to this app.");
        }

        return Ok(new IntegrationConnectionResponse(
            connection.Id,
            connection.AppId,
            connection.IntegrationId,
            connection.IntegrationId,
            connection.AccountName,
            connection.ExternalIdentifier,
            connection.Status,
            connection.LastSyncedAt,
            connection.CreatedAt,
            connection.UpdatedAt
        ));
    }

    [HttpPost]
    [ProducesResponseType(typeof(IntegrationConnectionResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> ConnectIntegration(
        [FromRoute] Guid appId,
        [FromBody] ConnectIntegrationRequest request,
        CancellationToken cancellationToken = default)
    {
        var app = await db.Apps.FirstOrDefaultAsync(a => a.Id == appId, cancellationToken);
        if (app is null)
        {
            return Problem(statusCode: StatusCodes.Status404NotFound, title: "App Not Found", detail: $"No app found with ID '{appId}'.");
        }

        var normalizedId = request.IntegrationId.Trim().ToLower();
        if (!IntegrationsCatalog.Supported.Any(i => i.Id == normalizedId))
        {
            ModelState.AddModelError("IntegrationId", $"Integration '{request.IntegrationId}' is not supported. Supported: stripe, shopify, gmail, slack, google-sheets.");
            return ValidationProblem(ModelState);
        }

        var alreadyConnected = await db.IntegrationConnections
            .AnyAsync(c => c.AppId == appId && c.IntegrationId == normalizedId, cancellationToken);

        if (alreadyConnected)
        {
            return Problem(statusCode: StatusCodes.Status409Conflict, title: "Integration Already Connected", detail: $"Integration '{normalizedId}' is already connected to this app.");
        }

        var connection = new IntegrationConnection
        {
            Id = Guid.NewGuid(),
            AppId = appId,
            IntegrationId = normalizedId,
            AccountName = request.AccountName,
            ExternalIdentifier = request.ExternalIdentifier,
            CredentialsJson = request.CredentialsJson,
            Status = "connected",
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
            LastSyncedAt = DateTimeOffset.UtcNow
        };

        db.IntegrationConnections.Add(connection);
        await db.SaveChangesAsync(cancellationToken);

        var response = new IntegrationConnectionResponse(
            connection.Id,
            connection.AppId,
            connection.IntegrationId,
            connection.IntegrationId,
            connection.AccountName,
            connection.ExternalIdentifier,
            connection.Status,
            connection.LastSyncedAt,
            connection.CreatedAt,
            connection.UpdatedAt
        );

        return CreatedAtAction(nameof(GetConnection), new { appId, integrationId = connection.IntegrationId }, response);
    }

    [HttpPut("{integrationId}")]
    [ProducesResponseType(typeof(IntegrationConnectionResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateConnection(
        [FromRoute] Guid appId,
        [FromRoute] string integrationId,
        [FromBody] UpdateIntegrationConnectionRequest request,
        CancellationToken cancellationToken = default)
    {
        var normalizedId = integrationId.Trim().ToLower();
        var connection = await db.IntegrationConnections
            .FirstOrDefaultAsync(c => c.AppId == appId && c.IntegrationId == normalizedId, cancellationToken);

        if (connection is null)
        {
            return Problem(statusCode: StatusCodes.Status404NotFound, title: "Connection Not Found", detail: $"Integration '{integrationId}' is not connected to this app.");
        }

        connection.AccountName = request.AccountName ?? connection.AccountName;
        connection.ExternalIdentifier = request.ExternalIdentifier ?? connection.ExternalIdentifier;
        connection.CredentialsJson = request.CredentialsJson ?? connection.CredentialsJson;
        connection.Status = string.IsNullOrWhiteSpace(request.Status) ? connection.Status : request.Status.Trim().ToLower();
        connection.UpdatedAt = DateTimeOffset.UtcNow;

        await db.SaveChangesAsync(cancellationToken);

        return Ok(new IntegrationConnectionResponse(
            connection.Id,
            connection.AppId,
            connection.IntegrationId,
            connection.IntegrationId,
            connection.AccountName,
            connection.ExternalIdentifier,
            connection.Status,
            connection.LastSyncedAt,
            connection.CreatedAt,
            connection.UpdatedAt
        ));
    }

    [HttpDelete("{integrationId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DisconnectIntegration(
        [FromRoute] Guid appId,
        [FromRoute] string integrationId,
        CancellationToken cancellationToken = default)
    {
        var normalizedId = integrationId.Trim().ToLower();
        var connection = await db.IntegrationConnections
            .FirstOrDefaultAsync(c => c.AppId == appId && c.IntegrationId == normalizedId, cancellationToken);

        if (connection is null)
        {
            return Problem(statusCode: StatusCodes.Status404NotFound, title: "Connection Not Found", detail: $"Integration '{integrationId}' is not connected to this app.");
        }

        db.IntegrationConnections.Remove(connection);
        await db.SaveChangesAsync(cancellationToken);

        return NoContent();
    }
}
