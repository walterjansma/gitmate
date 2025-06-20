#!/usr/bin/env node

import { callOpenAI } from "./openAI.js";
import Animation from "./animation.js";
import { handleCommandOptions, validateCommand } from "./command.js";
import { getInitialInput } from "./input.js";

async function main() {
	const animationClass = new Animation();
	const input = await getInitialInput();
	animationClass.showAnimation();

	try {
		const response = await callOpenAI(input);
		if (!response || !response.choices || !response.choices[0]) {
			throw new Error("\n❌ No response received from OpenAI");
		}
		const command = response.choices[0].message.content.trim();

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
