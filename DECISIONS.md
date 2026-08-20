# DECISIONS

## What did I improve?

- Built the assignment as a full-stack product flow instead of a static mockup: React landing page, prompt composer, integration selector, ASP.NET Core API, OpenAI-backed generation, SSE streaming, and a rendered technical plan workspace.
- Made selected integrations part of the AI context by sending them from the client as `requestedIntegrations` and injecting them into the backend system prompt as connected integration context.
- Added a dummy integration catalog for Stripe, Shopify, Gmail, Slack, and Google Sheets with frontend fallback data so the landing page remains usable even if the API is unavailable during a local demo.
- Made the result screen display the actual AI model output instead of a locally generated technical-plan template.
- Kept the code organized by feature slices on both frontend and backend so the task stays understandable and easy to extend.

## What did I intentionally leave out?

- Real OAuth or API-key connection flows for the integrations. The task only requires integrations as AI context, not actual external service connectivity.
- User accounts, teams, billing, and permission models beyond lightweight demo save behavior.
- A full generated-project compiler/export pipeline. The app focuses on showing the AI response and technical plan rather than producing a production ZIP from generated code.
- Heavy observability, retries, rate limits, and prompt evaluation infrastructure. These are production needs, but too large for the intended two-hour task scope.
- Exhaustive automated test coverage. I prioritized the working vertical slice and kept the implementation small.

## What is the biggest production risk?

The biggest risk is the AI generation boundary: prompt injection, inconsistent model output, latency, token cost, and provider failure can all directly affect the user experience. Before production, I would add stricter response schemas, request tracing, rate limits, timeout and retry policies, cost guards, abuse detection, and tests that prove selected integrations reliably change the generated output.
