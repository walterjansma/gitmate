export const mockOpenAIResponse = {
    data: {
        id: "chatcmpl-123",
        object: "chat.completion",
        created: 1234567890,
        model: "gpt-4o",
        choices: [
        {
            index: 0,
            message: {
            role: "assistant",
            content: "git pull origin main",
            },
            finish_reason: "stop",
        },
        ],
        usage: {
        prompt_tokens: 10,
        completion_tokens: 10,
        total_tokens: 20,
        },
    },
};