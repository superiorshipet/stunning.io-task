using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using StunningBuilder.Api.Common.Database;
using StunningBuilder.Api.Common.Errors;
using StunningBuilder.Api.Common.Health;
using StunningBuilder.Api.Common.Redis;
using StunningBuilder.Api.Common.Routing;
using StunningBuilder.Api.Features.Ai;
using StunningBuilder.Api.Features.Builds;

var builder = WebApplication.CreateBuilder(args);
const string CorsPolicyName = "FrontendClient";

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

// Configure AI and Build Services
builder.Services.AddHttpClient<OpenAiService>();
builder.Services.AddSingleton<BuildService>();

var configuredOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins")
    .GetChildren()
    .Select(origin => origin.Value)
    .Where(origin => !string.IsNullOrWhiteSpace(origin))
    .Select(origin => origin!.Trim())
    .ToArray();

if (configuredOrigins.Length == 0)
{
    configuredOrigins = (builder.Configuration["Cors:AllowedOrigins"] ?? string.Empty)
        .Split([',', ';'], StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
}

var allowedOrigins = configuredOrigins.Length > 0
    ? configuredOrigins
    : ["http://localhost:3000", "http://localhost:5173", "https://stunningio-task-production.up.railway.app"];

builder.Services.AddCors(options =>
{
    options.AddPolicy(CorsPolicyName, policy =>
    {
        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

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

// Normalize duplicate slashes in request paths (e.g. //api/v1 -> /api/v1)
app.Use(async (context, next) =>
{
    var path = context.Request.Path.Value;
    if (!string.IsNullOrEmpty(path) && path.Contains("//"))
    {
        while (path.Contains("//"))
        {
            path = path.Replace("//", "/");
        }
        context.Request.Path = path;
    }
    await next();
});

// Configure Middleware Pipeline
app.UseExceptionHandler();
app.UseStatusCodePages();
app.UseCors(CorsPolicyName);

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
