---
title: "@privateRemarks"
---

<!-- prettier-ignore-start -->
|    |    |
| -- | -- |
| Standardization: | [Core](https://tsdoc.org/pages/spec/standardization_groups/) |
| Syntax kind: | [Block tag](https://tsdoc.org/pages/spec/tag_kinds/) |
<!-- prettier-ignore-end -->

## Usage

Starts a section of additional documentation content that is not intended for a public audience.
A tool must omit this entire section from the API reference web site, generated \*.d.ts file,
and any other outputs incorporating the content.

## Example

```ts
/**
 * The summary section should be brief. On a documentation web site, it will be
 * shown on a page that lists summaries for many different API items. On a
 * detail page for a single item, the summary will be shown followed by the
 * remarks section (if any).
 *
 * @remarks
 * The main documentation for an API item is separated into a brief "summary"
 * section optionally followed by an `@remarks` block containing additional
 * details.
 *
 * @privateRemarks
 * The `@privateRemarks` tag starts a block of additional commentary that is not
 * meant for an external audience. A documentation tool must omit this content
 * from an API reference web site. It should also be omitted when generating a
 * normalized *.d.ts file.
 */
```

## See also

- [@remarks](https://tsdoc.org/pages/tags/remarks/) tag
