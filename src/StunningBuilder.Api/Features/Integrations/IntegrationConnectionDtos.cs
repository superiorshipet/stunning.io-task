using System.ComponentModel.DataAnnotations;

namespace StunningBuilder.Api.Features.Integrations;

public record ConnectIntegrationRequest(
    [Required, StringLength(50, MinimumLength = 1)] string IntegrationId,
    [StringLength(150)] string? AccountName = null,
    [StringLength(200)] string? ExternalIdentifier = null,
    string? CredentialsJson = null
);

public record UpdateIntegrationConnectionRequest(
    [StringLength(150)] string? AccountName = null,
    [StringLength(200)] string? ExternalIdentifier = null,
    string? CredentialsJson = null,
    string? Status = null
);

public record IntegrationConnectionResponse(
    Guid Id,
    Guid AppId,
    string IntegrationId,
    string IntegrationName,
    string? AccountName,
    string? ExternalIdentifier,
    string Status,
    DateTimeOffset? LastSyncedAt,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt
);

public record IntegrationConnectionDetailResponse(
    Guid Id,
    Guid AppId,
    string IntegrationId,
    string IntegrationName,
    string? AccountName,
    string? ExternalIdentifier,
    string Status,
    bool HasCredentials,
    DateTimeOffset? LastSyncedAt,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt
);
