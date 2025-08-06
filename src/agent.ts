import { spawn } from "child_process";
import { getOpenAIApiKey, isMockApiModeEnabled } from "./util/configHelper.js";
import { formatGitContextForLLM, getGitContext } from "./context.js";
import { mockOpenAIResponse } from "./util/mockOpenAIResponse.js";
import { promptForCommandOptions } from "./inquirer.js";
import { validateCommand } from "./command.js";
import Animation from "./animation.js";

const url = "https://api.openai.com/v1/chat/completions";

const agentSystemPrompt = `
You are a helpful git assistant that can help with git commands through an iterative process. 

You will be given:
1. The user's original request
2. Git repository context
3. Previous commands and their outputs (if any)

Your response should be a JSON object with this exact format:
{
  "command": "git status",
  "reasoning": "I need to check the current status to understand what needs to be done",
  "isDone": false
}

Rules:
- "command": A single git command that can be executed directly (no &&, no multi-line commands)
- "reasoning": Brief explanation of why this command is needed
- "isDone": true only when you have enough information to fully complete the user's request
- If the request is not git-related, set command to "" and isDone to true with reasoning explaining why
- If needed, start with information gathering commands like "git status", "git log --oneline -5", "git branch" etc.
- Be systematic and thorough. gather all needed information before making changes
- When isDone is true, provide a final summary in the reasoning field

Always respond with valid JSON only, no additional text.
`;

interface AgentResponse {
    command: string;
    reasoning: string;
    isDone: boolean;
}

interface CommandResult {
    command: string;
    output: string;
    exitCode: number;
}

async function callOpenAIForAgent(userRequest: string, commandHistory: CommandResult[]): Promise<AgentResponse> {
    const apiKey = await getOpenAIApiKey();

    // Get git context
    let gitContext = "";
    try {
        const context = getGitContext();
        gitContext = formatGitContextForLLM(context);
    } catch (error) {
        gitContext = "Not in a git repository";
    }

    // Format command history
    let historyContext = "";
    if (commandHistory.length > 0) {
        historyContext = "\n\nPrevious commands and outputs:\n" + 
            commandHistory.map(result => 
                `Command: ${result.command}\nExit Code: ${result.exitCode}\nOutput:\n${result.output}\n---`
            ).join("\n");
    }

    const body = {
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: agentSystemPrompt },
            {
                role: "user",
                content: `User Request: ${userRequest}\n\nGit Context:\n${gitContext}${historyContext}`,
            },
        ],
    };

    if (isMockApiModeEnabled()) {
        console.warn("Warning: Using mock OpenAI response data for agent mode");
        // Return a mock agent response for testing
        return {
            command: "git status",
            reasoning: "Mock response - checking repository status",
            isDone: false
        };
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

        const result = await response.json();
        const content = result.choices[0].message.content.trim();
        
        try {
            return JSON.parse(content);
        } catch (error) {
            throw new Error(`Failed to parse agent response as JSON: ${content}`);
        }
    }
}

async function executeCommandAndCapture(command: string): Promise<CommandResult> {
    return new Promise((resolve) => {
        console.log("\n🚀 Executing command...\n");

        const [cmd, ...args] = command.split(" ");
        let output = "";
        let errorOutput = "";

        const child = spawn(cmd, args, {
            shell: true,
        });

        child.stdout?.on("data", (data) => {
            const text = data.toString();
            output += text;
            process.stdout.write(text);
        });

        child.stderr?.on("data", (data) => {
            const text = data.toString();
            errorOutput += text;
            process.stderr.write(text);
        });

        child.on("close", (code) => {
            const exitCode = code || 0;
            const fullOutput = output + (errorOutput ? `\nSTDERR:\n${errorOutput}` : "");
            
            if (exitCode === 0) {
                console.log(`\n✅ Command completed successfully`);
            } else {
                console.log(`\n❌ Command failed with exit code ${exitCode}`);
            }

            resolve({
                command,
                output: fullOutput.trim(),
                exitCode
            });
        });
    });
}

async function handleAgentCommandOptions(command: string, reasoning: string): Promise<boolean> {
    // Clear any processing animation output
    process.stdout.write("\r" + " ".repeat(50) + "\r");

    console.log(`\n🤖 ${command}`);
    console.log(`💭 Reasoning: ${reasoning}\n`);

    const action = await promptForCommandOptions();

    switch (action) {
        case "run":
            return true;
        case "cancel":
            console.log("\n👋 Agent cancelled. Stopping execution.");
            return false;
        default:
            return false;
    }
}

export async function handleAgentRequest(input: string, animation?: Animation): Promise<string> {
    const commandHistory: CommandResult[] = [];
    let iteration = 0;
    const maxIterations = 10; // Safety limit

    console.log("\n🔄 Starting agent mode...\n");
    console.log(`📝 User Request: ${input}\n`);

    try {
        while (iteration < maxIterations) {
            iteration++;
            console.log(`\n--- Agent Iteration ${iteration} ---`);

            // Get next command from agent
            const agentResponse = await callOpenAIForAgent(input, commandHistory);

            // Stop animation before any user interaction
            if (animation) {
                animation.stopAnimation();
            }

            // Check if agent is done
            if (agentResponse.isDone) {
                console.log("\n✅ Agent is ready to complete the task!");
                console.log(`📄 Final Summary: ${agentResponse.reasoning}`);
                
                // If there's a final command to execute, run it
                if (agentResponse.command && agentResponse.command.trim() !== "") {
                    validateCommand(agentResponse.command);
                    
                    // Ask user for confirmation on the final command
                    const shouldExecute = await handleAgentCommandOptions(agentResponse.command, "Final command to complete the task");
                    
                    if (shouldExecute) {
                        // Execute the final command
                        const result = await executeCommandAndCapture(agentResponse.command);
                        commandHistory.push(result);
                        
                        if (result.exitCode === 0) {
                            console.log("\n🎉 Task completed successfully!");
                        } else {
                            console.log("\n⚠️  Final command failed, but task logic is complete");
                        }
                    } else {
                        console.log("\n⚠️  Final command cancelled by user");
                    }
                } else {
                    console.log("\n✅ Task completed - no final command needed");
                }
                
                return "Agent execution completed successfully";
            }

            // Validate the command
            if (!agentResponse.command || agentResponse.command.trim() === "") {
                console.log("\n❌ Agent provided empty command");
                return "Agent execution failed: No command provided";
            }

            validateCommand(agentResponse.command);

            // Ask user for confirmation
            const shouldExecute = await handleAgentCommandOptions(agentResponse.command, agentResponse.reasoning);
            
            if (!shouldExecute) {
                return "Agent execution cancelled by user";
            }

            // Execute the command and capture output
            const result = await executeCommandAndCapture(agentResponse.command);
            commandHistory.push(result);

            // If command failed and agent should be informed
            if (result.exitCode !== 0) {
                console.log("\n⚠️  Command failed, agent will receive this information for next iteration");
            }
        }

        console.log(`\n⚠️  Agent reached maximum iterations (${maxIterations}). Stopping execution.`);
        return "Agent execution stopped: Maximum iterations reached";

    } catch (error) {
        console.error("\n❌ Agent execution failed:", error);
        return `Agent execution failed: ${error instanceof Error ? error.message : String(error)}`;
    }
} 