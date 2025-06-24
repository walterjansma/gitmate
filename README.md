
# GitMate 🤖

> An AI-powered Git assistant that helps you with Git commands using natural language

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

## What is GitMate?

GitMate is a command-line tool that uses AI to help you with Git operations. Instead of remembering complex Git commands, you can simply describe what you want to do in plain English, and GitMate will generate and execute the appropriate Git commands for you.

### Features

- 🤖 **AI-powered Git assistance** - Describe your Git needs in natural language
- 🔍 **Smart context awareness** - Automatically detects your current Git repository state
- ⚡ **Interactive execution** - Review and confirm commands before running them
- 🛡️ **Safe execution** - Commands are validated and you can cancel before execution
- 🎯 **Git-focused** - Specialized for Git operations with intelligent context gathering

## Installation

### Prerequisites

- Node.js 18 or higher
- Git installed on your system
- OpenAI API key (for AI functionality)

### Quick Start

1. **Install globally via npm**
   ```bash
   npm install -g gitmate-cli
   ```

2. **Set up your OpenAI API key**
   The first time you run `gmate`, you'll be prompted to enter your OpenAI API key. It will be saved securely in `~/.config/gmate/config.json`.

That's it! You're ready to use GitMate.

## Usage

Once installed, you can use the `gmate` command (short for GitMate) followed by your request:

### Examples

```bash
# Commit changes
gmate commit all my changes with message "fix user authentication bug"

# Create and switch to new branch
gmate create a new branch called feature/user-dashboard and switch to it

# Push changes
gmate push my changes to the remote repository

# Check what files are modified
gmate show me what files I've changed

# Reset changes
gmate discard all my uncommitted changes
```

## How it Works

1. **Context Gathering**: GitMate automatically detects your current Git repository state, including:
   - Current branch
   - Modified, staged, and untracked files
   - Last commit information
   - Remote repository details

2. **AI Processing**: Your request, combined with the Git context, is sent to OpenAI's API to generate appropriate Git commands

3. **Command Review**: The generated command is displayed for your review

4. **Interactive Execution**: You can choose to run the command, cancel, or modify it

## Configuration

The tool stores configuration in `~/.config/gmate/config.json`:

```json
{
  "OPENAI_API_KEY": "your-openai-api-key-here",
  "USE_OPENAI_MOCK": false
}
```

### Development Mode

For development or testing, you can enable mock responses by setting `USE_OPENAI_MOCK` to `true` in the config file. This will use predefined responses instead of calling the OpenAI API.

## Development

### For Contributors

If you want to contribute to GitMate, you'll need to build from source:

#### Prerequisites

- Node.js 18+
- npm or yarn

#### Setup

1. **Clone and install**
   ```bash
   git clone https://github.com/walterjansma/gitmate.git
   cd gitmate
   npm install
   ```

2. **Build the project**
   ```bash
   npm run build
   ```

3. **Link for development**
   ```bash
   npm link
   ```

#### Available Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm test` - Run tests with Vitest
- `npm run dev` - Start development mode with hot reload

## Contributing

Whether it's a bug fix, new feature, or documentation improvement, we welcome all pull requests. Don't hesitate to reach out if you have any questions.

## To do

- [ ] Return a short explanation next to (each) command
- [x] Add integration tests to test the whole flow
- [ ] Add test execution to CI
- [ ] Agentic command execution (solving merge conflicts?)
- [ ] CI/CD workflow for new package releases
---

Made with ❤️ by @[**walterjansma**](https://github.com/walterjansma) and @[**janvandorth**](https://github.com/janvandorth)