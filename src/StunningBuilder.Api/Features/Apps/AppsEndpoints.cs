using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StunningBuilder.Api.Common.Database;

namespace StunningBuilder.Api.Features.Apps;

public static class AppsEndpoints
{
    public static IEndpointRouteBuilder MapAppsEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/apps")
            .WithTags("Apps");

        group.MapGet("/", GetApps)
            .WithName("GetApps")
            .WithSummary("List all apps")
            .WithDescription("Retrieves a paginated list of created apps with optional filtering by status and search query.")
            .Produces<AppListResponse>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status500InternalServerError);

        group.MapGet("/{id:guid}", GetAppById)
            .WithName("GetAppById")
            .WithSummary("Get app by ID")
            .WithDescription("Retrieves detailed configuration and state for a specific app by its unique identifier.")
            .Produces<AppResponse>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status500InternalServerError);

        group.MapPost("/", CreateApp)
            .WithName("CreateApp")
            .WithSummary("Create a new app")
            .WithDescription("Creates a new application with specified template, framework, and configuration settings.")
            .Produces<AppResponse>(StatusCodes.Status201Created)
            .ProducesValidationProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status500InternalServerError);

        group.MapPut("/{id:guid}", UpdateApp)
            .WithName("UpdateApp")
            .WithSummary("Update an app")
            .WithDescription("Updates the configuration, status, or metadata of an existing application.")
            .Produces<AppResponse>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesValidationProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status500InternalServerError);

        group.MapDelete("/{id:guid}", DeleteApp)
            .WithName("DeleteApp")
            .WithSummary("Delete an app")
            .WithDescription("Permanently removes an application.")
            .Produces(StatusCodes.Status204NoContent)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status500InternalServerError);

        return endpoints;
    }

    public static async Task<IResult> GetApps(
        [FromServices] AppDbContext db,
        [FromQuery] string? status,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = db.Apps.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(a => a.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(a => a.Name.ToLower().Contains(term) || (a.Description != null && a.Description.ToLower().Contains(term)));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(a => a.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => ToResponse(a))
            .ToListAsync(cancellationToken);

        return TypedResults.Ok(new AppListResponse(items, totalCount));
    }

    public static async Task<IResult> GetAppById(
        [FromRoute] Guid id,
        [FromServices] AppDbContext db,
        CancellationToken cancellationToken)
    {
        var app = await db.Apps.AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);

        if (app is null)
        {
            return TypedResults.Problem(
                statusCode: StatusCodes.Status404NotFound,
                title: "App Not Found",
                detail: $"Application with ID '{id}' was not found.");
        }

        return TypedResults.Ok(ToResponse(app));
    }

    public static async Task<IResult> CreateApp(
        [FromBody] CreateAppRequest request,
        [FromServices] AppDbContext db,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return TypedResults.ValidationProblem(new Dictionary<string, string[]>
            {
                ["Name"] = ["App name is required."]
            });
        }

        var slug = GenerateSlug(request.Name);

        var app = new App
        {
            Id = Guid.NewGuid(),
            Name = request.Name.Trim(),
            Slug = slug,
            Description = request.Description?.Trim(),
            Template = string.IsNullOrWhiteSpace(request.Template) ? "blank" : request.Template.Trim().ToLowerInvariant(),
            Framework = string.IsNullOrWhiteSpace(request.Framework) ? "nextjs" : request.Framework.Trim().ToLowerInvariant(),
            Status = "draft",
            SettingsJson = request.SettingsJson,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        db.Apps.Add(app);
        await db.SaveChangesAsync(cancellationToken);

        return TypedResults.Created($"/api/v1/apps/{app.Id}", ToResponse(app));
    }

    public static async Task<IResult> UpdateApp(
        [FromRoute] Guid id,
        [FromBody] UpdateAppRequest request,
        [FromServices] AppDbContext db,
        CancellationToken cancellationToken)
    {
        var app = await db.Apps.FirstOrDefaultAsync(a => a.Id == id, cancellationToken);

        if (app is null)
        {
            return TypedResults.Problem(
                statusCode: StatusCodes.Status404NotFound,
                title: "App Not Found",
                detail: $"Application with ID '{id}' was not found.");
        }

        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return TypedResults.ValidationProblem(new Dictionary<string, string[]>
            {
                ["Name"] = ["App name is required."]
            });
        }

        app.Name = request.Name.Trim();
        app.Slug = GenerateSlug(request.Name);
        app.Description = request.Description?.Trim();
        app.Template = string.IsNullOrWhiteSpace(request.Template) ? app.Template : request.Template.Trim().ToLowerInvariant();
        app.Framework = string.IsNullOrWhiteSpace(request.Framework) ? app.Framework : request.Framework.Trim().ToLowerInvariant();
        app.Status = string.IsNullOrWhiteSpace(request.Status) ? app.Status : request.Status.Trim().ToLowerInvariant();
        app.SettingsJson = request.SettingsJson ?? app.SettingsJson;
        app.UpdatedAt = DateTimeOffset.UtcNow;

        await db.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(ToResponse(app));
    }

    public static async Task<IResult> DeleteApp(
        [FromRoute] Guid id,
        [FromServices] AppDbContext db,
        CancellationToken cancellationToken)
    {
        var app = await db.Apps.FirstOrDefaultAsync(a => a.Id == id, cancellationToken);

        if (app is null)
        {
            return TypedResults.Problem(
                statusCode: StatusCodes.Status404NotFound,
                title: "App Not Found",
                detail: $"Application with ID '{id}' was not found.");
        }

        db.Apps.Remove(app);
        await db.SaveChangesAsync(cancellationToken);

        return TypedResults.NoContent();
    }

    private static AppResponse ToResponse(App app) =>
        new(
            app.Id,
            app.Name,
            app.Slug,
            app.Description,
            app.Template,
            app.Framework,
            app.Status,
            app.SettingsJson,
            app.CreatedAt,
            app.UpdatedAt
        );

    private static string GenerateSlug(string name)
    {
        var cleaned = Regex.Replace(name.ToLowerInvariant(), @"[^a-z0-9\s-]", "");
        cleaned = Regex.Replace(cleaned, @"\s+", "-").Trim('-');
        return string.IsNullOrWhiteSpace(cleaned) ? $"app-{Guid.NewGuid().ToString()[..8]}" : cleaned;
    }
}
