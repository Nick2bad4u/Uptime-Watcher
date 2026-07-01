import { createConfig } from "remark-config-nick2bad4u";
import remarkLintFirstHeadingLevel from "remark-lint-first-heading-level";
import remarkLintMatchPunctuation from "remark-lint-match-punctuation";
import remarkLintNoDuplicateHeadings from "remark-lint-no-duplicate-headings";
import remarkLintNoDuplicateHeadingsInSection from "remark-lint-no-duplicate-headings-in-section";
import remarkLintNoEmptySections from "remark-lint-no-empty-sections";
import remarkLintNoFileNameMixedCase from "remark-lint-no-file-name-mixed-case";
import remarkLintNoShellDollars from "remark-lint-no-shell-dollars";
import remarkLintWriteGood from "remark-lint-write-good";

/** @type {import("remark-config-nick2bad4u").RemarkConfig} */
const remarkConfig = createConfig({
    plugins: [
        // These shared-preset prose checks are too noisy for generated TSDoc
        // reference docs, ADRs, and repository instruction files.
        [remarkLintFirstHeadingLevel, false],
        [remarkLintMatchPunctuation, false],
        [remarkLintNoDuplicateHeadings, false],
        [remarkLintNoDuplicateHeadingsInSection, false],
        [remarkLintNoEmptySections, false],
        [remarkLintNoFileNameMixedCase, false],
        [remarkLintNoShellDollars, false],
        [remarkLintWriteGood, false],
    ],
    settings: {},
});

export default remarkConfig;
