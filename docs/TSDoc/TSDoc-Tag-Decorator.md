---
title: '@decorator'
---

<!-- prettier-ignore-start -->
|    |    |
| -- | -- |
| Standardization: | [Extended](https://tsdoc.org/pages/spec/standardization_groups/) |
| Syntax kind: | [Block tag](https://tsdoc.org/pages/spec/tag_kinds/) |
<!-- prettier-ignore-end -->

## Usage

[ECMAScript decorators](https://www.typescriptlang.org/docs/handbook/decorators.html) are sometimes an important part
of an API contract. However, today the TypeScript compiler does not represent decorators in the .d.ts output files
used by API consumers. The `@decorator` tag provides a workaround, enabling a decorator expression to be quoted
in a doc comment.

## Example

```ts
class Book {
  /**
   * The title of the book.
   * @decorator `@jsonSerialized`
   * @decorator `@jsonFormat(JsonFormats.Url)`
   */
  @jsonSerialized
  @jsonFormat(JsonFormats.Url)
  public website: string;
}
```

## See also

- [RFC #271](https://github.com/microsoft/tsdoc/issues/271): `@decorator` tag for documenting ECMAScript decorators
