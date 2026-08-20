using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StunningBuilder.Api.Features.Apps;

namespace StunningBuilder.Api.Features.Integrations;

public class IntegrationConnection
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid AppId { get; set; }
    public string IntegrationId { get; set; } = string.Empty;
    public string? AccountName { get; set; }
    public string? ExternalIdentifier { get; set; }
    public string? CredentialsJson { get; set; }
    public string Status { get; set; } = "connected";
    public DateTimeOffset? LastSyncedAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;

    public App? App { get; set; }
}

public class IntegrationConnectionEntityConfiguration : IEntityTypeConfiguration<IntegrationConnection>
{
    public void Configure(EntityTypeBuilder<IntegrationConnection> builder)
    {
        builder.ToTable("integration_connections");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.IntegrationId)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(c => c.AccountName)
            .HasMaxLength(150);

        builder.Property(c => c.ExternalIdentifier)
            .HasMaxLength(200);

        builder.Property(c => c.CredentialsJson)
            .HasColumnType("jsonb");

        builder.Property(c => c.Status)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasOne(c => c.App)
            .WithMany()
            .HasForeignKey(c => c.AppId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(c => new { c.AppId, c.IntegrationId });
        builder.HasIndex(c => c.CreatedAt);
    }
}
