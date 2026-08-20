using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace StunningBuilder.Api.Features.Apps;

public class App
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Template { get; set; } = "blank";
    public string Framework { get; set; } = "nextjs";
    public string Status { get; set; } = "draft";
    public string? SettingsJson { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}

public class AppEntityConfiguration : IEntityTypeConfiguration<App>
{
    public void Configure(EntityTypeBuilder<App> builder)
    {
        builder.ToTable("apps");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.Name)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(a => a.Slug)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(a => a.Description)
            .HasMaxLength(500);

        builder.Property(a => a.Template)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(a => a.Framework)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(a => a.Status)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(a => a.SettingsJson)
            .HasColumnType("jsonb");

        builder.HasIndex(a => a.Slug);
        builder.HasIndex(a => a.CreatedAt);
    }
}
