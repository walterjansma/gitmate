#!/usr/bin/env node

import { callOpenAI } from "./apiCallHelper.js";
import inquirer from "inquirer";
import { spawn } from "child_process";

// Processing animation function
function showProcessingAnimation(): NodeJS.Timeout {
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  let i = 0;

  return setInterval(() => {
    process.stdout.write(`\r${frames[i]} Processing your git command...`);
    i = (i + 1) % frames.length;
  }, 80);
}

// Function to handle command options
async function handleCommandOptions(command: string) {
  // Clear the processing animation
  process.stdout.write("\r" + " ".repeat(50) + "\r");

  console.log(`\n🤖 ${command}\n`);

  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What would you like to do?",
      choices: [
        { name: "🚀 Run command", value: "run" },
        { name: "❌ Cancel", value: "cancel" },
      ],
    },
  ]);

  switch (action) {
    case "run":
      await executeCommand(command);
      break;
    case "cancel":
      console.log("\n👋 Cancelled. Ready for next command.");
      break;
  }
}

// Function to execute the command
async function executeCommand(command: string) {
  console.log("\n🚀 Executing command...\n");

  const [cmd, ...args] = command.split(" ");
  const child = spawn(cmd, args, {
    stdio: "inherit",
    shell: true,
  });

  child.on("close", (code) => {
    if (code === 0) {
      console.log(`\n✅ Command completed successfully`);
    } else {
      console.log(`\n❌ Command failed with exit code ${code}`);
      console.log(
        "💡 You may need to modify the command or check your git repository state."
      );
    }
  });
}

async function main() {
  // Check if input was provided via command line
  let input = process.argv.slice(2).join(" ");

  // If no command line input, prompt user
  if (!input) {
    const { userInput } = await inquirer.prompt([
      {
        type: "input",
        name: "userInput",
        message: "What git command would you like help with?",
        validate: (value) => {
          if (value.trim().length === 0) {
            return "Please enter a git-related command or question.";
          }
          return true;
        },
      },
    ]);
    input = userInput;
  }

  // Show processing animation
  const animation = showProcessingAnimation();

  try {
    const response = await callOpenAI(input);

    if (response && response.choices && response.choices[0]) {
      const command = response.choices[0].message.content.trim();

      // Stop animation
      clearInterval(animation);

      // Check if it's the "I'm sorry" message, works for now haha
      if (command.toLowerCase().includes("i'm sorry")) {
        console.log(`\n${command}`);
        process.exit(0);
      }

      // Handle command options
      await handleCommandOptions(command);
    } else {
      clearInterval(animation);
      console.log("\n❌ No response received from OpenAI");
    }
  } catch (error) {
    clearInterval(animation);
    console.log("\n❌ Error processing your request:", error);
  }
}

main().catch(console.error);
