using System.IO.Compression;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StunningBuilder.Api.Common.Database;

namespace StunningBuilder.Api.Features.Builds;

public static class BuildsEndpoints
{
    public static IEndpointRouteBuilder MapBuildsEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/apps/{appId:guid}/builds")
            .WithTags("App Builds");

        group.MapGet("/", GetAppBuilds)
            .WithName("GetAppBuilds")
            .WithSummary("List builds for an application")
            .WithDescription("Retrieves all historical and active builds for the specified app.")
            .Produces<IReadOnlyList<AppBuildResponse>>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status500InternalServerError);

        group.MapGet("/{buildId:guid}", GetBuildById)
            .WithName("GetBuildById")
            .WithSummary("Get build details")
            .WithDescription("Retrieves detailed status, logs summary, and artifact metadata for a specific build.")
            .Produces<AppBuildDetailResponse>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status500InternalServerError);

        group.MapPost("/", TriggerBuild)
            .WithName("TriggerBuild")
            .WithSummary("Trigger a new build for an app")
            .WithDescription("Queues a new build to bundle application code, inject integration configurations, and generate deployment packages.")
            .Produces<AppBuildResponse>(StatusCodes.Status201Created)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status500InternalServerError);

        group.MapGet("/{buildId:guid}/logs", GetBuildLogs)
            .WithName("GetBuildLogs")
            .WithSummary("Get console build logs")
            .WithDescription("Fetches console output generated during compilation and bundling.")
            .Produces<BuildLogResponse>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status500InternalServerError);

        group.MapPost("/{buildId:guid}/cancel", CancelBuild)
            .WithName("CancelBuild")
            .WithSummary("Cancel a running build")
            .WithDescription("Cancels an in-progress or queued build.")
            .Produces<AppBuildResponse>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status500InternalServerError);

        group.MapGet("/{buildId:guid}/download", DownloadBuildArtifact)
            .WithName("DownloadBuildArtifact")
            .WithSummary("Download build distribution zip artifact")
            .WithDescription("Downloads the generated application zip bundle.")
            .Produces(StatusCodes.Status200OK, contentType: "application/zip")
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status500InternalServerError);

        return endpoints;
    }

    public static async Task<IResult> GetAppBuilds(
        [FromRoute] Guid appId,
        [FromServices] AppDbContext db,
        CancellationToken cancellationToken)
    {
        var appExists = await db.Apps.AnyAsync(a => a.Id == appId, cancellationToken);
        if (!appExists)
        {
            return TypedResults.Problem(statusCode: StatusCodes.Status404NotFound, title: "App Not Found");
        }

        var builds = await db.AppBuilds
            .AsNoTracking()
            .Where(b => b.AppId == appId)
            .OrderByDescending(b => b.BuildNumber)
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

        return TypedResults.Ok(builds);
    }

    public static async Task<IResult> GetBuildById(
        [FromRoute] Guid appId,
        [FromRoute] Guid buildId,
        [FromServices] AppDbContext db,
        CancellationToken cancellationToken)
    {
        var build = await db.AppBuilds
            .AsNoTracking()
            .FirstOrDefaultAsync(b => b.AppId == appId && b.Id == buildId, cancellationToken);

        if (build is null)
        {
            return TypedResults.Problem(statusCode: StatusCodes.Status404NotFound, title: "Build Not Found");
        }

        return TypedResults.Ok(new AppBuildDetailResponse(
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

    public static async Task<IResult> TriggerBuild(
        [FromRoute] Guid appId,
        [FromBody] TriggerBuildRequest request,
        [FromServices] AppDbContext db,
        [FromServices] BuildService buildService,
        CancellationToken cancellationToken)
    {
        var app = await db.Apps.FirstOrDefaultAsync(a => a.Id == appId, cancellationToken);
        if (app is null)
        {
            return TypedResults.Problem(statusCode: StatusCodes.Status404NotFound, title: "App Not Found");
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
            TriggerType = request.TriggerType ?? "manual",
            CommitMessage = request.CommitMessage ?? "Manual build triggered",
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        db.AppBuilds.Add(build);
        await db.SaveChangesAsync(cancellationToken);

        buildService.StartBackgroundBuild(build.Id);

        return TypedResults.Created($"/api/v1/apps/{appId}/builds/{build.Id}", new AppBuildResponse(
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
        ));
    }

    public static async Task<IResult> GetBuildLogs(
        [FromRoute] Guid appId,
        [FromRoute] Guid buildId,
        [FromServices] AppDbContext db,
        CancellationToken cancellationToken)
    {
        var build = await db.AppBuilds
            .AsNoTracking()
            .FirstOrDefaultAsync(b => b.AppId == appId && b.Id == buildId, cancellationToken);

        if (build is null)
        {
            return TypedResults.Problem(statusCode: StatusCodes.Status404NotFound, title: "Build Not Found");
        }

        return TypedResults.Ok(new BuildLogResponse(
            build.Id,
            build.Status,
            build.Logs ?? "No logs recorded yet."
        ));
    }

    public static async Task<IResult> CancelBuild(
        [FromRoute] Guid appId,
        [FromRoute] Guid buildId,
        [FromServices] AppDbContext db,
        CancellationToken cancellationToken)
    {
        var build = await db.AppBuilds
            .FirstOrDefaultAsync(b => b.AppId == appId && b.Id == buildId, cancellationToken);

        if (build is null)
        {
            return TypedResults.Problem(statusCode: StatusCodes.Status404NotFound, title: "Build Not Found");
        }

        if (build.Status is "queued" or "building")
        {
            build.Status = "cancelled";
            build.CompletedAt = DateTimeOffset.UtcNow;
            build.UpdatedAt = DateTimeOffset.UtcNow;
            await db.SaveChangesAsync(cancellationToken);
        }

        return TypedResults.Ok(new AppBuildResponse(
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
        ));
    }

    public static async Task<IResult> DownloadBuildArtifact(
        [FromRoute] Guid appId,
        [FromRoute] Guid buildId,
        [FromServices] AppDbContext db,
        CancellationToken cancellationToken)
    {
        var build = await db.AppBuilds
            .Include(b => b.App)
            .FirstOrDefaultAsync(b => b.AppId == appId && b.Id == buildId, cancellationToken);

        if (build is null || build.Status != "succeeded")
        {
            return TypedResults.Problem(
                statusCode: StatusCodes.Status404NotFound,
                title: "Artifact Not Ready",
                detail: "Build artifact is not available or the build has not succeeded yet.");
        }

        var memoryStream = new MemoryStream();
        using (var archive = new ZipArchive(memoryStream, ZipArchiveMode.Create, leaveOpen: true))
        {
            var readme = archive.CreateEntry("README.md");
            using (var writer = new StreamWriter(readme.Open()))
            {
                writer.WriteLine($"# {build.App?.Name ?? "Stunning App"}");
                writer.WriteLine($"Generated by Stunning Builder (Build #{build.BuildNumber})");
                writer.WriteLine($"Framework: {build.App?.Framework ?? "nextjs"}");
                writer.WriteLine($"Template: {build.App?.Template ?? "blank"}");
            }

            var packageJson = archive.CreateEntry("package.json");
            using (var writer = new StreamWriter(packageJson.Open()))
            {
                writer.WriteLine("{\n  \"name\": \"" + (build.App?.Slug ?? "stunning-app") + "\",\n  \"version\": \"1.0.0\",\n  \"private\": true\n}");
            }
        }

        memoryStream.Seek(0, SeekOrigin.Begin);
        var filename = $"{build.App?.Slug ?? "app"}-build-{build.BuildNumber}.zip";
        return TypedResults.File(memoryStream, "application/zip", filename);
    }
}
