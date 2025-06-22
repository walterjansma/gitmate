import { promptForInput } from "./inquirer.js";

export async function getInitialInput() {
    // Check if input was provided via command line
    let input = process.argv.slice(2).join(" ");
    
    if (!input) {
        return await promptForInput();
    } else {
        return input;
    }
}