---
title: '@internal'
---

<!-- prettier-ignore-start -->
|    |    |
| -- | -- |
| Standardization: | [Discretionary](https://tsdoc.org/pages/spec/standardization_groups/) |
| Syntax kind: | [Modifier](https://tsdoc.org/pages/spec/tag_kinds/) |
<!-- prettier-ignore-end -->

## Suggested meaning

Designates that an API item is not planned to be used by third-party developers. The tooling may trim the
declaration from a public release. In some implementations, certain designated packages may be allowed to
consume internal API items, e.g. because the packages are components of the same product.

## Example

```ts
/**
 * Represents a book in the catalog.
 * @public
 */
export class Book {
  /**
   * The title of the book.
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
- [@public](https://tsdoc.org/pages/tags/public/) tag
- [Trimming based on release tags](https://api-extractor.com/pages/setup/configure_rollup/#trimming-based-on-release-tags):
  a reference implementation of this feature
