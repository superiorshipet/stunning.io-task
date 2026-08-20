using Microsoft.Extensions.Diagnostics.HealthChecks;
using StackExchange.Redis;
using StunningBuilder.Api.Common.Database;

namespace StunningBuilder.Api.Common.Redis;

public static class RedisServiceExtensions
{
    public static IServiceCollection AddRedis(this IServiceCollection services, IConfiguration configuration)
    {
        var redisConfigString = ConnectionStringHelper.ResolveRedisConnectionString(configuration);
        var options = ConfigurationOptions.Parse(redisConfigString);
        options.AbortOnConnectFail = false;

        services.AddSingleton<IConnectionMultiplexer>(_ => ConnectionMultiplexer.Connect(options));

        return services;
    }
}

public sealed class RedisHealthCheck(IConnectionMultiplexer? redis = null) : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        if (redis is null)
        {
            return HealthCheckResult.Unhealthy("Redis multiplexer is not registered.");
        }

        try
        {
            var endPoint = redis.GetEndPoints().FirstOrDefault();
            if (endPoint is null)
            {
                return HealthCheckResult.Unhealthy("No Redis endpoints available.");
            }

            var server = redis.GetServer(endPoint);
            if (!server.IsConnected)
            {
                return HealthCheckResult.Degraded($"Redis endpoint {endPoint} is not connected yet.");
            }

            var latency = await server.PingAsync();
            return HealthCheckResult.Healthy($"Redis is responsive (latency: {latency.TotalMilliseconds:F1}ms).");
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy("Redis health check failed", ex);
        }
    }
}
