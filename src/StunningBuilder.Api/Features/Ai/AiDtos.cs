using System.ComponentModel.DataAnnotations;

namespace StunningBuilder.Api.Features.Ai;

public record GenerateAppRequest(
    [Required, StringLength(4000, MinimumLength = 3)] string Prompt,
    string? Template = "blank",
    string? Framework = "nextjs",
    string? Model = "gpt-4o",
    string? GenerationType = "app_scaffold",
    IReadOnlyList<string>? RequestedIntegrations = null
);

public record GeneratedFile(
    string Path,
    string Content,
    string Language
);

public record GeneratedAppStructure(
    string Name,
    string Description,
    string Template,
    string Framework,
    IReadOnlyList<string> SuggestedIntegrations,
    IReadOnlyList<GeneratedFile> Files
);

public record GenerateAppResponse(
    Guid GenerationId,
    Guid? AppId,
    string Model,
    string Status,
    string RawContent,
    GeneratedAppStructure? Structure,
    int? PromptTokens,
    int? CompletionTokens,
    DateTimeOffset CreatedAt
);

public record GenerationStreamChunk(
    string Type, // "delta", "file", "done", "error"
    string? Content = null,
    string? FilePath = null,
    string? FileContent = null
);

public record GenerationHistoryResponse(
    Guid Id,
    Guid? AppId,
    string Prompt,
    string GenerationType,
    string Model,
    string Status,
    DateTimeOffset CreatedAt
);
