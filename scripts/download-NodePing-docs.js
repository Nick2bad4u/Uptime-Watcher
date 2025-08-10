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

const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

/* -------------------- CONFIGURATION -------------------- */

// Unique name for this doc sync; used for log/hashes/folder/file names
const DOC_NAME = "Node-Ping";

// Base URL for docs (no trailing slash)
const BASE_URL =
    "https://raw.githubusercontent.com/danielzzz/node-ping/refs/heads/master";

// Array of doc/page names (relative, e.g. ["intro", "example"])
// These should match the paths in your repo, relative to the base URL
// If you have subdirectories, include them (e.g. "examples/example.js")
const PAGES = [
    "examples/example.js",
    "examples/example2.js",
    "examples/example_win_de_v6.js",
    "README.md",
];

const INPUT_FORMAT = "gfm"; // Change to your input format if needed
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
 */
const REMOVE_FROM_MARKER = ["::::: sponsors_container"];
const REMOVE_LINE_MARKERS = ["::::::: body"];

/* --------- END CONFIGURATION (edit above only!) -------- */

let OUTPUT_DIR =
    process.env.DOCS_OUTPUT_DIR ||
    path.join(process.cwd(), SUBDIR_1, SUBDIR_2, DOC_NAME.toLowerCase());
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
 * Customize as needed for your doc set.
 * @param {string} content
 * @returns {string}
 */
function rewriteLinks(content) {
    return content.replace(
        /\(\.\/([\w-]+)\)/g,
        (_, page) => `(${BASE_URL}/${page})`
    );
}

/**
 * Cleans unwanted sections/lines from Markdown.
 * - Removes everything from the first occurrence of any REMOVE_FROM_MARKER onward.
 * - Removes any line that contains any REMOVE_LINE_MARKERS.
 * @param {string} content
 * @returns {string}
 */
function cleanContent(content) {
    // Remove everything from the first REMOVE_FROM_MARKER onward (if any)
    let cleaned = content;
    for (const marker of REMOVE_FROM_MARKER) {
        const idx = cleaned.indexOf(marker);
        if (idx !== -1) {
            // Find the start of the line for the marker
            const lineStart = cleaned.lastIndexOf("\n", idx) + 1;
            cleaned = cleaned.slice(0, lineStart);
        }
    }
    // Remove lines containing any REMOVE_LINE_MARKERS
    cleaned = cleaned
        .split("\n")
        .filter(
            (line) =>
                !REMOVE_LINE_MARKERS.some((marker) => line.includes(marker))
        )
        .join("\n")
        .trimEnd();

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
    return /** @type {Promise<void>} */ (
        new Promise((resolve, reject) => {
            // Ensure parent directory exists before running pandoc
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

            exec(cmd, (err) => {
                if (err) {
                    console.error(
                        logMsg.replace("✅", "❌") + ` → ${err.message}`
                    );
                    return reject(err);
                }
                if (!fs.existsSync(filePath)) {
                    console.error(
                        logMsg.replace("✅", "❌") + " → File not created."
                    );
                    return reject(new Error("File not created: " + filePath));
                }
                let content;
                try {
                    content = fs.readFileSync(filePath, "utf8");
                } catch (readErr) {
                    console.error(
                        logMsg.replace("✅", "❌") +
                            ` → Failed to read file: ${readErr.message}`
                    );
                    return reject(readErr);
                }
                if (!content || content.trim().length === 0) {
                    console.error(
                        logMsg.replace("✅", "❌") + " → File is empty."
                    );
                    return reject(
                        new Error("Downloaded file is empty: " + filePath)
                    );
                }
                try {
                    let processedContent = rewriteLinks(content);
                    processedContent = cleanContent(processedContent);
                    fs.writeFileSync(filePath, processedContent);
                } catch (writeErr) {
                    console.error(
                        logMsg.replace("✅", "❌") +
                            ` → Failed to write file: ${writeErr.message}`
                    );
                    return reject(writeErr);
                }
                console.log(logMsg);
                downloadedFiles.push(name);
                resolve();
            });
        })
    );
}

// Build page download promises
const pagePromises = PAGES.map((page) => {
    const url = `${BASE_URL}/${page}`;
    const fileName = FILE_NAME_TEMPLATE(page);
    const filePath = path.join(OUTPUT_DIR, fileName);
    const cmd = CMD_TEMPLATE(url, filePath);
    return downloadFile(
        cmd,
        filePath,
        `✅ Downloaded: ${page} → ${fileName}`,
        fileName
    );
});

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

function writeLogIfComplete() {
    const expectedCount = PAGES.length;
    if (downloadedFiles.length !== expectedCount) return;

    const timestamp = new Date().toISOString();
    let logEntry = `## 🕓 ${DOC_NAME} docs sync @ ${timestamp}\n`;
    let changedCount = 0;

    downloadedFiles.forEach((name) => {
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
