using Microsoft.EntityFrameworkCore;
using StunningBuilder.Api.Features.Apps;

namespace StunningBuilder.Api.Common.Database;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<App> Apps => Set<App>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
