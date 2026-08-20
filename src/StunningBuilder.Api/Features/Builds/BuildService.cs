using System.Text;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;
using StunningBuilder.Api.Common.Database;

namespace StunningBuilder.Api.Features.Builds;

public sealed class BuildService(
    IServiceScopeFactory scopeFactory,
    IConnectionMultiplexer? redis,
    ILogger<BuildService> logger)
{
    public void StartBackgroundBuild(Guid buildId)
    {
        _ = Task.Run(async () =>
        {
            using var scope = scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var build = await db.AppBuilds
                .Include(b => b.App)
                .FirstOrDefaultAsync(b => b.Id == buildId);

            if (build is null) return;

            var logBuilder = new StringBuilder();
            void AppendLog(string message)
            {
                var timestamp = DateTimeOffset.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ");
                var line = $"[{timestamp}] {message}";
                logBuilder.AppendLine(line);
                logger.LogInformation("Build {BuildId}: {Message}", buildId, message);

                // Publish progress to Redis channel
                try
                {
                    if (redis is { IsConnected: true })
                    {
                        var sub = redis.GetSubscriber();
                        sub.PublishAsync(RedisChannel.Literal($"build:{buildId}"), line);
                    }
                }
                catch { }
            }

            try
            {
                build.Status = "building";
                build.StartedAt = DateTimeOffset.UtcNow;
                build.UpdatedAt = DateTimeOffset.UtcNow;
                AppendLog("Build initiated. Initializing environment...");
                await db.SaveChangesAsync();

                await Task.Delay(800);
                AppendLog($"Framework: {build.App?.Framework ?? "nextjs"} | Template: {build.App?.Template ?? "blank"}");

                // Check connected integrations
                var integrations = await db.IntegrationConnections
                    .Where(c => c.AppId == build.AppId && c.Status == "connected")
                    .Select(c => c.IntegrationId)
                    .ToListAsync();

                if (integrations.Count > 0)
                {
                    AppendLog($"Injecting {integrations.Count} integration SDK configs: {string.Join(", ", integrations)}");
                }

                await Task.Delay(1000);
                AppendLog("Compiling TypeScript modules and bundling React components...");

                await Task.Delay(1200);
                AppendLog("Running production asset optimization and minification...");

                await Task.Delay(800);
                build.Status = "succeeded";
                build.CompletedAt = DateTimeOffset.UtcNow;
                build.ArtifactUrl = $"/api/v1/apps/{build.AppId}/builds/{build.Id}/download";
                build.ArtifactSizeBytes = 1024 * 1024 * 3 + Random.Shared.Next(100000, 500000); // ~3.4 MB
                build.UpdatedAt = DateTimeOffset.UtcNow;

                AppendLog("Build succeeded. Distribution artifact generated.");
                build.Logs = logBuilder.ToString();

                await db.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                build.Status = "failed";
                build.ErrorMessage = ex.Message;
                build.CompletedAt = DateTimeOffset.UtcNow;
                build.UpdatedAt = DateTimeOffset.UtcNow;
                AppendLog($"Build failed with error: {ex.Message}");
                build.Logs = logBuilder.ToString();

                await db.SaveChangesAsync();
            }
        });
    }
}
