using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StunningBuilder.Api.Common.Database;

namespace StunningBuilder.Api.Features.Integrations;

public static class IntegrationConnectionEndpoints
{
    public static IEndpointRouteBuilder MapIntegrationConnectionEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/apps/{appId:guid}/integrations")
            .WithTags("App Integrations");

        group.MapGet("/", GetAppIntegrations)
            .WithName("GetAppIntegrations")
            .WithSummary("List connected integrations for an app")
            .WithDescription("Retrieves all third-party integrations currently connected to the specified application.")
            .Produces<IReadOnlyList<IntegrationConnectionResponse>>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status500InternalServerError);

        group.MapGet("/{connectionId:guid}", GetAppIntegrationById)
            .WithName("GetAppIntegrationById")
            .WithSummary("Get connected integration details")
            .WithDescription("Retrieves details and status of a specific integration connection for an application.")
            .Produces<IntegrationConnectionDetailResponse>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status500InternalServerError);

        group.MapPost("/", ConnectIntegration)
            .WithName("ConnectIntegration")
            .WithSummary("Connect an integration to an app")
            .WithDescription("Connects one of the supported integrations (Stripe, Shopify, Gmail, Slack, Google Sheets) to an application.")
            .Produces<IntegrationConnectionResponse>(StatusCodes.Status201Created)
            .ProducesValidationProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status500InternalServerError);

        group.MapPut("/{connectionId:guid}", UpdateConnection)
            .WithName("UpdateIntegrationConnection")
            .WithSummary("Update connected integration")
            .WithDescription("Updates account credentials, external identifiers, or connection status for an app integration.")
            .Produces<IntegrationConnectionResponse>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status500InternalServerError);

        group.MapDelete("/{connectionId:guid}", DisconnectIntegration)
            .WithName("DisconnectIntegration")
            .WithSummary("Disconnect an integration")
            .WithDescription("Removes and revokes the integration connection from the application.")
            .Produces(StatusCodes.Status204NoContent)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status500InternalServerError);

        return endpoints;
    }

    public static async Task<IResult> GetAppIntegrations(
        [FromRoute] Guid appId,
        [FromServices] AppDbContext db,
        CancellationToken cancellationToken)
    {
        var appExists = await db.Apps.AnyAsync(a => a.Id == appId, cancellationToken);
        if (!appExists)
        {
            return TypedResults.Problem(
                statusCode: StatusCodes.Status404NotFound,
                title: "App Not Found",
                detail: $"Application with ID '{appId}' was not found.");
        }

        var connections = await db.IntegrationConnections
            .AsNoTracking()
            .Where(c => c.AppId == appId)
            .OrderBy(c => c.CreatedAt)
            .ToListAsync(cancellationToken);

        var response = connections.Select(c => ToResponse(c)).ToList();
        return TypedResults.Ok(response);
    }

    public static async Task<IResult> GetAppIntegrationById(
        [FromRoute] Guid appId,
        [FromRoute] Guid connectionId,
        [FromServices] AppDbContext db,
        CancellationToken cancellationToken)
    {
        var connection = await db.IntegrationConnections
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.AppId == appId && c.Id == connectionId, cancellationToken);

        if (connection is null)
        {
            return TypedResults.Problem(
                statusCode: StatusCodes.Status404NotFound,
                title: "Integration Connection Not Found",
                detail: $"Integration connection '{connectionId}' was not found for app '{appId}'.");
        }

        var integration = IntegrationsCatalog.Supported.FirstOrDefault(i =>
            i.Id.Equals(connection.IntegrationId, StringComparison.OrdinalIgnoreCase));

        var detailResponse = new IntegrationConnectionDetailResponse(
            connection.Id,
            connection.AppId,
            connection.IntegrationId,
            integration?.Name ?? connection.IntegrationId,
            connection.AccountName,
            connection.ExternalIdentifier,
            connection.Status,
            !string.IsNullOrWhiteSpace(connection.CredentialsJson),
            connection.LastSyncedAt,
            connection.CreatedAt,
            connection.UpdatedAt
        );

        return TypedResults.Ok(detailResponse);
    }

    public static async Task<IResult> ConnectIntegration(
        [FromRoute] Guid appId,
        [FromBody] ConnectIntegrationRequest request,
        [FromServices] AppDbContext db,
        CancellationToken cancellationToken)
    {
        var appExists = await db.Apps.AnyAsync(a => a.Id == appId, cancellationToken);
        if (!appExists)
        {
            return TypedResults.Problem(
                statusCode: StatusCodes.Status404NotFound,
                title: "App Not Found",
                detail: $"Application with ID '{appId}' was not found.");
        }

        var supported = IntegrationsCatalog.Supported.FirstOrDefault(i =>
            i.Id.Equals(request.IntegrationId, StringComparison.OrdinalIgnoreCase));

        if (supported is null)
        {
            return TypedResults.ValidationProblem(new Dictionary<string, string[]>
            {
                ["IntegrationId"] = [$"Integration '{request.IntegrationId}' is not supported. Supported integrations are: {string.Join(", ", IntegrationsCatalog.Supported.Select(s => s.Id))}."]
            });
        }

        var connection = new IntegrationConnection
        {
            Id = Guid.NewGuid(),
            AppId = appId,
            IntegrationId = supported.Id,
            AccountName = request.AccountName?.Trim(),
            ExternalIdentifier = request.ExternalIdentifier?.Trim(),
            CredentialsJson = request.CredentialsJson,
            Status = "connected",
            LastSyncedAt = DateTimeOffset.UtcNow,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        db.IntegrationConnections.Add(connection);
        await db.SaveChangesAsync(cancellationToken);

        return TypedResults.Created($"/api/v1/apps/{appId}/integrations/{connection.Id}", ToResponse(connection));
    }

    public static async Task<IResult> UpdateConnection(
        [FromRoute] Guid appId,
        [FromRoute] Guid connectionId,
        [FromBody] UpdateIntegrationConnectionRequest request,
        [FromServices] AppDbContext db,
        CancellationToken cancellationToken)
    {
        var connection = await db.IntegrationConnections
            .FirstOrDefaultAsync(c => c.AppId == appId && c.Id == connectionId, cancellationToken);

        if (connection is null)
        {
            return TypedResults.Problem(
                statusCode: StatusCodes.Status404NotFound,
                title: "Integration Connection Not Found",
                detail: $"Integration connection '{connectionId}' was not found for app '{appId}'.");
        }

        if (request.AccountName is not null) connection.AccountName = request.AccountName.Trim();
        if (request.ExternalIdentifier is not null) connection.ExternalIdentifier = request.ExternalIdentifier.Trim();
        if (request.CredentialsJson is not null) connection.CredentialsJson = request.CredentialsJson;
        if (!string.IsNullOrWhiteSpace(request.Status)) connection.Status = request.Status.Trim().ToLowerInvariant();

        connection.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(ToResponse(connection));
    }

    public static async Task<IResult> DisconnectIntegration(
        [FromRoute] Guid appId,
        [FromRoute] Guid connectionId,
        [FromServices] AppDbContext db,
        CancellationToken cancellationToken)
    {
        var connection = await db.IntegrationConnections
            .FirstOrDefaultAsync(c => c.AppId == appId && c.Id == connectionId, cancellationToken);

        if (connection is null)
        {
            return TypedResults.Problem(
                statusCode: StatusCodes.Status404NotFound,
                title: "Integration Connection Not Found",
                detail: $"Integration connection '{connectionId}' was not found for app '{appId}'.");
        }

        db.IntegrationConnections.Remove(connection);
        await db.SaveChangesAsync(cancellationToken);

        return TypedResults.NoContent();
    }

    private static IntegrationConnectionResponse ToResponse(IntegrationConnection connection)
    {
        var integration = IntegrationsCatalog.Supported.FirstOrDefault(i =>
            i.Id.Equals(connection.IntegrationId, StringComparison.OrdinalIgnoreCase));

        return new IntegrationConnectionResponse(
            connection.Id,
            connection.AppId,
            connection.IntegrationId,
            integration?.Name ?? connection.IntegrationId,
            connection.AccountName,
            connection.ExternalIdentifier,
            connection.Status,
            connection.LastSyncedAt,
            connection.CreatedAt,
            connection.UpdatedAt
        );
    }
}
