namespace StunningBuilder.Api.Features.Integrations;

/// <summary>
/// Represents a supported third-party integration in the Stunning Builder ecosystem.
/// </summary>
/// <param name="Id">Unique identifier/slug for the integration.</param>
/// <param name="Name">Human-readable display name.</param>
/// <param name="Description">Description of capabilities and use cases.</param>
/// <param name="Category">Category classification (e.g., Payments, E-Commerce, Email, Messaging, Productivity).</param>
/// <param name="AuthType">Authentication mechanism required (e.g., ApiKey, OAuth2).</param>
/// <param name="IsEnabled">Whether the integration is currently active and available.</param>
/// <param name="Capabilities">List of supported actions, webhooks, or features.</param>
/// <param name="DocumentationUrl">Optional link to official developer documentation.</param>
public sealed record IntegrationResponse(
    string Id,
    string Name,
    string Description,
    string Category,
    string AuthType,
    bool IsEnabled,
    IReadOnlyList<string> Capabilities,
    string? DocumentationUrl = null
);
