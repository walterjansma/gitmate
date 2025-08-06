import { promptForInput } from "./inquirer.js";
import { program } from "commander";

export async function getInitialInput() {
    // Set up CLI arguments
    program
        .option('-a, --agent', 'enable agent mode')
        .allowUnknownOption()
        .argument('[input...]', 'git command in natural language')
        .parse();

    const options = program.opts();
    
    // Get the input arguments
    const inputArgs = program.args;
    let input = inputArgs.join(" ");
    
    if (!input) {
        input = await promptForInput();
    }

    return {
        input,
        isAgent: options.agent || false
    };
}