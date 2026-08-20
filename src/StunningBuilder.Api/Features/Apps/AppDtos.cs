using System.ComponentModel.DataAnnotations;

namespace StunningBuilder.Api.Features.Apps;

public record CreateAppRequest(
    [Required, StringLength(150, MinimumLength = 1)] string Name,
    [StringLength(500)] string? Description = null,
    string Template = "blank",
    string Framework = "nextjs",
    string? SettingsJson = null
);

public record UpdateAppRequest(
    [Required, StringLength(150, MinimumLength = 1)] string Name,
    [StringLength(500)] string? Description = null,
    string Template = "blank",
    string Framework = "nextjs",
    string Status = "draft",
    string? SettingsJson = null
);

public record AppResponse(
    Guid Id,
    string Name,
    string Slug,
    string? Description,
    string Template,
    string Framework,
    string Status,
    string? SettingsJson,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt
);

public record AppListResponse(
    IReadOnlyList<AppResponse> Items,
    int TotalCount
);
