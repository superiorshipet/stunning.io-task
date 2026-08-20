using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StunningBuilder.Api.Common.Database;

namespace StunningBuilder.Api.Features.Ai;

[ApiController]
[Tags("AI Generation")]
public sealed class AiController(OpenAiService aiService, AppDbContext db) : ControllerBase
{
    [HttpPost("api/v1/generate")]
    [ProducesResponseType(typeof(GenerateAppResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Generate(
        [FromBody] GenerateAppRequest request,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Prompt))
        {
            ModelState.AddModelError("Prompt", "Prompt cannot be empty.");
            return ValidationProblem(ModelState);
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
            Model = request.Model ?? "openai/gpt-oss-120b",
            SystemPrompt = systemPrompt,
            ResponseContent = result.Content,
            StructuredOutputJson = structure != null ? result.Content : null,
            PromptTokens = result.PromptTokens,
            CompletionTokens = result.CompletionTokens,
            Status = "completed",
            CreatedAt = DateTimeOffset.UtcNow
        };

        try
        {
            db.GenerationSessions.Add(session);
            await db.SaveChangesAsync(cancellationToken);
        }
        catch
        {
            // Resilient DB save
        }

        return Ok(new GenerateAppResponse(
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

    [HttpPost("api/v1/generate/stream")]
    [Produces("text/event-stream")]
    public async Task StreamGeneration(
        [FromBody] GenerateAppRequest request,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Prompt))
        {
            Response.StatusCode = StatusCodes.Status400BadRequest;
            await Response.WriteAsync("Prompt is required.", cancellationToken);
            return;
        }

        Response.Headers.Append("Content-Type", "text/event-stream");
        Response.Headers.Append("Cache-Control", "no-cache");
        Response.Headers.Append("Connection", "keep-alive");

        var systemPrompt = BuildSystemPrompt(request.Template, request.Framework, request.RequestedIntegrations);

        await foreach (var token in aiService.StreamGenerateAsync(request.Prompt, systemPrompt, request.Model, cancellationToken))
        {
            var chunk = new GenerationStreamChunk("delta", Content: token);
            var json = JsonSerializer.Serialize(chunk);
            await Response.WriteAsync($"data: {json}\n\n", Encoding.UTF8, cancellationToken);
            await Response.Body.FlushAsync(cancellationToken);
        }

        var doneChunk = new GenerationStreamChunk("done");
        await Response.WriteAsync($"data: {JsonSerializer.Serialize(doneChunk)}\n\n", Encoding.UTF8, cancellationToken);
        await Response.Body.FlushAsync(cancellationToken);
    }

    [HttpPost("api/v1/apps/{appId:guid}/generate")]
    [ProducesResponseType(typeof(GenerateAppResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GenerateForApp(
        [FromRoute] Guid appId,
        [FromBody] GenerateAppRequest request,
        CancellationToken cancellationToken = default)
    {
        var app = await db.Apps.FirstOrDefaultAsync(a => a.Id == appId, cancellationToken);
        if (app is null)
        {
            return Problem(statusCode: StatusCodes.Status404NotFound, title: "App Not Found");
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
            Model = request.Model ?? "openai/gpt-oss-120b",
            SystemPrompt = systemPrompt,
            ResponseContent = result.Content,
            StructuredOutputJson = structure != null ? result.Content : null,
            PromptTokens = result.PromptTokens,
            CompletionTokens = result.CompletionTokens,
            Status = "completed",
            CreatedAt = DateTimeOffset.UtcNow
        };

        try
        {
            db.GenerationSessions.Add(session);
            await db.SaveChangesAsync(cancellationToken);
        }
        catch { }

        return Ok(new GenerateAppResponse(
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

    [HttpPost("api/v1/apps/{appId:guid}/generate/stream")]
    [Produces("text/event-stream")]
    public async Task StreamForApp(
        [FromRoute] Guid appId,
        [FromBody] GenerateAppRequest request,
        CancellationToken cancellationToken = default)
    {
        var app = await db.Apps.FirstOrDefaultAsync(a => a.Id == appId, cancellationToken);
        if (app is null)
        {
            Response.StatusCode = StatusCodes.Status404NotFound;
            await Response.WriteAsync("App not found", cancellationToken);
            return;
        }

        var connectedIntegrations = await db.IntegrationConnections
            .Where(c => c.AppId == appId)
            .Select(c => c.IntegrationId)
            .ToListAsync(cancellationToken);

        Response.Headers.Append("Content-Type", "text/event-stream");
        Response.Headers.Append("Cache-Control", "no-cache");
        Response.Headers.Append("Connection", "keep-alive");

        var systemPrompt = BuildSystemPrompt(app.Template, app.Framework, connectedIntegrations, app.Name, app.Description);

        await foreach (var token in aiService.StreamGenerateAsync(request.Prompt, systemPrompt, request.Model, cancellationToken))
        {
            var chunk = new GenerationStreamChunk("delta", Content: token);
            var json = JsonSerializer.Serialize(chunk);
            await Response.WriteAsync($"data: {json}\n\n", Encoding.UTF8, cancellationToken);
            await Response.Body.FlushAsync(cancellationToken);
        }

        var doneChunk = new GenerationStreamChunk("done");
        await Response.WriteAsync($"data: {JsonSerializer.Serialize(doneChunk)}\n\n", Encoding.UTF8, cancellationToken);
        await Response.Body.FlushAsync(cancellationToken);
    }

    [HttpGet("api/v1/apps/{appId:guid}/generations")]
    [ProducesResponseType(typeof(IReadOnlyList<GenerationHistoryResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAppGenerationHistory(
        [FromRoute] Guid appId,
        CancellationToken cancellationToken = default)
    {
        var exists = await db.Apps.AnyAsync(a => a.Id == appId, cancellationToken);
        if (!exists)
        {
            return Problem(statusCode: StatusCodes.Status404NotFound, title: "App Not Found");
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

        return Ok(history);
    }

    private static string BuildSystemPrompt(
        string? template,
        string? framework,
        IReadOnlyList<string>? integrations,
        string? appName = null,
        string? appDescription = null)
    {
        var sb = new StringBuilder();
        sb.AppendLine("You are Stunning Builder, an expert AI Software Architect and Principal Engineer.");
        sb.AppendLine("Your task is to analyze the user's idea and generate an authentic, comprehensive, implementation-ready Technical Build Plan in clean GitHub-flavored Markdown.");
        sb.AppendLine($"Target Framework: {framework ?? "nextjs 15"}");
        sb.AppendLine($"Target Architecture: {template ?? "saas / microservices"}");

        if (!string.IsNullOrWhiteSpace(appName))
        {
            sb.AppendLine($"Application Name: {appName}");
        }

        if (!string.IsNullOrWhiteSpace(appDescription))
        {
            sb.AppendLine($"Application Description: {appDescription}");
        }

        if (integrations is { Count: > 0 })
        {
            sb.AppendLine($"Selected Context Integrations: {string.Join(", ", integrations)}");
            sb.AppendLine("IMPORTANT: Deeply incorporate EACH of these selected integrations into the architecture, explaining their exact business role, API endpoints, and webhook events specific to the user's idea.");
        }

        sb.AppendLine();
        sb.AppendLine("Structure your response using these clear Markdown sections:");
        sb.AppendLine("# [Application Title & Architecture Specification]");
        sb.AppendLine("## 01. Overview & System Strategy");
        sb.AppendLine("## 02. System Architecture & Topology (Include an ASCII or Mermaid diagram)");
        sb.AppendLine("## 03. Recommended Technology Stack (Layer, Technology, and Concrete Reason)");
        sb.AppendLine("## 04. Integration Connectors & Webhook Protocols (Detail how each selected integration works for this specific domain)");
        sb.AppendLine("## 05. Implementation Roadmap (Step-by-step milestones with estimated effort)");
        sb.AppendLine("## 06. Engineering Risks & Mitigations");
        sb.AppendLine("## 07. Scaffolded Code & Core Configuration Files (Provide actual code files in ```typescript or ```csharp)");
        sb.AppendLine();
        sb.AppendLine("Be specific, technical, and creative. Do not output generic placeholder text.");
        return sb.ToString();
    }
}
