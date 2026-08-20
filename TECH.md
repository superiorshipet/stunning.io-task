# TECH

## Chosen technology: .NET 10 LTS

.NET 10 is Microsoft's current Long Term Support release of .NET. It was released in November 2025 and is supported as an active LTS platform through November 2028. It includes the runtime, ASP.NET Core, Entity Framework Core, C# language updates, performance work, and modern tooling improvements for cloud and AI-enabled applications.

Sources:

- https://devblogs.microsoft.com/dotnet/announcing-dotnet-10/
- https://dotnet.microsoft.com/en-us/platform/support/policy

## How could Stunning use it?

Stunning could use .NET 10 for the backend builder platform because the product needs fast APIs, streaming responses, durable background work, strong typing, database access, and production-friendly deployment.

In this project, .NET 10 fits especially well for:

- Minimal API feature slices for prompt generation, integrations, apps, and builds.
- Server-Sent Events for streaming AI output to the browser.
- EF Core with PostgreSQL for persisted generation sessions and saved apps.
- Strong typed DTOs around AI prompts and responses.
- Health checks and containerized deployment paths.

## What are its limitations?

- The target runtime must exist on the deployment host or container image, so local and CI environments need to be aligned.
- Some third-party packages may lag behind a new major .NET release.
- New platform features do not remove the need for careful production engineering around AI cost, latency, retries, security, and observability.
- Teams on older LTS versions may need migration time, package audits, and regression testing before adopting it broadly.

## Would I use it today?

Yes, for a new backend service like Stunning Builder. It is an LTS release, has active support, and gives the project a modern ASP.NET Core stack without betting on a short-lived preview runtime.

For an existing production system, I would adopt it after a normal compatibility pass: upgrade packages, run integration tests, validate Docker and CI images, and watch performance and error rates during rollout.
