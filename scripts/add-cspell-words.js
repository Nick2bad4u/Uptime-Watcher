/**
 * Script to automatically append new unknown words found by cspell to custom-words.txt.
 * Usage: Run this script from the project root to update your custom spelling dictionary.
 * Requires: Node.js, cspell installed (npx cspell).
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CUSTOM_WORDS_FILE = path.resolve(__dirname, "../custom-words.txt");

// 1. Read current custom words into a Set
const currentWords = new Set(
  fs.readFileSync(CUSTOM_WORDS_FILE, "utf8")
    .split(/\r?\n/)
    .map(w => w.trim())
    .filter(w => w && !w.startsWith("//"))
);

// 2. Run cspell, excluding custom-words.txt, and get unique unknown words
let cspellOutput = "";
try {
  cspellOutput = execSync(
    `npx cspell "**/*" --words-only --unique --exclude "custom-words.txt" --exclude "node_modules/**" --exclude "dist/**" --exclude "build/**" --exclude ".git/**"`,
    { stdio: ["pipe", "pipe", "ignore"] }
  ).toString();
} catch (err) {
  // cspell returns a non-zero exit code when spelling issues are found,
  // but the output (err.stdout) still contains the list of unknown words we want to process.
  if (err.stdout) {
    cspellOutput = err.stdout.toString();
  } else {
    throw err;
  }
}

const foundWords = new Set(
  cspellOutput
    .split(/\r?\n/)
    .map(w => w.trim())
    .filter(w => w && !currentWords.has(w))
);

// 3. Append only new words to custom-words.txt
if (foundWords.size > 0) {
  // Read current file content and trim trailing newlines
  let fileContent = fs.readFileSync(CUSTOM_WORDS_FILE, "utf8").replace(/\s+$/, "");
  // Prepare new words block
  const newWordsBlock = Array.from(foundWords).join("\n");
  // Write back with a single newline before and after new words
  fs.writeFileSync(
    CUSTOM_WORDS_FILE,
    fileContent + "\n" + newWordsBlock + "\n"
  );
  console.log(`Added ${foundWords.size} new words to custom-words.txt`);
} else {
  console.log("No new words to add.");
}