using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StunningBuilder.Api.Features.Apps;

namespace StunningBuilder.Api.Features.Builds;

public class AppBuild
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid AppId { get; set; }
    public int BuildNumber { get; set; }
    public string Status { get; set; } = "queued"; // queued, building, succeeded, failed, cancelled
    public string TriggerType { get; set; } = "manual"; // manual, ai_generation, webhook
    public string? CommitMessage { get; set; }
    public string? ArtifactUrl { get; set; }
    public long? ArtifactSizeBytes { get; set; }
    public string? Logs { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTimeOffset? StartedAt { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;

    public App? App { get; set; }
}

public class AppBuildEntityConfiguration : IEntityTypeConfiguration<AppBuild>
{
    public void Configure(EntityTypeBuilder<AppBuild> builder)
    {
        builder.ToTable("app_builds");

        builder.HasKey(b => b.Id);

        builder.Property(b => b.Status)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(b => b.TriggerType)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(b => b.CommitMessage)
            .HasMaxLength(300);

        builder.Property(b => b.ArtifactUrl)
            .HasMaxLength(500);

        builder.HasOne(b => b.App)
            .WithMany()
            .HasForeignKey(b => b.AppId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(b => new { b.AppId, b.BuildNumber });
        builder.HasIndex(b => b.CreatedAt);
    }
}
