using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StunningBuilder.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddAiGenerationSessions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "generation_sessions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AppId = table.Column<Guid>(type: "uuid", nullable: true),
                    Prompt = table.Column<string>(type: "text", nullable: false),
                    GenerationType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Model = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    SystemPrompt = table.Column<string>(type: "text", nullable: true),
                    ResponseContent = table.Column<string>(type: "text", nullable: true),
                    StructuredOutputJson = table.Column<string>(type: "jsonb", nullable: true),
                    PromptTokens = table.Column<int>(type: "integer", nullable: true),
                    CompletionTokens = table.Column<int>(type: "integer", nullable: true),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_generation_sessions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_generation_sessions_apps_AppId",
                        column: x => x.AppId,
                        principalTable: "apps",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_generation_sessions_AppId",
                table: "generation_sessions",
                column: "AppId");

            migrationBuilder.CreateIndex(
                name: "IX_generation_sessions_CreatedAt",
                table: "generation_sessions",
                column: "CreatedAt");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "generation_sessions");
        }
    }
}
