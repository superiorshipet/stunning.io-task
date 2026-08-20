using StunningBuilder.Api.Common.Errors;
using StunningBuilder.Api.Common.Routing;

var builder = WebApplication.CreateBuilder(args);

// Configure ProblemDetails & Global Exception Handling
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

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
}

app.UseHttpsRedirection();

// Map API Endpoints
app.MapApiV1Endpoints();

app.Run();

public partial class Program;
