using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StunningBuilder.Api.Common.Database;

namespace StunningBuilder.Api.Features.Ai;

public static class AiEndpoints
{
    public static IEndpointRouteBuilder MapAiEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/generate")
            .WithTags("AI Generation");

        group.MapPost("/", Generate)
            .WithName("GenerateAppScaffold")
            .WithSummary("Generate application code and structure from prompt")
            .WithDescription("Uses OpenAI LLM to generate components, full project scaffolds, or integration configurations from natural language prompts.")
            .Produces<GenerateAppResponse>(StatusCodes.Status200OK)
            .ProducesValidationProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status500InternalServerError);

        group.MapPost("/stream", StreamGeneration)
            .WithName("StreamAppGeneration")
            .WithSummary("Stream AI generation tokens via Server-Sent Events (SSE)")
            .WithDescription("Streams live token output in real-time as the AI constructs code and architecture.")
            .Produces(StatusCodes.Status200OK, contentType: "text/event-stream")
            .ProducesValidationProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status500InternalServerError);

        var appGroup = endpoints.MapGroup("/apps/{appId:guid}/generate")
            .WithTags("App AI Generation");

        appGroup.MapPost("/", GenerateForApp)
            .WithName("GenerateForApp")
            .WithSummary("Generate code with App context")
            .WithDescription("Generates features or updates tailored to an existing app, taking into account connected integrations and settings.")
            .Produces<GenerateAppResponse>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status500InternalServerError);

        appGroup.MapPost("/stream", StreamForApp)
            .WithName("StreamForApp")
            .WithSummary("Stream AI generation with App context")
            .WithDescription("Streams live token generation with existing App context and connected integrations.")
            .Produces(StatusCodes.Status200OK, contentType: "text/event-stream")
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status500InternalServerError);

        endpoints.MapGet("/apps/{appId:guid}/generations", GetAppGenerationHistory)
            .WithName("GetAppGenerationHistory")
            .WithSummary("Get AI generation history for an app")
            .WithDescription("Retrieves past prompt prompts, generation outputs, and token metrics for an app.")
            .WithTags("App AI Generation")
            .Produces<IReadOnlyList<GenerationHistoryResponse>>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status404NotFound);

        return endpoints;
    }

    public static async Task<IResult> Generate(
        [FromBody] GenerateAppRequest request,
        [FromServices] OpenAiService aiService,
        [FromServices] AppDbContext db,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Prompt))
        {
            return TypedResults.ValidationProblem(new Dictionary<string, string[]>
            {
                ["Prompt"] = ["Prompt cannot be empty."]
            });
        }

        var systemPrompt = BuildSystemPrompt(request.Template, request.Framework, request.RequestedIntegrations);
        var result = await aiService.GenerateAsync(request.Prompt, systemPrompt, request.Model, cancellationToken);

        GeneratedAppStructure? structure = null;
        try
        {
            structure = JsonSerializer.Deserialize<GeneratedAppStructure>(result.Content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
        }
        catch
        {
            // Raw text response
        }

        var session = new GenerationSession
        {
            Id = Guid.NewGuid(),
            Prompt = request.Prompt,
            GenerationType = request.GenerationType ?? "app_scaffold",
            Model = request.Model ?? "gpt-4o",
            SystemPrompt = systemPrompt,
            ResponseContent = result.Content,
            StructuredOutputJson = structure != null ? result.Content : null,
            PromptTokens = result.PromptTokens,
            CompletionTokens = result.CompletionTokens,
            Status = "completed",
            CreatedAt = DateTimeOffset.UtcNow
        };

        db.GenerationSessions.Add(session);
        await db.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(new GenerateAppResponse(
            session.Id,
            session.AppId,
            session.Model,
            session.Status,
            result.Content,
            structure,
            session.PromptTokens,
            session.CompletionTokens,
            session.CreatedAt
        ));
    }

    public static async Task StreamGeneration(
        [FromBody] GenerateAppRequest request,
        [FromServices] OpenAiService aiService,
        HttpContext httpContext,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Prompt))
        {
            httpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
            await httpContext.Response.WriteAsync("Prompt is required.", cancellationToken);
            return;
        }

        httpContext.Response.Headers.Append("Content-Type", "text/event-stream");
        httpContext.Response.Headers.Append("Cache-Control", "no-cache");
        httpContext.Response.Headers.Append("Connection", "keep-alive");

        var systemPrompt = BuildSystemPrompt(request.Template, request.Framework, request.RequestedIntegrations);

        await foreach (var token in aiService.StreamGenerateAsync(request.Prompt, systemPrompt, request.Model, cancellationToken))
        {
            var chunk = new GenerationStreamChunk("delta", Content: token);
            var json = JsonSerializer.Serialize(chunk);
            await httpContext.Response.WriteAsync($"data: {json}\n\n", Encoding.UTF8, cancellationToken);
            await httpContext.Response.Body.FlushAsync(cancellationToken);
        }

        var doneChunk = new GenerationStreamChunk("done");
        await httpContext.Response.WriteAsync($"data: {JsonSerializer.Serialize(doneChunk)}\n\n", Encoding.UTF8, cancellationToken);
        await httpContext.Response.Body.FlushAsync(cancellationToken);
    }

    public static async Task<IResult> GenerateForApp(
        [FromRoute] Guid appId,
        [FromBody] GenerateAppRequest request,
        [FromServices] OpenAiService aiService,
        [FromServices] AppDbContext db,
        CancellationToken cancellationToken)
    {
        var app = await db.Apps.FirstOrDefaultAsync(a => a.Id == appId, cancellationToken);
        if (app is null)
        {
            return TypedResults.Problem(statusCode: StatusCodes.Status404NotFound, title: "App Not Found");
        }

        var connectedIntegrations = await db.IntegrationConnections
            .Where(c => c.AppId == appId)
            .Select(c => c.IntegrationId)
            .ToListAsync(cancellationToken);

        var systemPrompt = BuildSystemPrompt(app.Template, app.Framework, connectedIntegrations, app.Name, app.Description);
        var result = await aiService.GenerateAsync(request.Prompt, systemPrompt, request.Model, cancellationToken);

        GeneratedAppStructure? structure = null;
        try
        {
            structure = JsonSerializer.Deserialize<GeneratedAppStructure>(result.Content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
        }
        catch { }

        var session = new GenerationSession
        {
            Id = Guid.NewGuid(),
            AppId = appId,
            Prompt = request.Prompt,
            GenerationType = request.GenerationType ?? "app_scaffold",
            Model = request.Model ?? "gpt-4o",
            SystemPrompt = systemPrompt,
            ResponseContent = result.Content,
            StructuredOutputJson = structure != null ? result.Content : null,
            PromptTokens = result.PromptTokens,
            CompletionTokens = result.CompletionTokens,
            Status = "completed",
            CreatedAt = DateTimeOffset.UtcNow
        };

        db.GenerationSessions.Add(session);
        await db.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(new GenerateAppResponse(
            session.Id,
            session.AppId,
            session.Model,
            session.Status,
            result.Content,
            structure,
            session.PromptTokens,
            session.CompletionTokens,
            session.CreatedAt
        ));
    }

    public static async Task StreamForApp(
        [FromRoute] Guid appId,
        [FromBody] GenerateAppRequest request,
        [FromServices] OpenAiService aiService,
        [FromServices] AppDbContext db,
        HttpContext httpContext,
        CancellationToken cancellationToken)
    {
        var app = await db.Apps.FirstOrDefaultAsync(a => a.Id == appId, cancellationToken);
        if (app is null)
        {
            httpContext.Response.StatusCode = StatusCodes.Status404NotFound;
            await httpContext.Response.WriteAsync("App not found", cancellationToken);
            return;
        }

        var connectedIntegrations = await db.IntegrationConnections
            .Where(c => c.AppId == appId)
            .Select(c => c.IntegrationId)
            .ToListAsync(cancellationToken);

        httpContext.Response.Headers.Append("Content-Type", "text/event-stream");
        httpContext.Response.Headers.Append("Cache-Control", "no-cache");
        httpContext.Response.Headers.Append("Connection", "keep-alive");

        var systemPrompt = BuildSystemPrompt(app.Template, app.Framework, connectedIntegrations, app.Name, app.Description);

        await foreach (var token in aiService.StreamGenerateAsync(request.Prompt, systemPrompt, request.Model, cancellationToken))
        {
            var chunk = new GenerationStreamChunk("delta", Content: token);
            var json = JsonSerializer.Serialize(chunk);
            await httpContext.Response.WriteAsync($"data: {json}\n\n", Encoding.UTF8, cancellationToken);
            await httpContext.Response.Body.FlushAsync(cancellationToken);
        }

        var doneChunk = new GenerationStreamChunk("done");
        await httpContext.Response.WriteAsync($"data: {JsonSerializer.Serialize(doneChunk)}\n\n", Encoding.UTF8, cancellationToken);
        await httpContext.Response.Body.FlushAsync(cancellationToken);
    }

    public static async Task<IResult> GetAppGenerationHistory(
        [FromRoute] Guid appId,
        [FromServices] AppDbContext db,
        CancellationToken cancellationToken)
    {
        var exists = await db.Apps.AnyAsync(a => a.Id == appId, cancellationToken);
        if (!exists)
        {
            return TypedResults.Problem(statusCode: StatusCodes.Status404NotFound, title: "App Not Found");
        }

        var history = await db.GenerationSessions
            .AsNoTracking()
            .Where(g => g.AppId == appId)
            .OrderByDescending(g => g.CreatedAt)
            .Select(g => new GenerationHistoryResponse(
                g.Id,
                g.AppId,
                g.Prompt,
                g.GenerationType,
                g.Model,
                g.Status,
                g.CreatedAt
            ))
            .ToListAsync(cancellationToken);

        return TypedResults.Ok(history);
    }

    private static string BuildSystemPrompt(
        string? template,
        string? framework,
        IReadOnlyList<string>? integrations,
        string? appName = null,
        string? appDescription = null)
    {
        var sb = new StringBuilder();
        sb.AppendLine("You are an expert AI Full-Stack Software Engineer and Builder Engine.");
        sb.AppendLine("Your goal is to scaffold modern, high-quality, production-ready web applications.");
        sb.AppendLine($"Target Framework: {framework ?? "nextjs"}");
        sb.AppendLine($"Template Type: {template ?? "blank"}");

        if (!string.IsNullOrWhiteSpace(appName))
        {
            sb.AppendLine($"App Name: {appName}");
        }

        if (!string.IsNullOrWhiteSpace(appDescription))
        {
            sb.AppendLine($"App Description: {appDescription}");
        }

        if (integrations is { Count: > 0 })
        {
            sb.AppendLine($"Connected Integrations: {string.Join(", ", integrations)}");
            sb.AppendLine("Ensure the generated code integrates and configures SDKs for these services.");
        }

        sb.AppendLine("Return clean, modular code with clear file paths.");
        return sb.ToString();
    }
}
