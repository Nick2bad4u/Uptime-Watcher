---
title: "@beta"
---

<!-- prettier-ignore-start -->
|    |    |
| -- | -- |
| Standardization: | [Discretionary](https://tsdoc.org/pages/spec/standardization_groups/) |
| Syntax kind: | [Modifier](https://tsdoc.org/pages/spec/tag_kinds/) |
| Synonyms: | [@experimental](https://tsdoc.org/pages/tags/experimental/) |
<!-- prettier-ignore-end -->

## Suggested meaning

Designates that an API item's release stage is "beta". It has been released to third-party developers experimentally
for the purpose of collecting feedback. The API should not be used in production, because its contract may
change without notice. The tooling may trim the declaration from a public release, but may include it in a
developer preview release.

## Example

```ts
/**
 * Represents a book in the catalog.
 * @public
 */
export class Book {
 /**
  * The title of the book.
  * @beta
  */
 public get title(): string;

 /**
  * The author of the book.
  */
 public get author(): string;
}
```

In this example, `Book.author` inherits its `@public` designation from the containing class,
whereas `Book.title` is marked as "beta".

## See also

- [@alpha](https://tsdoc.org/pages/tags/alpha/) tag
- [@experimental](https://tsdoc.org/pages/tags/experimental/) tag
- [@internal](https://tsdoc.org/pages/tags/internal/) tag
- [@public](https://tsdoc.org/pages/tags/public/) tag
- [Trimming based on release tags](https://api-extractor.com/pages/setup/configure_rollup/#trimming-based-on-release-tags):
  a reference implementation of this feature
