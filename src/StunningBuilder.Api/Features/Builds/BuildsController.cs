using System.IO.Compression;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StunningBuilder.Api.Common.Database;

namespace StunningBuilder.Api.Features.Builds;

[ApiController]
[Route("api/v1/apps/{appId:guid}/builds")]
[Tags("App Builds & Deployment")]
public sealed class BuildsController(AppDbContext db, BuildService buildService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<AppBuildResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetBuilds(
        [FromRoute] Guid appId,
        CancellationToken cancellationToken = default)
    {
        var appExists = await db.Apps.AnyAsync(a => a.Id == appId, cancellationToken);
        if (!appExists)
        {
            return Problem(statusCode: StatusCodes.Status404NotFound, title: "App Not Found", detail: $"No app found with ID '{appId}'.");
        }

        var builds = await db.AppBuilds
            .AsNoTracking()
            .Where(b => b.AppId == appId)
            .OrderByDescending(b => b.CreatedAt)
            .Select(b => new AppBuildResponse(
                b.Id,
                b.AppId,
                b.BuildNumber,
                b.Status,
                b.TriggerType,
                b.CommitMessage,
                b.ArtifactUrl,
                b.ArtifactSizeBytes,
                b.StartedAt,
                b.CompletedAt,
                b.CreatedAt,
                b.UpdatedAt
            ))
            .ToListAsync(cancellationToken);

        return Ok(builds);
    }

    [HttpGet("{buildId:guid}")]
    [ProducesResponseType(typeof(AppBuildDetailResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetBuild(
        [FromRoute] Guid appId,
        [FromRoute] Guid buildId,
        CancellationToken cancellationToken = default)
    {
        var build = await db.AppBuilds
            .AsNoTracking()
            .FirstOrDefaultAsync(b => b.Id == buildId && b.AppId == appId, cancellationToken);

        if (build is null)
        {
            return Problem(statusCode: StatusCodes.Status404NotFound, title: "Build Not Found", detail: $"No build found with ID '{buildId}'.");
        }

        return Ok(new AppBuildDetailResponse(
            build.Id,
            build.AppId,
            build.BuildNumber,
            build.Status,
            build.TriggerType,
            build.CommitMessage,
            build.ArtifactUrl,
            build.ArtifactSizeBytes,
            build.Logs,
            build.ErrorMessage,
            build.StartedAt,
            build.CompletedAt,
            build.CreatedAt,
            build.UpdatedAt
        ));
    }

    [HttpPost]
    [ProducesResponseType(typeof(AppBuildResponse), StatusCodes.Status202Accepted)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> TriggerBuild(
        [FromRoute] Guid appId,
        [FromBody] TriggerBuildRequest? request,
        CancellationToken cancellationToken = default)
    {
        var app = await db.Apps.FirstOrDefaultAsync(a => a.Id == appId, cancellationToken);
        if (app is null)
        {
            return Problem(statusCode: StatusCodes.Status404NotFound, title: "App Not Found", detail: $"No app found with ID '{appId}'.");
        }

        var latestBuildNumber = await db.AppBuilds
            .Where(b => b.AppId == appId)
            .MaxAsync(b => (int?)b.BuildNumber, cancellationToken) ?? 0;

        var build = new AppBuild
        {
            Id = Guid.NewGuid(),
            AppId = appId,
            BuildNumber = latestBuildNumber + 1,
            Status = "queued",
            TriggerType = request?.TriggerType ?? "manual",
            CommitMessage = request?.CommitMessage,
            Logs = "Build queued...\n",
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        db.AppBuilds.Add(build);
        await db.SaveChangesAsync(cancellationToken);

        // Start async build execution
        buildService.StartBackgroundBuild(build.Id);

        var response = new AppBuildResponse(
            build.Id,
            build.AppId,
            build.BuildNumber,
            build.Status,
            build.TriggerType,
            build.CommitMessage,
            build.ArtifactUrl,
            build.ArtifactSizeBytes,
            build.StartedAt,
            build.CompletedAt,
            build.CreatedAt,
            build.UpdatedAt
        );

        return AcceptedAtAction(nameof(GetBuild), new { appId, buildId = build.Id }, response);
    }

    [HttpGet("{buildId:guid}/download")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DownloadArtifact(
        [FromRoute] Guid appId,
        [FromRoute] Guid buildId,
        CancellationToken cancellationToken = default)
    {
        var build = await db.AppBuilds
            .AsNoTracking()
            .FirstOrDefaultAsync(b => b.Id == buildId && b.AppId == appId, cancellationToken);

        if (build is null)
        {
            return Problem(statusCode: StatusCodes.Status404NotFound, title: "Build Not Found", detail: $"No build found with ID '{buildId}'.");
        }

        if (build.Status != "succeeded")
        {
            return Problem(statusCode: StatusCodes.Status400BadRequest, title: "Build Incomplete", detail: $"Build is currently in state '{build.Status}'. Download is only available for succeeded builds.");
        }

        var app = await db.Apps.AsNoTracking().FirstOrDefaultAsync(a => a.Id == appId, cancellationToken);
        var appName = app?.Name ?? "App";

        using var memoryStream = new MemoryStream();
        using (var archive = new ZipArchive(memoryStream, ZipArchiveMode.Create, true))
        {
            var readme = archive.CreateEntry("README.md");
            using var entryStream = readme.Open();
            using var writer = new StreamWriter(entryStream, Encoding.UTF8);
            writer.WriteLine($"# {appName} - Build #{build.BuildNumber}");
            writer.WriteLine();
            writer.WriteLine($"Generated by Stunning Builder on {build.CreatedAt:yyyy-MM-dd HH:mm:ss} UTC");
            writer.WriteLine($"Status: {build.Status}");
        }

        memoryStream.Position = 0;
        return File(memoryStream.ToArray(), "application/zip", $"{appName.ToLower().Replace(" ", "-")}-build-{build.BuildNumber}.zip");
    }
}
