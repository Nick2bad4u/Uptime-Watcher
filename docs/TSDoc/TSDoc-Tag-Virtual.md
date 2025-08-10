---
title: "@virtual"
---

<!-- prettier-ignore-start -->
|    |    |
| -- | -- |
| Standardization: | [Extended](https://tsdoc.org/pages/spec/standardization_groups/) |
| Syntax kind: | [Modifier](https://tsdoc.org/pages/spec/tag_kinds/) |
<!-- prettier-ignore-end -->

## Usage

This modifier has similar semantics to the `virtual` keyword in C# or Java. For a member function or property,
explicitly indicates that subclasses may override (i.e. redefine) the member.

A documentation tool may enforce that the `@virtual`, `@override`, and/or `@sealed` modifiers are consistently
applied, but this is not required by the TSDoc standard.

## Example

In the code sample below, `Child.render()` overrides the virtual member `Base.render()`:

```ts
class Base {
 /** @virtual */
 public render(): void {}

 /** @sealed */
 public initialize(): void {}
}

class Child extends Base {
 /** @override */
 public render(): void;
}
```

## See also

- [@override](https://tsdoc.org/pages/tags/override/) tag
- [@sealed](https://tsdoc.org/pages/tags/sealed/) tag
- [C# reference: virtual](https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/virtual):
  an equivalent feature from another programming language
