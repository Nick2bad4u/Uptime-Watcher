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

// Allow custom words file path via CLI argument or environment variable, fallback to default
// By default, resolve custom-words.txt relative to the project root (two directories up from this script)
const CUSTOM_WORDS_FILE = path.resolve(
  process.argv[2] ||
    process.env.CUSTOM_WORDS_FILE ||
    path.join(__dirname, "..", "..", "custom-words.txt")
);

// 1. Read current custom words into a Set
let currentWordsContent = "";
if (fs.existsSync(CUSTOM_WORDS_FILE)) {
  currentWordsContent = fs.readFileSync(CUSTOM_WORDS_FILE, "utf8");
}
const currentWords = new Set(
  currentWordsContent
    .split(/\r?\n/)
    .map(w => w.trim())
    .filter(w => w && !w.startsWith("//") && !w.startsWith("#"))
);

// 2. Run cspell, excluding custom-words.txt, and get unique unknown words
const CSPELL_COMMAND = [
  "npx",
  "cspell",
  "**/*",
  "--words-only",
  "--unique",
  "--exclude=custom-words.txt",
  "--exclude=node_modules/**",
  "--exclude=dist/**",
  "--exclude=build/**",
  "--exclude=.git/**"
].join(" ");

let cspellOutput;
try {
  cspellOutput = execSync(
    CSPELL_COMMAND,
    { stdio: "pipe" }
  ).toString();
} catch (err) {
  // cspell returns a non-zero exit code when spelling issues are found,
  // but the output (err.stdout) still contains the list of unknown words we want to process.
  if (err.stdout) {
    cspellOutput = err.stdout.toString();
    if (err.stderr) {
      console.error("cspell stderr:", err.stderr.toString());
    }
  } else {
    if (err.stderr) {
      console.error("cspell stderr:", err.stderr.toString());
    }
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
  // Reuse the already-read file content and trim trailing newlines
  let fileContent = currentWordsContent.replace(/\s+$/, "");
  // Prepare new words block
  const newWordsBlock = Array.from(foundWords).join("\n");
  // Write back, ensuring only a single trailing newline in the file
  const updatedContent = [fileContent, newWordsBlock]
    .filter(Boolean)
    .join("\n")
    .trimEnd() + "\n";
  fs.writeFileSync(
    CUSTOM_WORDS_FILE,
    updatedContent
  );
  console.log(`Added ${foundWords.size} new words to ${CUSTOM_WORDS_FILE}`);
} else {
  console.log(`No new words to add.`);
}