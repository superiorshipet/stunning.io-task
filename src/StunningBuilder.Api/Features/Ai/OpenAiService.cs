using System.Runtime.CompilerServices;
using System.Text;
using System.Text.Json;
using OpenAI;
using OpenAI.Chat;

namespace StunningBuilder.Api.Features.Ai;

public sealed class OpenAiService(HttpClient httpClient, IConfiguration configuration, ILogger<OpenAiService> logger)
{
    private readonly string? _openAiApiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY") 
                                             ?? configuration["OpenAI:ApiKey"];
    private readonly string? _groqApiKey = Environment.GetEnvironmentVariable("GROQ_API_KEY")
                                           ?? configuration["Groq:ApiKey"];
    private readonly string _defaultModel = configuration["OpenAI:DefaultModel"] ?? "gpt-4o";
    private readonly string _groqDefaultModel = configuration["Groq:DefaultModel"] ?? "openai/gpt-oss-120b";

    public bool IsConfigured => !string.IsNullOrWhiteSpace(_openAiApiKey) || !string.IsNullOrWhiteSpace(_groqApiKey);

    public async Task<(string Content, int? PromptTokens, int? CompletionTokens)> GenerateAsync(
        string prompt,
        string systemPrompt,
        string? model = null,
        CancellationToken cancellationToken = default)
    {
        if (!string.IsNullOrWhiteSpace(_groqApiKey))
        {
            return await GenerateGroqAsync(prompt, systemPrompt, ResolveGroqModel(model), cancellationToken);
        }

        var targetModel = string.IsNullOrWhiteSpace(model) ? _defaultModel : model;

        if (string.IsNullOrWhiteSpace(_openAiApiKey))
        {
            throw new InvalidOperationException("AI provider key is not configured. Set GROQ_API_KEY or OPENAI_API_KEY.");
        }

        try
        {
            var client = new OpenAIClient(_openAiApiKey).GetChatClient(targetModel);
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
        if (!string.IsNullOrWhiteSpace(_groqApiKey))
        {
            await foreach (var token in StreamGroqAsync(prompt, systemPrompt, ResolveGroqModel(model), cancellationToken))
            {
                yield return token;
            }

            yield break;
        }

        var targetModel = string.IsNullOrWhiteSpace(model) ? _defaultModel : model;

        if (string.IsNullOrWhiteSpace(_openAiApiKey))
        {
            throw new InvalidOperationException("AI provider key is not configured. Set GROQ_API_KEY or OPENAI_API_KEY.");
        }

        var client = new OpenAIClient(_openAiApiKey).GetChatClient(targetModel);
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

    private string ResolveGroqModel(string? requestedModel)
    {
        if (string.IsNullOrWhiteSpace(requestedModel) || requestedModel.StartsWith("gpt-", StringComparison.OrdinalIgnoreCase))
        {
            return _groqDefaultModel;
        }

        return requestedModel;
    }

    private async Task<(string Content, int? PromptTokens, int? CompletionTokens)> GenerateGroqAsync(
        string prompt,
        string systemPrompt,
        string model,
        CancellationToken cancellationToken)
    {
        using var request = CreateGroqRequest(stream: false, prompt, systemPrompt, model);
        using var response = await httpClient.SendAsync(request, cancellationToken);
        var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            logger.LogError("Groq generation failed with status {StatusCode}: {Response}", response.StatusCode, responseBody);
            throw new InvalidOperationException($"Groq generation failed: {(int)response.StatusCode} {response.ReasonPhrase}");
        }

        using var document = JsonDocument.Parse(responseBody);
        var root = document.RootElement;
        var content = root
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString() ?? string.Empty;

        int? promptTokens = null;
        int? completionTokens = null;
        if (root.TryGetProperty("usage", out var usage))
        {
            promptTokens = TryGetInt(usage, "prompt_tokens");
            completionTokens = TryGetInt(usage, "completion_tokens");
        }

        return (content, promptTokens, completionTokens);
    }

    private async IAsyncEnumerable<string> StreamGroqAsync(
        string prompt,
        string systemPrompt,
        string model,
        [EnumeratorCancellation] CancellationToken cancellationToken)
    {
        using var request = CreateGroqRequest(stream: true, prompt, systemPrompt, model);
        using var response = await httpClient.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);
            logger.LogError("Groq streaming failed with status {StatusCode}: {Response}", response.StatusCode, responseBody);
            throw new InvalidOperationException($"Groq streaming failed: {(int)response.StatusCode} {response.ReasonPhrase}");
        }

        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        using var reader = new StreamReader(stream);

        while (!cancellationToken.IsCancellationRequested)
        {
            var line = await reader.ReadLineAsync(cancellationToken);
            if (line is null)
            {
                yield break;
            }

            if (string.IsNullOrWhiteSpace(line) || !line.StartsWith("data:", StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }

            var payload = line["data:".Length..].Trim();
            if (payload == "[DONE]")
            {
                yield break;
            }

            string? token = null;
            try
            {
                using var document = JsonDocument.Parse(payload);
                var choice = document.RootElement.GetProperty("choices")[0];
                if (choice.TryGetProperty("delta", out var delta) &&
                    delta.TryGetProperty("content", out var contentElement))
                {
                    token = contentElement.GetString();
                }
            }
            catch (JsonException ex)
            {
                logger.LogWarning(ex, "Could not parse Groq stream payload.");
            }

            if (!string.IsNullOrEmpty(token))
            {
                yield return token;
            }
        }
    }

    private HttpRequestMessage CreateGroqRequest(bool stream, string prompt, string systemPrompt, string model)
    {
        var body = new
        {
            model,
            stream,
            messages = new[]
            {
                new { role = "system", content = systemPrompt },
                new { role = "user", content = prompt }
            }
        };

        var request = new HttpRequestMessage(HttpMethod.Post, "https://api.groq.com/openai/v1/chat/completions");
        request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _groqApiKey);
        request.Content = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json");
        return request;
    }

    private static int? TryGetInt(JsonElement element, string propertyName)
    {
        return element.TryGetProperty(propertyName, out var property) && property.TryGetInt32(out var value)
            ? value
            : null;
    }
}
