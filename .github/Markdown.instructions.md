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
-   **Links**: Use `[link text](URL)` for links. Ensure that the link text is descriptive and the URL is valid.
-   **Images**: Use `![alt text](image URL)` for images. Include a brief description of the image in the alt text.
-   **Tables**: Use `|` to create tables. Ensure that columns are properly aligned and headers are included.
-   **Whitespace**: Use blank lines to separate sections and improve readability. Avoid excessive whitespace.

-   **Front Matter**: Use `---` to delimit the YAML front matter. Include the following fields in the YAML front matter if applicable:
    -   `title`: The title of the file.
    -   `description`: A brief description of the file.
    -   `summary`: A brief summary of the file. Recommend a summary based on the content when possible.
    -   `category`: The category of the file.
    -   `author`: The author of the file.
    -   `keywords`: Relevant keywords for the file.
    -   `misc`: Any other relevant metadata fields.
    -   `ai_note`: Indicate if AI was used in the creation of the file.
    -   `creation_date`: The creation date of the file.
    -   `last_modified_date`: The last modified date of the file.
-   **Metadata**: Ensure that metadata is accurate and up-to-date. Update the `last_modified_date` field when changes are made.
