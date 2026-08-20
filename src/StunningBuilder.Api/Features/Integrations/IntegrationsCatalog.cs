namespace StunningBuilder.Api.Features.Integrations;

/// <summary>
/// In-memory catalog of supported integrations for the Stunning Builder platform.
/// </summary>
public static class IntegrationsCatalog
{
    public static readonly IReadOnlyList<IntegrationResponse> Supported =
    [
        new(
            Id: "stripe",
            Name: "Stripe",
            Description: "Process payments, manage subscriptions, handle checkout sessions, and receive webhook events.",
            Category: "Payments",
            AuthType: "ApiKey",
            IsEnabled: true,
            Capabilities: ["payments", "subscriptions", "invoices", "webhooks", "customers"],
            DocumentationUrl: "https://stripe.com/docs/api"
        ),
        new(
            Id: "shopify",
            Name: "Shopify",
            Description: "Connect e-commerce storefronts to synchronize products, track inventory, and manage customer orders.",
            Category: "E-Commerce",
            AuthType: "OAuth2",
            IsEnabled: true,
            Capabilities: ["products", "orders", "inventory", "customers", "webhooks"],
            DocumentationUrl: "https://shopify.dev/docs/api"
        ),
        new(
            Id: "gmail",
            Name: "Gmail",
            Description: "Send automated transactional emails, manage message threads, and dispatch template-driven notifications.",
            Category: "Email",
            AuthType: "OAuth2",
            IsEnabled: true,
            Capabilities: ["send_email", "read_threads", "drafts", "labels"],
            DocumentationUrl: "https://developers.google.com/gmail/api"
        ),
        new(
            Id: "slack",
            Name: "Slack",
            Description: "Deliver real-time team notifications, workflow alerts, and interactive block messages to channels.",
            Category: "Messaging",
            AuthType: "OAuth2",
            IsEnabled: true,
            Capabilities: ["post_message", "incoming_webhooks", "channels", "interactive_blocks"],
            DocumentationUrl: "https://api.slack.com"
        ),
        new(
            Id: "google-sheets",
            Name: "Google Sheets",
            Description: "Read, append, and synchronize structured tabular data, lead captures, and form submissions in real time.",
            Category: "Productivity",
            AuthType: "OAuth2",
            IsEnabled: true,
            Capabilities: ["read_rows", "append_rows", "batch_update", "create_sheet"],
            DocumentationUrl: "https://developers.google.com/sheets/api"
        )
    ];
}
