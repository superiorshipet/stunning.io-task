using Microsoft.EntityFrameworkCore;
using StunningBuilder.Api.Features.Apps;
using StunningBuilder.Api.Features.Integrations;

namespace StunningBuilder.Api.Common.Database;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<App> Apps => Set<App>();
    public DbSet<IntegrationConnection> IntegrationConnections => Set<IntegrationConnection>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
