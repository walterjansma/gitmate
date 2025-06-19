import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import os from 'os';

const configDir = path.join(os.homedir(), '.config', 'gai');
const configFile = path.join(configDir, 'config.json');

export async function getOpenAIApiKey() {
  let apiKey;

  if (fs.existsSync(configFile)) {
    const data = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
    apiKey = data.OPENAI_API_KEY;
  }

  if (!apiKey) {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'apiKey',
        message: 'Your OpenAI key is not set yet, please enter your OpenAI API Key below (you can always change it later in ~/.config/gai/config.json):',
        validate: input => input.startsWith('sk-') || 'Must start with sk-',
      },
    ]);

    apiKey = answers.apiKey;

    fs.mkdirSync(configDir, { recursive: true });
    fs.writeFileSync(configFile, JSON.stringify({ OPENAI_API_KEY: apiKey }, null, 2));
    console.log('API key saved successfully.');
  }

  return apiKey;
}