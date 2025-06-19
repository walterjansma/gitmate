#!/usr/bin/env node

import { callOpenAI } from "./apiCallHelper.js";

const input = process.argv.slice(2).join(" ");

if (!input) {
  console.log("Please enter a git-related command sentence.");
  process.exit(1);
}

console.log(`You said: "${input}"`);
console.log(`Processing...`)

// TODO call OpenAI via curl with the provided apiKey and pass the input variable as the input and return the output to the user.
const response = await callOpenAI(input);

console.log(`OpenAI replies: "${response.choices[0].message.content}"`)