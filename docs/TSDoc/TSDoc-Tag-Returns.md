---
title: "@returns"
---

<!-- prettier-ignore-start -->
|    |    |
| -- | -- |
| Standardization: | [Core](https://tsdoc.org/pages/spec/standardization_groups/) |
| Syntax kind: | [Block tag](https://tsdoc.org/pages/spec/tag_kinds/) |
<!-- prettier-ignore-end -->

## Usage

Used to document the return value for a function.

## Example

```ts
/**
 * Returns the average of two numbers.
 *
 * @remarks
 * This method is part of the {@link core-library#Statistics | Statistics subsystem}.
 *
 * @param x - The first input number
 * @param y - The second input number
 * @returns The arithmetic mean of `x` and `y`
 *
 * @beta
 */
function getAverage(x: number, y: number): number {
 return (x + y) / 2.0;
}
```

## See also

- [@param](https://tsdoc.org/pages/tags/param/) tag
