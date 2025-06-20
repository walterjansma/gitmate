import inquirer from "inquirer";

export async function promptForInput() : Promise<string> {

    const { userInput } = await inquirer.prompt([
        {
            type: "input",
            name: "userInput",
            message: "What git command would you like help with?",
            validate: (value : string) => {
            if (value.trim().length === 0) {
                return "Please enter a git-related command or question.";
            }
            return true;
            },
        },
    ]);
    return userInput;
}

export async function promptForCommandOptions() : Promise<string> {
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
  return action;
}

