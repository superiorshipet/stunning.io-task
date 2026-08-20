using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StunningBuilder.Api.Common.Database;

namespace StunningBuilder.Api.Features.Apps;

[ApiController]
[Route("api/v1/apps")]
[Tags("Apps")]
public sealed class AppsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(AppListResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetApps(
        [FromQuery] string? status = null,
        [FromQuery] string? search = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = db.Apps.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(a => a.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.Trim().ToLower();
            query = query.Where(a => a.Name.ToLower().Contains(searchLower) ||
                                     a.Slug.ToLower().Contains(searchLower) ||
                                     (a.Description != null && a.Description.ToLower().Contains(searchLower)));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var apps = await query
            .OrderByDescending(a => a.UpdatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new AppResponse(
                a.Id,
                a.Name,
                a.Slug,
                a.Description,
                a.Template,
                a.Framework,
                a.Status,
                a.SettingsJson,
                a.CreatedAt,
                a.UpdatedAt
            ))
            .ToListAsync(cancellationToken);

        return Ok(new AppListResponse(apps, totalCount));
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(AppResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAppById(
        [FromRoute] Guid id,
        CancellationToken cancellationToken = default)
    {
        var app = await db.Apps
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);

        if (app is null)
        {
            return Problem(statusCode: StatusCodes.Status404NotFound, title: "App Not Found", detail: $"No app found with ID '{id}'.");
        }

        return Ok(new AppResponse(
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
        ));
    }

    [HttpPost]
    [ProducesResponseType(typeof(AppResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateApp(
        [FromBody] CreateAppRequest request,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            ModelState.AddModelError("Name", "App name cannot be empty.");
            return ValidationProblem(ModelState);
        }

        var slug = GenerateSlug(request.Name);
        var existingSlugCount = await db.Apps.CountAsync(a => a.Slug.StartsWith(slug), cancellationToken);
        if (existingSlugCount > 0)
        {
            slug = $"{slug}-{existingSlugCount + 1}";
        }

        var app = new App
        {
            Id = Guid.NewGuid(),
            Name = request.Name.Trim(),
            Slug = slug,
            Description = request.Description?.Trim(),
            Template = string.IsNullOrWhiteSpace(request.Template) ? "blank" : request.Template.Trim().ToLower(),
            Framework = string.IsNullOrWhiteSpace(request.Framework) ? "nextjs" : request.Framework.Trim().ToLower(),
            Status = "active",
            SettingsJson = request.SettingsJson,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        db.Apps.Add(app);
        await db.SaveChangesAsync(cancellationToken);

        var response = new AppResponse(
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

        return CreatedAtAction(nameof(GetAppById), new { id = app.Id }, response);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(AppResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateApp(
        [FromRoute] Guid id,
        [FromBody] UpdateAppRequest request,
        CancellationToken cancellationToken = default)
    {
        var app = await db.Apps.FirstOrDefaultAsync(a => a.Id == id, cancellationToken);
        if (app is null)
        {
            return Problem(statusCode: StatusCodes.Status404NotFound, title: "App Not Found", detail: $"No app found with ID '{id}'.");
        }

        if (string.IsNullOrWhiteSpace(request.Name))
        {
            ModelState.AddModelError("Name", "App name cannot be empty.");
            return ValidationProblem(ModelState);
        }

        app.Name = request.Name.Trim();
        app.Description = request.Description?.Trim();
        app.Template = string.IsNullOrWhiteSpace(request.Template) ? app.Template : request.Template.Trim().ToLower();
        app.Framework = string.IsNullOrWhiteSpace(request.Framework) ? app.Framework : request.Framework.Trim().ToLower();
        app.Status = string.IsNullOrWhiteSpace(request.Status) ? app.Status : request.Status.Trim().ToLower();
        app.SettingsJson = request.SettingsJson ?? app.SettingsJson;
        app.UpdatedAt = DateTimeOffset.UtcNow;

        await db.SaveChangesAsync(cancellationToken);

        return Ok(new AppResponse(
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
        ));
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteApp(
        [FromRoute] Guid id,
        CancellationToken cancellationToken = default)
    {
        var app = await db.Apps.FirstOrDefaultAsync(a => a.Id == id, cancellationToken);
        if (app is null)
        {
            return Problem(statusCode: StatusCodes.Status404NotFound, title: "App Not Found", detail: $"No app found with ID '{id}'.");
        }

        db.Apps.Remove(app);
        await db.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    private static string GenerateSlug(string name)
    {
        var clean = name.Trim().ToLower();
        var chars = clean.Where(c => char.IsLetterOrDigit(c) || c == ' ' || c == '-').ToArray();
        return new string(chars).Replace(' ', '-');
    }
}
