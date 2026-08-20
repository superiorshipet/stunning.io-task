using Microsoft.EntityFrameworkCore;
using StunningBuilder.Api.Features.Ai;
using StunningBuilder.Api.Features.Apps;
using StunningBuilder.Api.Features.Builds;
using StunningBuilder.Api.Features.Integrations;

namespace StunningBuilder.Api.Common.Database;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<App> Apps => Set<App>();
    public DbSet<IntegrationConnection> IntegrationConnections => Set<IntegrationConnection>();
    public DbSet<GenerationSession> GenerationSessions => Set<GenerationSession>();
    public DbSet<AppBuild> AppBuilds => Set<AppBuild>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
