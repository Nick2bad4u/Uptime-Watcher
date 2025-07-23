# Block Tags

<!-- markdownlint-disable -->

- `@remarks` -- Additional information about the API.
- `@example` -- Example usage of the API.
- `@param` -- Documents a function or method parameter.
- `@returns` -- Documents the return value of a function or method.
- `@throws` -- Documents errors that may be thrown.
- `@deprecated` -- Marks the API as deprecated.
- `@see` -- References related information.
- `@defaultValue` -- Documents the default value for a property or parameter.
- `@decorator` -- ECMAScript decorators are sometimes an important part of an API contract. The @decorator tag provides a workaround, enabling a decorator expression to be quoted in a doc comment.
- `@throws` -- Used to document an exception type that may be thrown by a function or property. Each exception type should be documented in a separate @throws block.
- `@typeParam` -- Used to document a generic parameter. The @typeParam tag is followed by a parameter name, a hyphen, and a description.
- `@privateRemarks` -- Starts a section of additional documentation content that is not intended for a public audience. Tools must omit this section from public outputs.

## Modifier Tags

- `@public` -- Marks the API as public.
- `@private` -- Marks the API as private.
- `@protected` -- Marks the API as protected.
- `@readonly` -- Marks a property as read-only.
- `@sealed` -- Marks a class as sealed (cannot be subclassed).
- `@virtual` -- Marks a method as virtual (can be overridden). Subclasses may override the member.
- `@override` -- Explicitly indicates that this definition is overriding the definition inherited from the base class.
- `@alpha` -- Designates that an API item's release stage is "alpha". Intended for third-party developers eventually, but not yet released.
- `@beta` -- Designates that an API item's release stage is "beta". Released experimentally for feedback; not for production use. The contract may change without notice.
- `@experimental` -- Same semantics as @beta, but used by tools that don't support an @alpha release stage.
- `@eventProperty` -- Indicates that the property returns an event object that event handlers can be attached to.
- `@internal` -- Designates that an API item is not planned to be used by third-party developers. May be trimmed from public release.
- `@packageDocumentation` -- Used to indicate a doc comment that describes an entire NPM package, found in the entry point \*.d.ts file.

## Inline Tags

- `{@link ...}` -- Creates a hyperlink to another API or URL.
- `{@inheritDoc ...}` -- Inherits documentation from another API.
- `{@label ...}` -- Used to label a declaration, so it can be referenced using a selector in TSDoc declaration reference notation.
