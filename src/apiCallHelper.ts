import { getOpenAIApiKey } from "./apiKeyHelper.js"

const url = 'https://api.openai.com/v1/chat/completions';

export async function callOpenAI(input: String) {

    const apiKey = await getOpenAIApiKey();

    const body = {
        model: 'gpt-3.5-turbo',
        messages: [
            { role: 'user', content: input }
        ]
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        console.error(`Error: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.error(errorText);
        return;
    }

    const data = await response.json();
    return data;
}
