---
title: "@eventProperty"
---

<!-- prettier-ignore-start -->
|    |    |
| -- | -- |
| Standardization: | [Extended](https://tsdoc.org/pages/spec/standardization_groups/) |
| Syntax kind: | [Modifier](https://tsdoc.org/pages/spec/tag_kinds/) |
<!-- prettier-ignore-end -->

## Usage

When applied to a class or interface property, this indicates that the property
returns an event object that event handlers can be attached to. The event-handling
API is implementation-defined, but typically the property return type would be a class
with members such as `addHandler()` and `removeHandler()`. A documentation tool can
display such properties under an "Events" heading instead of the usual "Properties" heading.

## Example

```ts
class MyClass {
 /**
  * This event is fired whenever the application navigates to a new page.
  *
  * @eventProperty
  */
 public readonly navigatedEvent: FrameworkEvent<NavigatedEventArgs>;
}
```

## See also

- [RFC #30](https://github.com/microsoft/tsdoc/issues/30): Marking events using `@eventClass` and/or `@eventProperty`
