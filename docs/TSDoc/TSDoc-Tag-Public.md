---
title: "@public"
---

<!-- prettier-ignore-start -->
|    |    |
| -- | -- |
| Standardization: | [Discretionary](https://tsdoc.org/pages/spec/standardization_groups/) |
| Syntax kind: | [Modifier](https://tsdoc.org/pages/spec/tag_kinds/) |
<!-- prettier-ignore-end -->

## Suggested meaning

Designates that an API item's release stage is "public". It has been officially released to third-party developers,
and its signature is guaranteed to be stable (e.g. following Semantic Versioning rules).

## Example

```ts
/**
 * Represents a book in the catalog.
 *
 * @public
 */
export class Book {
 /**
  * The title of the book.
  *
  * @internal
  */
 public get _title(): string;

 /**
  * The author of the book.
  */
 public get author(): string;
}
```

In this example, `Book.author` inherits its `@public` designation from the containing class,
whereas `Book._title` is marked as "internal".

## See also

- [@alpha](https://tsdoc.org/pages/tags/alpha/) tag
- [@beta](https://tsdoc.org/pages/tags/beta/) tag
- [@experimental](https://tsdoc.org/pages/tags/experimental/) tag
- [@internal](https://tsdoc.org/pages/tags/internal/) tag
- [Trimming based on release tags](https://api-extractor.com/pages/setup/configure_rollup/#trimming-based-on-release-tags):
  a reference implementation of this feature
