/* global process */

import fs from "fs";
import https from "https";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const url = "https://github.com/tndrle/node-sqlite3-wasm/raw/refs/heads/main/dist/node-sqlite3-wasm.wasm";
const destDir = path.resolve(__dirname, "../dist-electron");
const dest = path.join(destDir, "node-sqlite3-wasm.wasm");

// Ensure dist-electron directory exists
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

function download(url, dest, redirectCount = 0) {
  if (redirectCount > 5) {
    console.error("Too many redirects");
    process.exit(1);
  }
  https.get(url, (res) => {
    if (res.statusCode === 302 || res.statusCode === 301) {
      // Follow redirect
      download(res.headers.location, dest, redirectCount + 1);
      return;
    }
    if (res.statusCode !== 200) {
      console.error("Failed to download WASM:", res.statusCode);
      process.exit(1);
    }
    const file = fs.createWriteStream(dest);
    res.pipe(file);
    file.on("finish", () => {
      file.close();
      console.log("Downloaded:", dest);
    });
  });
}

if (fs.existsSync(dest)) {
  console.log("WASM file already exists:", dest);
  process.exit(0);
}

console.log("Downloading node-sqlite3-wasm.wasm...");
download(url, dest);