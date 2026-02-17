// @ts-check
// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair -- This file intentionally uses JSDoc types that trigger TSDoc warnings in this repo; disable the rule for the whole file.
/* eslint-disable @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types -- This is runtime code used by a TypeDoc plugin; we use JSDoc for typing without introducing TSDoc parsing issues. */

const SCHEME_RE = /^[a-zA-Z][a-zA-Z+.-]*:/u;

/**
 * @typedef {{ marker: "`" | "~"; length: number }} FenceState
 */

/**
 * Returns whether the character at `index` is escaped by an odd number of
 * preceding backslashes.
 *
 * @param {string} input
 * @param {number} index
 */
function isEscaped(input, index) {
    let backslashCount = 0;
    let i = index - 1;

    while (i >= 0 && input.charAt(i) === "\\") {
        backslashCount += 1;
        i -= 1;
    }

    return backslashCount % 2 === 1;
}

/**
 * Finds the opening `[` which matches the `]` at `closeBracketIndex`.
 *
 * Handles nested brackets and backslash escapes.
 *
 * @param {string} line
 * @param {number} closeBracketIndex
 */
function findInlineLinkLabelOpenBracket(line, closeBracketIndex) {
    let depth = 0;

    for (let i = closeBracketIndex - 1; i >= 0; i -= 1) {
        const ch = line.charAt(i);

        const isBracket = ch === "[" || ch === "]";
        const escapedBracket = isBracket && isEscaped(line, i);
        if (!escapedBracket) {
            if (ch === "]") {
                depth += 1;
            } else if (ch === "[") {
                if (depth === 0) {
                    return i;
                }

                depth -= 1;
            }
        }
    }

    return -1;
}

/**
 * Prefixes bare relative Markdown file link destinations with `./` so
 * Docusaurus treats them as file paths.
 *
 * @param {string} url - The inline link destination (may contain whitespace).
 */
function prefixIfBareRelativeMarkdownFile(url) {
    const trimmedStart = url.trimStart();
    const leadingWs = url.slice(0, url.length - trimmedStart.length);

    const trimmedEnd = url.trimEnd();
    const trailingWs = url.slice(trimmedEnd.length);

    const trimmed = url.slice(leadingWs.length, url.length - trailingWs.length);

    // Ignore fragments, absolute paths, already-relative paths, protocol-relative URLs.
    if (
        trimmed.startsWith("#") ||
        trimmed.startsWith("/") ||
        trimmed.startsWith("./") ||
        trimmed.startsWith("../") ||
        trimmed.startsWith("//")
    ) {
        return url;
    }

    // Ignore any explicit scheme (http:, https:, mailto:, vscode:, etc.).
    if (SCHEME_RE.test(trimmed)) {
        return url;
    }

    const hashIndex = trimmed.indexOf("#");
    const beforeHash = hashIndex === -1 ? trimmed : trimmed.slice(0, hashIndex);

    const queryIndex = beforeHash.indexOf("?");
    const pathname =
        queryIndex === -1 ? beforeHash : beforeHash.slice(0, queryIndex);

    // Only touch markdown-file links.
    if (!(pathname.endsWith(".md") || pathname.endsWith(".mdx"))) {
        return url;
    }

    return `${leadingWs}./${trimmed}${trailingWs}`;
}

/**
 * Returns a matching closing `)` for a Markdown inline link target starting at
 * `startIndex` (immediately after the opening `](`).
 *
 * Handles balanced parentheses and backslash escapes.
 *
 * @param {string} input
 * @param {number} startIndex
 *
 * @returns {number} Index of the closing `)`, or -1 if not found
 */
function findInlineLinkClosingParen(input, startIndex) {
    let depth = 0;
    let i = startIndex;

    while (i < input.length) {
        const ch = input.charAt(i);

        switch (ch) {
            case "(": {
                depth += 1;
                i += 1;

                break;
            }
            case ")": {
                if (depth === 0) {
                    return i;
                }

                depth -= 1;
                i += 1;

                break;
            }
            case "\\": {
                // Skip escaped character (including escaped parens).
                i += 2;

                break;
            }
            default: {
                i += 1;
            }
        }
    }

    return -1;
}

/**
 * Splits a Markdown inline link payload into destination + remainder.
 *
 * The payload is the text inside `(...)` for an inline link.
 *
 * - Destination may be `<...>` or a raw destination.
 * - Remainder (if any) includes the title and its leading whitespace.
 *
 * @param {string} payload
 *
 * @returns {{ destination: string; remainder: string }}
 */
function splitInlineLinkDestination(payload) {
    const core = payload.trim();
    if (core.length === 0) {
        return { destination: "", remainder: "" };
    }

    // Destination in angle brackets: <...>
    if (core.startsWith("<")) {
        let i = 1;
        while (i < core.length) {
            const ch = core.charAt(i);

            if (ch === "\\") {
                i += 2;
            } else if (ch === ">") {
                return {
                    destination: core.slice(0, i + 1),
                    remainder: core.slice(i + 1),
                };
            } else {
                i += 1;
            }
        }

        // Unclosed `<...`; treat whole thing as destination.
        return { destination: core, remainder: "" };
    }

    // Raw destination: ends at first whitespace at depth 0.
    let depth = 0;
    let i = 0;
    while (i < core.length) {
        const ch = core.charAt(i);

        switch (ch) {
            case "(": {
                depth += 1;
                i += 1;

                break;
            }
            case ")": {
                if (depth > 0) {
                    depth -= 1;
                }
                i += 1;

                break;
            }
            case "\\": {
                i += 2;

                break;
            }
            default: {
                if (depth === 0 && /\s/u.test(ch)) {
                    return {
                        destination: core.slice(0, i),
                        remainder: core.slice(i),
                    };
                }
                i += 1;
            }
        }
    }

    return { destination: core, remainder: "" };
}

/**
 * Applies the `./` prefix rule to an inline-link payload.
 *
 * Preserves any optional title portion unchanged.
 *
 * @param {string} payload
 */
function prefixInlineLinkPayload(payload) {
    const trimmedStart = payload.trimStart();
    const leadingWs = payload.slice(0, payload.length - trimmedStart.length);

    const trimmedEnd = payload.trimEnd();
    const trailingWs = payload.slice(trimmedEnd.length);

    const core = payload.trim();
    const { destination, remainder } = splitInlineLinkDestination(core);
    if (destination.length === 0) {
        return payload;
    }

    const isAngleWrapped =
        destination.startsWith("<") &&
        destination.endsWith(">") &&
        destination.length >= 2;
    const inner = isAngleWrapped ? destination.slice(1, -1) : destination;

    const rewrittenInner = prefixIfBareRelativeMarkdownFile(inner);
    if (rewrittenInner === inner) {
        return payload;
    }

    const rewrittenDestination = isAngleWrapped
        ? `<${rewrittenInner}>`
        : rewrittenInner;

    return `${leadingWs}${rewrittenDestination}${remainder}${trailingWs}`;
}

/**
 * Prefixes bare Markdown-file link targets on a single line, avoiding
 * modifications inside inline code spans.
 *
 * @param {string} line
 */
function prefixInlineMarkdownLinksInLine(line) {
    let out = "";
    let i = 0;

    /** @type {null | number} */
    let codeSpanLength = null;

    /**
     * Counts how many times `char` repeats starting at `startIndex`.
     *
     * @param {number} startIndex
     * @param {string} char
     */
    const countRun = (startIndex, char) => {
        let count = 0;
        while (
            startIndex + count < line.length &&
            line.charAt(startIndex + count) === char
        ) {
            count += 1;
        }
        return count;
    };

    while (i < line.length) {
        // Inline code spans (backticks). Track the opening run length and only close on the same length.
        const tickRun = line.charAt(i) === "`" ? countRun(i, "`") : 0;
        if (tickRun > 0) {
            if (codeSpanLength === null) {
                codeSpanLength = tickRun;
            } else if (tickRun === codeSpanLength) {
                codeSpanLength = null;
            }

            out += line.slice(i, i + tickRun);
            i += tickRun;
        } else if (
            codeSpanLength === null &&
            line.charAt(i) === "]" &&
            line.charAt(i + 1) === "("
        ) {
            // Ensure this is actually a `[label](` sequence, not random text containing `](`.
            const labelOpen = findInlineLinkLabelOpenBracket(line, i);

            if (labelOpen === -1) {
                out += line.charAt(i);
                i += 1;
            } else {
                const urlStart = i + 2;
                const end = findInlineLinkClosingParen(line, urlStart);

                if (end === -1) {
                    out += line.charAt(i);
                    i += 1;
                } else {
                    const payload = line.slice(urlStart, end);
                    const rewrittenPayload = prefixInlineLinkPayload(payload);

                    out += `](${rewrittenPayload})`;
                    i = end + 1;
                }
            }
        } else {
            out += line.charAt(i);
            i += 1;
        }
    }

    return out;
}

/**
 * Prefixes bare intra-doc Markdown file links with `./`.
 *
 * @remarks
 * This function is designed to operate on TypeDoc's markdown renderer output,
 * where links are mostly simple inline links. It intentionally avoids parsing
 * inside fenced code blocks and inline code spans.
 *
 * @param {string} input
 *
 * @returns {string}
 */
export function prefixBareMarkdownFileLinksInMarkdown(input) {
    const newline = input.includes("\r\n") ? "\r\n" : "\n";
    const lines = input.split(/\r?\n/u);

    /** @type {null | FenceState} */
    let fenceState = null;

    const outLines = lines.map((line) => {
        // Only treat runs of a single marker character as fences.
        const fenceMatch = /^\s*(?<marker>[`~])\k<marker>{2,}/u.exec(line);
        if (fenceMatch) {
            const [matchText] = fenceMatch;
            const run = matchText.trimStart();
            const { groups } = fenceMatch;
            const typedGroups =
                /** @type {undefined | { marker: string | undefined }} */ (
                    groups
                );
            const markerChar = typedGroups?.marker ?? run.charAt(0);
            /** @type {"`" | "~"} */
            let marker = "~";
            if (markerChar === "`") {
                marker = "`";
            }
            const { length } = run;

            if (fenceState === null) {
                fenceState = { length, marker };
            } else if (
                marker === fenceState.marker &&
                length >= fenceState.length
            ) {
                fenceState = null;
            }

            return line;
        }

        if (fenceState !== null) {
            return line;
        }

        return prefixInlineMarkdownLinksInLine(line);
    });

    return outLines.join(newline);
}
