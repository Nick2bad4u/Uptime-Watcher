# @experimental


<!-- prettier-ignore-start -->
|    |    |
| -- | -- |
| Standardization: | [Discretionary](https://tsdoc.org/pages/spec/standardization_groups/) |
| Syntax kind: | [Modifier](https://tsdoc.org/pages/spec/tag_kinds/) |
| Synonyms: | [@beta](https://tsdoc.org/pages/tags/beta/) |
<!-- prettier-ignore-end -->

## Suggested meaning

Same semantics as `@beta`, but used by tools that don't support an `@alpha` release stage.

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
  * @experimental
  */
 public get title(): string;

 /**
  * The author of the book.
  */
 public get author(): string;
}
```

In this example, `Book.author` inherits its `@public` designation from the containing class,
whereas `Book.title` is marked as "experimental".

## See also

- [@alpha](https://tsdoc.org/pages/tags/alpha/) tag
- [@beta](https://tsdoc.org/pages/tags/beta/) tag
- [@public](https://tsdoc.org/pages/tags/public/) tag
- [@internal](https://tsdoc.org/pages/tags/internal/) tag
