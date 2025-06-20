import { spawn } from "child_process";
import { promptForCommandOptions } from "./inquirer.js";

export async function handleCommandOptions(command: string) {
    // Clear the processing animation
    process.stdout.write("\r" + " ".repeat(50) + "\r");

    console.log(`\n🤖 ${command}\n`);

    const action = await promptForCommandOptions()

    switch (action) {
        case "run":
        await executeCommand(command);
        break;
        case "cancel":
        console.log("\n👋 Cancelled. Ready for next command.");
        break;
    }
}

export async function executeCommand(command: string) {
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

// Check if it's the "I'm sorry" message, if it is, exit process. works for now haha
export function validateCommand(command: string) {
    if (command.toLowerCase().includes("i'm sorry")) {
        console.log(`\n${command}`);
        process.exit(0);
    }
}