using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StunningBuilder.Api.Features.Apps;

namespace StunningBuilder.Api.Features.Ai;

public class GenerationSession
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? AppId { get; set; }
    public string Prompt { get; set; } = string.Empty;
    public string GenerationType { get; set; } = "app_scaffold";
    public string Model { get; set; } = "gpt-4o";
    public string? SystemPrompt { get; set; }
    public string? ResponseContent { get; set; }
    public string? StructuredOutputJson { get; set; }
    public int? PromptTokens { get; set; }
    public int? CompletionTokens { get; set; }
    public string Status { get; set; } = "completed";
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public App? App { get; set; }
}

public class GenerationSessionEntityConfiguration : IEntityTypeConfiguration<GenerationSession>
{
    public void Configure(EntityTypeBuilder<GenerationSession> builder)
    {
        builder.ToTable("generation_sessions");

        builder.HasKey(g => g.Id);

        builder.Property(g => g.Prompt)
            .IsRequired();

        builder.Property(g => g.GenerationType)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(g => g.Model)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(g => g.Status)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(g => g.StructuredOutputJson)
            .HasColumnType("jsonb");

        builder.HasOne(g => g.App)
            .WithMany()
            .HasForeignKey(g => g.AppId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(g => g.AppId);
        builder.HasIndex(g => g.CreatedAt);
    }
}
