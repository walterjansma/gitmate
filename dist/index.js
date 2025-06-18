#!/usr/bin/env node
"use strict";
const input = process.argv.slice(2).join(" ");
if (!input) {
    console.log("Please enter a git-related command sentence.");
    process.exit(1);
}
console.log(`You said: "${input}"`);
