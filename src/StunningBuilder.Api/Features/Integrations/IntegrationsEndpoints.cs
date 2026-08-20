namespace StunningBuilder.Api.Features.Integrations;

public static class IntegrationsEndpoints
{
    public static IEndpointRouteBuilder MapIntegrationsEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/integrations", GetIntegrations)
            .WithName("GetIntegrations")
            .WithSummary("List supported integrations")
            .WithDescription("Retrieves the catalog of third-party integrations currently supported by the Stunning Builder backend.")
            .WithTags("Integrations")
            .Produces<IReadOnlyList<IntegrationResponse>>(StatusCodes.Status200OK, "application/json")
            .ProducesProblem(StatusCodes.Status500InternalServerError);

        return endpoints;
    }

    public static IResult GetIntegrations()
    {
        return TypedResults.Ok(IntegrationsCatalog.Supported);
    }
}
