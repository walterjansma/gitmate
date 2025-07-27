#!/usr/bin/env node

import { callOpenAI } from "./openAI.js";
import { handleAgentRequest } from "./agent.js";
import Animation from "./animation.js";
import { handleCommandOptions, validateCommand } from "./command.js";
import { getInitialInput } from "./input.js";

async function main() {
	const animationClass = new Animation();
	const { input, isAgent } = await getInitialInput();
	animationClass.showAnimation();

	try {
		let command: string;

		if (isAgent) {
			// Route to agent handler
			command = await handleAgentRequest(input);
			animationClass.stopAnimation();
			console.log(`\n🤖 ${command}\n`);
			return;
		} else {
			// Normal OpenAI flow
			const response = await callOpenAI(input);
			if (!response || !response.choices || !response.choices[0]) {
				throw new Error("\n❌ No response received from OpenAI");
			}
			command = response.choices[0].message.content.trim();
		}

		animationClass.stopAnimation();

		validateCommand(command);
		await handleCommandOptions(command);
	} catch (error) {
		if (error instanceof Error) {
			throw new Error("\n❌ Error processing your request:", { cause: error.message });
		}
	} finally {
		animationClass.stopAnimation();
	}
}

main().catch(console.error);
