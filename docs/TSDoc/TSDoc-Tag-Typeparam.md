---
title: "@typeParam"
---

<!-- prettier-ignore-start -->
|    |    |
| -- | -- |
| Standardization: | [Core](https://tsdoc.org/pages/spec/standardization_groups/) |
| Syntax kind: | [Block tag](https://tsdoc.org/pages/spec/tag_kinds/) |
<!-- prettier-ignore-end -->

## Usage

Used to document a generic parameter. The `@typeParam` tag is followed by a parameter
name, followed by a hyphen, followed by a description. The TSDoc parser recognizes
this syntax and will extract it into a DocParamBlock node.

## Example

```ts
/**
 * Alias for array
 *
 * @typeParam T - Type of objects the list contains
 */
type List<T> = Array<T>;

/**
 * Wrapper for an HTTP Response
 * @typeParam B - Response body
 * @param <H> - Headers
 */
interface HttpResponse<B, H> {
 body: B;
 headers: H;
 statusCode: number;
}
```

## See also

- [RFC #72](https://github.com/microsoft/tsdoc/issues/72):
  Support for `@typeparam` or `@template` for documenting generic parameters
