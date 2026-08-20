using System.ComponentModel.DataAnnotations;

namespace StunningBuilder.Api.Features.Builds;

public record TriggerBuildRequest(
    [StringLength(300)] string? CommitMessage = null,
    string TriggerType = "manual",
    Dictionary<string, string>? EnvironmentVariables = null
);

public record AppBuildResponse(
    Guid Id,
    Guid AppId,
    int BuildNumber,
    string Status,
    string TriggerType,
    string? CommitMessage,
    string? ArtifactUrl,
    long? ArtifactSizeBytes,
    DateTimeOffset? StartedAt,
    DateTimeOffset? CompletedAt,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt
);

public record AppBuildDetailResponse(
    Guid Id,
    Guid AppId,
    int BuildNumber,
    string Status,
    string TriggerType,
    string? CommitMessage,
    string? ArtifactUrl,
    long? ArtifactSizeBytes,
    string? Logs,
    string? ErrorMessage,
    DateTimeOffset? StartedAt,
    DateTimeOffset? CompletedAt,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt
);

public record BuildLogResponse(
    Guid BuildId,
    string Status,
    string Logs
);
