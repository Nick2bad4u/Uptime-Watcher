/**
 * Universal Doc Downloader & Cleaner Template
 * -------------------------------------------
 * Easily configure all variables at the top!
 *
 * HOW TO CONFIGURE:
 *   1. Set variables in the CONFIGURATION section below.
 *   2. Adjust the `rewriteLinks` and `cleanContent` functions if needed.
 *   3. Run: `node doc_downloader_template.js`
 */

import { exec } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

/* -------------------- CONFIGURATION -------------------- */

// Unique name for this doc sync; used for log/hashes/folder/file names
const DOC_NAME = "Zod";

// Base URL for docs (no trailing slash)
const BASE_URL = "https://zod.dev";

// Array of doc/page names (relative to BASE_URL).
// These should match the paths in your repo, relative to the base URL.
// Examples:
//   - "intro" (file in root, e.g. intro.md)
//   - "README.md" (file in root with extension)
//   - "examples/example.js" (file in subdirectory with extension)
//   - "docs/guide/usage.md" (nested subdirectory)
//   - "API.md" (for GitHub Wiki pages, append .md to the page name)
//
// You can download Github Wiki Pages by appending ".md" to the wiki page URL.
// @example: If your wiki page URL is "https://github.com/TryGhost/node-sqlite3/wiki/API",
// use "API.md" as the page name.
const PAGES = ["basics", "api", "error-customization", "error-formatting", "metadata", "json-schema", "ecosystem"];

const INPUT_FORMAT = "markdown"; // Change to your input format if needed
const OUTPUT_FORMAT = "gfm"; // Change to your desired output format

// Output directory (edit here or use env variable DOCS_OUTPUT_DIR)
const SUBDIR_1 = "docs";
const SUBDIR_2 = "packages";

// Output file extension (Markdown)
// This is the extension all output files will have, regardless of input format
const OUTPUT_EXT = "md";

// Command template for downloading & converting (must produce $OUT_FILE)
// See bottom of file for supported input/output formats
// gfm is GitHub-Flavored Markdown, which is widely compatible
// markdown is Pandoc's own Markdown format

/**
 * SECTION REMOVAL/STRIP OPTIONS:
 * - To remove everything from a marker onwards, add its string to REMOVE_FROM_MARKER (array, any string).
 * - To remove only lines that contain certain markers, add those to REMOVE_LINE_MARKERS (array).
 * - To remove everything ABOVE a marker, add its string to REMOVE_ABOVE_MARKER (array).
 */

const REMOVE_FROM_MARKER = [
    "<div class=\"flex-1\" role=\"none\">"
];

// const REMOVE_LINE_MARKERS = [
//     "::::::: body"
// ];

const REMOVE_ABOVE_MARKER = [
    "<h1 class=\"text-3xl font-semibold\">"
];

/* --------- END CONFIGURATION (edit above only!) -------- */

// add ".toLowerCase()" after DOC_NAME if you want case-insensitive folder names

// OUTPUT_DIR is set from the DOCS_OUTPUT_DIR environment variable if present; otherwise, it defaults to a path constructed from the current working directory and the configured subdirectories and DOC_NAME.
let OUTPUT_DIR;
if (process.env.DOCS_OUTPUT_DIR) {
    OUTPUT_DIR = path.isAbsolute(process.env.DOCS_OUTPUT_DIR)
        ? process.env.DOCS_OUTPUT_DIR
        : path.resolve(process.cwd(), process.env.DOCS_OUTPUT_DIR);
} else {
    OUTPUT_DIR = path.join(process.cwd(), SUBDIR_1, SUBDIR_2, DOC_NAME);
}
OUTPUT_DIR = path.resolve(OUTPUT_DIR);

// Log and hash file paths (auto-uses DOC_NAME)
const LOG_FILE = path.join(OUTPUT_DIR, `${DOC_NAME}-Download-Log.md`);
const HASHES_FILE = path.join(OUTPUT_DIR, `${DOC_NAME}-Hashes.json`);

// Pandoc output file name template (preserve subdirs, always .md extension)
const FILE_NAME_TEMPLATE = (page) => {
    // Remove any extension and add .md
    const parsed = path.parse(page);
    // e.g., "examples/example.js" -> "examples/example.md"
    return path.join(parsed.dir, `${parsed.name}.${OUTPUT_EXT}`);
};

const CMD_TEMPLATE = (url, outFile) =>
    `pandoc --wrap=preserve "${url}" -f ${INPUT_FORMAT} -t ${OUTPUT_FORMAT} -o "${outFile}"`;

/**
 * Rewrites relative Markdown links to absolute URLs for your documentation set.
 * Handles ./, ../, and subdirectory links.
 *
 * Limitations:
 * - Does not rewrite links containing anchors (#), query parameters (?), or non-standard formats.
 * - Only rewrites links that start with ./ or ../ and do not contain # or ?.
 *
 * @param {string} content
 * @returns {string}
 */
function rewriteLinks(content) {
    // Replace links like [text](./page.md), [text](../dir/page.md), [text](./sub/page.md)
    // but skip if they contain anchors or query params
    return content.replace(/\((\.{1,2}\/[^\)\s]+)\)/g, (match, relPath) => {
        if (relPath.includes("#") || relPath.includes("?")) {
            // Skip rewriting links with anchors or query params
            return match;
        }
        try {
            const absUrl = new URL(relPath, BASE_URL + "/").toString();
            return `(${absUrl})`;
        } catch {
            // If URL construction fails, return original
            return match;
        }
    });
}

/**
 * Cleans unwanted sections/lines from Markdown.
 * - Removes everything from the first occurrence of any REMOVE_FROM_MARKER onward.
 * - Removes everything above the first occurrence of any REMOVE_ABOVE_MARKER.
 * - Removes any line that contains any REMOVE_LINE_MARKERS.
 * @param {string} content
 * @returns {string}
 */
function cleanContent(content) {
    let cleaned = content;
    // Section removal logic, only if variables are defined
    switch (true) {
        case typeof REMOVE_FROM_MARKER !== "undefined" && Array.isArray(REMOVE_FROM_MARKER):
            for (const marker of REMOVE_FROM_MARKER) {
                const idx = cleaned.indexOf(marker);
                if (idx !== -1) {
                    // Find the start of the line for the marker
                    const lineStart = cleaned.lastIndexOf("\n", idx) + 1;
                    cleaned = cleaned.slice(0, lineStart);
                }
            }
            break;
    }
    switch (true) {
        case typeof REMOVE_ABOVE_MARKER !== "undefined" && Array.isArray(REMOVE_ABOVE_MARKER):
            for (const marker of REMOVE_ABOVE_MARKER) {
                const idx = cleaned.indexOf(marker);
                if (idx !== -1) {
                    // Find the start of the line for the marker
                    const lineStart = cleaned.lastIndexOf("\n", idx) + 1;
                    cleaned = cleaned.slice(lineStart);
                }
            }
            break;
    }
    switch (true) {
        case typeof REMOVE_LINE_MARKERS !== "undefined" && Array.isArray(REMOVE_LINE_MARKERS):
            cleaned = cleaned
                .split("\n")
                .filter((line) => !REMOVE_LINE_MARKERS.some((marker) => line.includes(marker)))
                .join("\n")
                .trimEnd();
            break;
    }

    return cleaned;
}

// Ensure output dir exists
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// State tracking
const downloadedFiles = [];
let previousHashes = {};
if (fs.existsSync(HASHES_FILE)) {
    try {
        const parsed = JSON.parse(fs.readFileSync(HASHES_FILE, "utf8"));
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            previousHashes = parsed;
        } else {
            console.warn("⚠️ Invalid hashes file structure — starting fresh.");
            previousHashes = {};
        }
    } catch {
        console.warn("⚠️ Failed to parse previous hashes — starting fresh.");
    }
}
const newHashes = {};

// Download and process a single doc page
function downloadFile(cmd, filePath, logMsg, name) {
    return new Promise((resolve, reject) => {
        // Sanitize filePath: must be inside OUTPUT_DIR
        const resolvedPath = path.resolve(filePath);
        if (!resolvedPath.startsWith(OUTPUT_DIR)) {
            return reject(new Error("Unsafe file path detected: " + filePath));
        }

        // Basic validation: cmd must start with "pandoc"
        if (typeof cmd !== "string" || !cmd.trim().startsWith("pandoc")) {
            return reject(new Error("Unsafe or invalid command detected: " + cmd));
        }

        // Ensure parent directory exists before running pandoc
        const dir = path.dirname(resolvedPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        exec(cmd, (err) => {
            if (err) {
                console.error(logMsg.replace("✅", "❌") + ` → ${err.message}`);
                return reject(err);
            }
            if (!fs.existsSync(resolvedPath)) {
                console.error(logMsg.replace("✅", "❌") + " → File not created.");
                return reject(new Error("File not created: " + resolvedPath));
            }
            let content;
            try {
                content = fs.readFileSync(resolvedPath, "utf8");
            } catch (readErr) {
                console.error(logMsg.replace("✅", "❌") + ` → Failed to read file: ${readErr.message}`);
                return reject(readErr);
            }
            if (!content || content.trim().length === 0) {
                console.error(logMsg.replace("✅", "❌") + " → File is empty.");
                return reject(new Error("Downloaded file is empty: " + resolvedPath));
            }
            try {
                let processedContent = rewriteLinks(content);
                processedContent = cleanContent(processedContent);
                fs.writeFileSync(resolvedPath, processedContent);
            } catch (writeErr) {
                console.error(logMsg.replace("✅", "❌") + ` → Failed to write file: ${writeErr.message}`);
                return reject(writeErr);
            }
            console.log(logMsg);
            downloadedFiles.push(name);
            resolve();
        });
    });
}

// Build page download promises
const pagePromises = PAGES.map((page) => {
    const url = `${BASE_URL}/${page}`;
    const fileName = FILE_NAME_TEMPLATE(page);
    const filePath = path.join(OUTPUT_DIR, fileName);
    const cmd = CMD_TEMPLATE(url, filePath);
    return downloadFile(cmd, filePath, `✅ Downloaded: ${page} → ${fileName}`, fileName);
});

/**
 * @function main
 * @async
 * @description
 * Main entry point for downloading and processing documentation files.
 * Executes all page download promises in parallel, writes logs upon completion,
 * and handles errors centrally by logging and re-throwing them after attempting to write the log.
 *
 * @returns {Promise<void>} Resolves when all downloads and processing are complete.
 */
(async function main() {
    try {
        await Promise.all(pagePromises);
        writeLogIfComplete();
    } catch (err) {
        // Centralized error handling: log, then re-throw
        console.error("❌ One or more downloads failed.", err);
        writeLogIfComplete();
        throw err;
    }
})();

/**
 * @function writeLogIfComplete
 * @description
 * Writes a log entry and updates the hashes file if any files were successfully downloaded and changed.
 * Only files that exist and were processed are considered.
 * If no files were changed, no log entry is written.
 */
function writeLogIfComplete() {
    // Only consider files that actually exist and were processed
    const successfulFiles = downloadedFiles.filter((name) => {
        const filePath = path.join(OUTPUT_DIR, name);
        return fs.existsSync(filePath);
    });

    if (successfulFiles.length === 0) {
        console.warn("⚠️ No files were successfully downloaded. No log entry written.");
        return;
    }

    const timestamp = new Date().toISOString();
    let logEntry = `## 🕓 ${DOC_NAME} docs sync @ ${timestamp}\n`;
    let changedCount = 0;

    successfulFiles.forEach((name) => {
        const filePath = path.join(OUTPUT_DIR, name);
        const content = fs.readFileSync(filePath, "utf8");
        const hash = crypto.createHash("sha256").update(content).digest("hex");
        newHashes[name] = hash;

        if (previousHashes[name] !== hash) {
            changedCount++;
            logEntry += `- ✅ ${name}\n  ↳ Hash: \`${hash}\`\n`;
        }
    });

    if (changedCount > 0) {
        logEntry += `\n🔧 ${changedCount} changed file${changedCount > 1 ? "s" : ""}\n---\n`;
        fs.appendFileSync(LOG_FILE, logEntry);
        console.log(`🗒️ Log updated → ${LOG_FILE}`);
        fs.writeFileSync(HASHES_FILE, JSON.stringify(newHashes, null, 2));
    } else {
        console.log("📦 All files unchanged — no log entry written.");
    }
}

// Specify input format. FORMAT can be:

// bibtex (BibTeX bibliography)
// biblatex (BibLaTeX bibliography)
// bits (BITS XML, alias for jats)
// commonmark (CommonMark Markdown)
// commonmark_x (CommonMark Markdown with extensions)
// creole (Creole 1.0)
// csljson (CSL JSON bibliography)
// csv (CSV table)
// tsv (TSV table)
// djot (Djot markup)
// docbook (DocBook)
// docx (Word docx)
// dokuwiki (DokuWiki markup)
// endnotexml (EndNote XML bibliography)
// epub (EPUB)
// fb2 (FictionBook2 e-book)
// gfm (GitHub-Flavored Markdown), or the deprecated and less accurate markdown_github; use markdown_github only if you need extensions not supported in gfm.
// haddock (Haddock markup)
// html (HTML)
// ipynb (Jupyter notebook)
// jats (JATS XML)
// jira (Jira/Confluence wiki markup)
// json (JSON version of native AST)
// latex (LaTeX)
// markdown (Pandoc’s Markdown)
// markdown_mmd (MultiMarkdown)
// markdown_phpextra (PHP Markdown Extra)
// markdown_strict (original unextended Markdown)
// mediawiki (MediaWiki markup)
// man (roff man)
// mdoc (mdoc manual page markup)
// muse (Muse)
// native (native Haskell)
// odt (OpenDocument text document)
// opml (OPML)
// org (Emacs Org mode)
// pod (Perl’s Plain Old Documentation)
// ris (RIS bibliography)
// rtf (Rich Text Format)
// rst (reStructuredText)
// t2t (txt2tags)
// textile (Textile)
// tikiwiki (TikiWiki markup)
// twiki (TWiki markup)
// typst (typst)
// vimwiki (Vimwiki)
// the path of a custom Lua reader, see Custom readers and writers below
// Extensions can be individually enabled or disabled by appending +EXTENSION or -EXTENSION to the format name. See Extensions below, for a list of extensions and their names. See --list-input-formats and --list-extensions, below.

// -t FORMAT, -w FORMAT, --to=FORMAT, --write=FORMAT
// Specify output format. FORMAT can be:

// ansi (text with ANSI escape codes, for terminal viewing)
// asciidoc (modern AsciiDoc as interpreted by AsciiDoctor)
// asciidoc_legacy (AsciiDoc as interpreted by asciidoc-py).
// asciidoctor (deprecated synonym for asciidoc)
// beamer (LaTeX beamer slide show)
// bibtex (BibTeX bibliography)
// biblatex (BibLaTeX bibliography)
// chunkedhtml (zip archive of multiple linked HTML files)
// commonmark (CommonMark Markdown)
// commonmark_x (CommonMark Markdown with extensions)
// context (ConTeXt)
// csljson (CSL JSON bibliography)
// djot (Djot markup)
// docbook or docbook4 (DocBook 4)
// docbook5 (DocBook 5)
// docx (Word docx)
// dokuwiki (DokuWiki markup)
// epub or epub3 (EPUB v3 book)
// epub2 (EPUB v2)
// fb2 (FictionBook2 e-book)
// gfm (GitHub-Flavored Markdown), or the deprecated and less accurate markdown_github; use markdown_github only if you need extensions not supported in gfm.
// haddock (Haddock markup)
// html or html5 (HTML, i.e. HTML5/XHTML polyglot markup)
// html4 (XHTML 1.0 Transitional)
// icml (InDesign ICML)
// ipynb (Jupyter notebook)
// jats_archiving (JATS XML, Archiving and Interchange Tag Set)
// jats_articleauthoring (JATS XML, Article Authoring Tag Set)
// jats_publishing (JATS XML, Journal Publishing Tag Set)
// jats (alias for jats_archiving)
// jira (Jira/Confluence wiki markup)
// json (JSON version of native AST)
// latex (LaTeX)
// man (roff man)
// markdown (Pandoc’s Markdown)
// markdown_mmd (MultiMarkdown)
// markdown_phpextra (PHP Markdown Extra)
// markdown_strict (original unextended Markdown)
// markua (Markua)
// mediawiki (MediaWiki markup)
// ms (roff ms)
// muse (Muse)
// native (native Haskell)
// odt (OpenDocument text document)
// opml (OPML)
// opendocument (OpenDocument XML)
// org (Emacs Org mode)
// pdf (PDF)
// plain (plain text)
// pptx (PowerPoint slide show)
// rst (reStructuredText)
// rtf (Rich Text Format)
// texinfo (GNU Texinfo)
// textile (Textile)
// slideous (Slideous HTML and JavaScript slide show)
// slidy (Slidy HTML and JavaScript slide show)
// dzslides (DZSlides HTML5 + JavaScript slide show)
// revealjs (reveal.js HTML5 + JavaScript slide show)
// s5 (S5 HTML and JavaScript slide show)
// tei (TEI Simple)
// typst (typst)
// xwiki (XWiki markup)
// zimwiki (ZimWiki markup)
// the path of a custom Lua writer, see Custom readers and writers below
