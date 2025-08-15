---
title: "@throws"
---

<!-- prettier-ignore-start -->
|    |    |
| -- | -- |
| Standardization: | [Extended](https://tsdoc.org/pages/spec/standardization_groups/) |
| Syntax kind: | [Block tag](https://tsdoc.org/pages/spec/tag_kinds/) |
<!-- prettier-ignore-end -->

## Usage

Used to document an exception type that may be thrown by a function or property.

A separate `@throws` block should be used to document each exception type. This tag is for informational
purposes only, and does not restrict other types from being thrown. It is suggested, but not required,
for the `@throws` block to start with a line containing only the name of the exception.

For example:

```ts
/**
 * Retrieves metadata about a book from the catalog.
 *
 * @param isbnCode - The ISBN number for the book
 *
 * @returns The retrieved book object
 *
 * @throws {@link IsbnSyntaxError} This exception is thrown if the input is not
 *   a valid ISBN number.
 * @throws {@link book-lib#BookNotFoundError} Thrown if the ISBN number is
 *   valid, but no such book exists in the catalog.
 *
 * @public
 */
function fetchBookByIsbn(isbnCode: string): Book;
```

## See also

- [RFC 171](https://github.com/microsoft/tsdoc/issues/171): `@throws` tag for documenting exceptions
