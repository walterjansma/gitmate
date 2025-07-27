import { promptForInput } from "./inquirer.js";
import { program } from "commander";

export async function getInitialInput() {
    // Set up CLI arguments
    program
        .option('-a, --agent', 'enable agent mode')
        .allowUnknownOption()
        .parse();

    const options = program.opts();
    
    // Get remaining arguments as the input command
    const remainingArgs = program.args;
    let input = remainingArgs.join(" ");
    
    if (!input) {
        return await promptForInput();
    } else {
        return input;
    }
}