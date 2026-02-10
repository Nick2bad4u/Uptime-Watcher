# @alpha


<!-- prettier-ignore-start -->
|    |    |
| -- | -- |
| Standardization: | [Discretionary](https://tsdoc.org/pages/spec/standardization_groups/) |
| Syntax kind: | [Modifier](https://tsdoc.org/pages/spec/tag_kinds/) |
<!-- prettier-ignore-end -->

## Suggested meaning

Designates that an API item's release stage is "alpha". It is intended to be used by
third-party developers eventually, but has not yet been released. The tooling may trim the declaration from
a public release.

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
  * @alpha
  */
 public get title(): string;

 /**
  * The author of the book.
  */
 public get author(): string;
}
```

In this example, `Book.author` inherits its `@public` designation from the containing class,
whereas `Book.title` is marked as "alpha".

## See also

- [@beta](https://tsdoc.org/pages/tags/beta/) tag
- [@experimental](https://tsdoc.org/pages/tags/experimental/) tag
- [@internal](https://tsdoc.org/pages/tags/internal/) tag
- [@public](https://tsdoc.org/pages/tags/public/) tag
- [Trimming based on release tags](https://api-extractor.com/pages/setup/configure_rollup/#trimming-based-on-release-tags):
  a reference implementation of this feature
