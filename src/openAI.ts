import { getOpenAIApiKey, isMockApiModeEnabled } from "./util/configHelper.js";
import { formatGitContextForLLM, getGitContext } from "./context.js";
import { mockOpenAIResponse } from "./util/mockOpenAIResponse.js";

const url = "https://api.openai.com/v1/chat/completions";

const systemPrompt = `
You are a helpful assistant that can help with git commands. Your reponse should be directly executable in the terminal, without any additional text. If multiple commands are needed for the task, you should return them so they can be executed all at once divided by &&. If the question is not git-related, you should say "I'm sorry, I can only help with git commands."
`;

export async function callOpenAI(input: String) {
    const apiKey = await getOpenAIApiKey();

    // Get git context
    let gitContext = "";
    try {
        const context = getGitContext();
        gitContext = formatGitContextForLLM(context);
    } catch (error) {
        gitContext = "Not in a git repository";
    }

    const body = {
        model: "gpt-3.5-turbo",
        messages: [
        { role: "system", content: systemPrompt },
        {
            role: "user",
            content: `Git Context:\n${gitContext}\n\nUser Request: ${input}`,
        },
        ],
    };

    if (isMockApiModeEnabled()) {
        console.warn("Warning: Using mock OpenAI reponse data, set `USE_OPENAI_MOCK` to false in `~/.config/gmate/config.json` to make real API calls.")
        return mockOpenAIResponse.data;
    } else {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (response && !response.ok) {
            console.error(`Error: ${response.status} ${response.statusText}`);
            const errorText = await response.text();
            throw new Error(errorText);
        }

        return await response.json();
    }

}
