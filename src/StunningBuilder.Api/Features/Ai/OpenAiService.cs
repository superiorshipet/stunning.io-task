using System.Runtime.CompilerServices;
using System.Text.Json;
using OpenAI;
using OpenAI.Chat;

namespace StunningBuilder.Api.Features.Ai;

public sealed class OpenAiService(IConfiguration configuration, ILogger<OpenAiService> logger)
{
    private readonly string? _apiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY") 
                                       ?? configuration["OpenAI:ApiKey"];
    private readonly string _defaultModel = configuration["OpenAI:DefaultModel"] ?? "gpt-4o";

    public bool IsConfigured => !string.IsNullOrWhiteSpace(_apiKey);

    public async Task<(string Content, int? PromptTokens, int? CompletionTokens)> GenerateAsync(
        string prompt,
        string systemPrompt,
        string? model = null,
        CancellationToken cancellationToken = default)
    {
        var targetModel = string.IsNullOrWhiteSpace(model) ? _defaultModel : model;

        if (!IsConfigured)
        {
            logger.LogInformation("OpenAI API key not configured. Generating template scaffold response.");
            var mockContent = GenerateMockScaffoldResponse(prompt);
            return (mockContent, 120, 450);
        }

        try
        {
            var client = new OpenAIClient(_apiKey).GetChatClient(targetModel);
            var messages = new List<ChatMessage>
            {
                new SystemChatMessage(systemPrompt),
                new UserChatMessage(prompt)
            };

            var completion = await client.CompleteChatAsync(messages, cancellationToken: cancellationToken);
            var content = completion.Value.Content.FirstOrDefault()?.Text ?? string.Empty;
            var promptTokens = completion.Value.Usage?.InputTokenCount;
            var completionTokens = completion.Value.Usage?.OutputTokenCount;

            return (content, promptTokens, completionTokens);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to complete chat generation with model {Model}", targetModel);
            throw;
        }
    }

    public async IAsyncEnumerable<string> StreamGenerateAsync(
        string prompt,
        string systemPrompt,
        string? model = null,
        [EnumeratorCancellation] CancellationToken cancellationToken = default)
    {
        var targetModel = string.IsNullOrWhiteSpace(model) ? _defaultModel : model;

        if (!IsConfigured)
        {
            logger.LogInformation("OpenAI API key not configured. Streaming simulated scaffold tokens.");
            var mockContent = GenerateMockScaffoldResponse(prompt);
            var words = mockContent.Split(' ');
            foreach (var word in words)
            {
                if (cancellationToken.IsCancellationRequested) yield break;
                yield return word + " ";
                await Task.Delay(25, cancellationToken);
            }
            yield break;
        }

        var client = new OpenAIClient(_apiKey).GetChatClient(targetModel);
        var messages = new List<ChatMessage>
        {
            new SystemChatMessage(systemPrompt),
            new UserChatMessage(prompt)
        };

        var updates = client.CompleteChatStreamingAsync(messages, cancellationToken: cancellationToken);

        await foreach (var update in updates.WithCancellation(cancellationToken))
        {
            foreach (var part in update.ContentUpdate)
            {
                if (!string.IsNullOrEmpty(part.Text))
                {
                    yield return part.Text;
                }
            }
        }
    }

    private static string GenerateMockScaffoldResponse(string userPrompt)
    {
        var sanitizedPrompt = userPrompt.Replace("\"", "'");
        var structure = new GeneratedAppStructure(
            Name: "Stunning AI Application",
            Description: $"Scaffold generated for: {sanitizedPrompt}",
            Template: "ecommerce",
            Framework: "nextjs",
            SuggestedIntegrations: ["stripe", "slack"],
            Files:
            [
                new GeneratedFile(
                    Path: "src/app/page.tsx",
                    Language: "typescript",
                    Content: "export default function HomePage() { return <main className='p-8 bg-slate-950 text-white'><h1 className='text-3xl font-bold'>Generated App</h1><p className='text-slate-400 mt-2'>Built with Stunning Builder</p></main>; }"
                ),
                new GeneratedFile(
                    Path: "src/components/CheckoutButton.tsx",
                    Language: "typescript",
                    Content: "'use client';\nexport function CheckoutButton() { return <button className='px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-500 font-medium'>Buy Now with Stripe</button>; }"
                )
            ]
        );

        return JsonSerializer.Serialize(structure, new JsonSerializerOptions { WriteIndented = true });
    }
}
