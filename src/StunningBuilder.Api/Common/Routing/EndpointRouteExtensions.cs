using StunningBuilder.Api.Features.Apps;
using StunningBuilder.Api.Features.Integrations;

namespace StunningBuilder.Api.Common.Routing;

public static class EndpointRouteExtensions
{
    public static IEndpointRouteBuilder MapApiV1Endpoints(this IEndpointRouteBuilder app)
    {
        var v1Group = app.MapGroup("/api/v1")
            .WithGroupName("v1");

        v1Group.MapIntegrationsEndpoints();
        v1Group.MapAppsEndpoints();

        return app;
    }
}
