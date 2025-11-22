---
name: "Markdown-Guidelines"
description: "Documentation and content creation standards"
applyTo: "**/*.md"
---

## Markdown Content Rules

1. **Headings**: Use appropriate heading levels (H2, H3, etc.) to structure your content.
2. **Code Blocks**: Use fenced code blocks for code snippets. Specify the language for syntax highlighting.
3. **Links**: Use proper markdown syntax for links. Ensure that links are valid and accessible.
4. **Images**: Use proper markdown syntax for images. Include alt text for accessibility.
5. **Tables**: Use markdown tables for tabular data. Ensure proper formatting and alignment.
6. **Whitespace**: Use appropriate whitespace to separate sections and improve readability.

## Formatting and Structure

Follow these guidelines for formatting and structuring your markdown content:

-   **Headings**: Use `##` for H2 and `###` for H3. Ensure that headings are used in a hierarchical manner.
-   **Lists**: Use `-` for bullet points and `1.` for numbered lists. Indent nested lists with two spaces.
-   **Code Blocks**: Use triple backticks (```) to create fenced code blocks. Specify the language after the opening backticks for syntax highlighting (e.g., ```csharp).
-   **Links**: Use `[link text](https://example.com)` for links. Ensure that the link text is descriptive and the URL is valid.
-   **Images**: Use `![alt text](https://example.com/picture.png)` for images. Include a brief description of the image in the alt text.
-   **Tables**: Use `|` to create tables. Ensure that columns are properly aligned and headers are included.
-   **Whitespace**: Use blank lines to separate sections and improve readability. Avoid excessive whitespace.

-   **Front Matter**: Use `---` to delimit YAML front matter when a file needs metadata.
    -   In general markdown files (e.g. `README.md` at the repo root), choose fields that are useful to readers and tooling.
    -   For documentation pages under `docs/**`, follow the schema in `config/schemas/doc-frontmatter.schema.json` and keep fields (such as `title`, `summary`, `category`, and `tags`) valid per that schema. Use `scripts/validate-doc-frontmatter.mjs` and the `docs:validate:frontmatter` / `docs:check` scripts to verify correctness.
-   **Metadata**: Ensure that metadata is accurate and up to date. When a document uses front matter, update date or version fields when content meaningfully changes.
-   **Tooling alignment**: The repository enforces Markdown style via Remark (`.remarkrc.mjs`). Run `npm run remark:check` (or `npm run docs:check` for doc bundles) before committing to catch lint issues.
