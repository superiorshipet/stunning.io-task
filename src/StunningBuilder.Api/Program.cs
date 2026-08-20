using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using StunningBuilder.Api.Common.Database;
using StunningBuilder.Api.Common.Errors;
using StunningBuilder.Api.Common.Health;
using StunningBuilder.Api.Common.Redis;
using StunningBuilder.Api.Common.Routing;
using StunningBuilder.Api.Features.Ai;

var builder = WebApplication.CreateBuilder(args);

// Configure ProblemDetails & Global Exception Handling
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

// Configure Database (EF Core / PostgreSQL)
var postgresConnectionString = ConnectionStringHelper.ResolvePostgresConnectionString(builder.Configuration);
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(postgresConnectionString);
});

// Configure Redis
builder.Services.AddRedis(builder.Configuration);

// Configure OpenAI Service
builder.Services.AddSingleton<OpenAiService>();

// Configure Health Checks
builder.Services.AddAppHealthChecks(builder.Configuration);

// Configure OpenAPI
builder.Services.AddOpenApi(options =>
{
    options.AddDocumentTransformer((document, context, cancellationToken) =>
    {
        document.Info.Title = "Stunning Builder API";
        document.Info.Version = "v1";
        document.Info.Description = "Backend API for the Stunning Builder platform.";
        return Task.CompletedTask;
    });
});

var app = builder.Build();

// Configure Middleware Pipeline
app.UseExceptionHandler();
app.UseStatusCodePages();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();

    // Redirect root and /swagger to the interactive Scalar API docs
    app.MapGet("/", () => Results.Redirect("/scalar/v1")).ExcludeFromDescription();
    app.MapGet("/swagger", () => Results.Redirect("/scalar/v1")).ExcludeFromDescription();

    // Auto-migrate database in development when connection is reachable
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    try
    {
        if (db.Database.CanConnect())
        {
            db.Database.Migrate();
        }
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogWarning(ex, "Could not run database migrations at startup.");
    }
}

app.UseHttpsRedirection();

// Health Check Endpoints
app.MapAppHealthChecks();

// Map API Endpoints
app.MapApiV1Endpoints();

app.Run();

public partial class Program;
