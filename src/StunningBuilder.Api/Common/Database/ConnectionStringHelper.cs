using System.Text.RegularExpressions;
using Npgsql;
using StackExchange.Redis;

namespace StunningBuilder.Api.Common.Database;

public static class ConnectionStringHelper
{
    /// <summary>
    /// Resolves the PostgreSQL connection string from configuration or environment variables,
    /// supporting both standard ADO.NET format and Railway's URI format (postgresql://user:pass@host:port/db).
    /// </summary>
    public static string ResolvePostgresConnectionString(IConfiguration configuration)
    {
        var raw = Environment.GetEnvironmentVariable("DATABASE_URL")
                  ?? configuration.GetConnectionString("PostgreSQL")
                  ?? configuration.GetConnectionString("DefaultConnection");

        if (string.IsNullOrWhiteSpace(raw))
        {
            // Default local fallback
            return "Host=localhost;Port=5432;Database=railway;Username=postgres;Password=postgres;";
        }

        if (raw.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase) ||
            raw.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase))
        {
            return ConvertPostgresUriToNpgsqlConnectionString(raw);
        }

        return raw;
    }

    /// <summary>
    /// Resolves the Redis configuration string from configuration or environment variables,
    /// supporting both standard StackExchange.Redis format and redis:// URIs.
    /// </summary>
    public static string ResolveRedisConnectionString(IConfiguration configuration)
    {
        var raw = Environment.GetEnvironmentVariable("REDIS_URL")
                  ?? configuration.GetConnectionString("Redis");

        if (string.IsNullOrWhiteSpace(raw))
        {
            return "localhost:6379,abortConnect=false";
        }

        if (raw.StartsWith("redis://", StringComparison.OrdinalIgnoreCase) ||
            raw.StartsWith("rediss://", StringComparison.OrdinalIgnoreCase))
        {
            return ConvertRedisUriToConfigurationString(raw);
        }

        if (!raw.Contains("abortConnect=", StringComparison.OrdinalIgnoreCase))
        {
            raw = $"{raw},abortConnect=false";
        }

        return raw;
    }

    private static string ConvertPostgresUriToNpgsqlConnectionString(string uriString)
    {
        var uri = new Uri(uriString);
        var builder = new NpgsqlConnectionStringBuilder
        {
            Host = uri.Host,
            Port = uri.Port > 0 ? uri.Port : 5432,
            Database = uri.AbsolutePath.TrimStart('/'),
            SslMode = SslMode.Prefer
        };

        if (!string.IsNullOrEmpty(uri.UserInfo))
        {
            var parts = uri.UserInfo.Split(':', 2);
            builder.Username = Uri.UnescapeDataString(parts[0]);
            if (parts.Length > 1)
            {
                builder.Password = Uri.UnescapeDataString(parts[1]);
            }
        }

        return builder.ConnectionString;
    }

    private static string ConvertRedisUriToConfigurationString(string uriString)
    {
        var uri = new Uri(uriString);
        var host = uri.Host;
        var port = uri.Port > 0 ? uri.Port : 6379;
        var isSsl = uri.Scheme.Equals("rediss", StringComparison.OrdinalIgnoreCase);

        var config = ConfigurationOptions.Parse($"{host}:{port}");
        config.Ssl = isSsl;
        config.AbortOnConnectFail = false;

        if (!string.IsNullOrEmpty(uri.UserInfo))
        {
            var parts = uri.UserInfo.Split(':', 2);
            if (parts.Length > 1 && !string.IsNullOrEmpty(parts[1]))
            {
                config.Password = Uri.UnescapeDataString(parts[1]);
            }
            if (!string.IsNullOrEmpty(parts[0]) && !parts[0].Equals("default", StringComparison.OrdinalIgnoreCase))
            {
                config.User = Uri.UnescapeDataString(parts[0]);
            }
        }

        return config.ToString();
    }
}
