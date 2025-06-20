# git-ai

## How to run git-ai?
1. Make `index.ts` executable with `chmod +x src/index.ts`
2. Run `npx tsc`
3. Run `npm link`
4. Type any prompt you want after the `gai` (short for git-ai) command, for example: `gai please fix my git issues`.

## How to develop?
- For development, the `mockOpenAIResponse.ts` can be used. Set `USE_OPENAI_MOCK` to true in `~/.config/gai/config.json` to use mock data.

## To do
- Add integration tests to test the whole flow
- Add test execution to CI