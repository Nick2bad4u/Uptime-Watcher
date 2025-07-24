---
mode: "agent"
tools: ["All Tools"]
description: "Review TSDoc comments to ensure they are accurate, complete, and compliant with project standards."
---

## Task

Look at this current file and systematically improve and standardize all TSDoc comments throughout the file. Take your time to accurately trace all data paths, function calls, and interactions to ensure that the documentation reflects the actual behavior of the code. This includes verifying types, parameters, return values, exceptions, and any other relevant details. You cannot make any changes until you have thoroughly reviewed the entire file and understood its structure and functionality.

Make sure you update ALL things that should have a TSDoc comment, even if it is not currently documented. This includes functions, classes, interfaces, types, and any other relevant code constructs. Do not just do a few, do the ENTIRE file.

## Requirements

- **Accuracy First:**  
  Every TSDoc comment must accurately describe the code it documents. Do not rely on assumptions—verify functionality and behavior directly from the codebase before updating or adding documentation.

- **TSDoc Tag Compliance:**  
  Use **only** the standard TSDoc base tags as detailed in [/docs/TSDoc/TSDoc-Base-Tags.md](../../docs/TSDoc/TSDoc-Base-Tags.md).
  **Do not use any tags that are not explicitly listed in the TSDoc base tags section below.**  
  Ensure that tags are used correctly and consistently.
  Make sure that the TSDoc comments are high quality, but not overly verbose just for the sake of verbosity.

- **Key Tag Emphasis:**  
  Pay special attention to the following tags. Add them wherever appropriate:
  - `@remarks` — Supplementary notes or important clarifications about the API.
  - `@param` — Document all function and method parameters, specifying their purpose and expected types. (DONT USE `@property`)
  - `@returns` — Clearly describe the return value of functions and methods.
  - `@throws` — List any errors or exceptions that can be thrown, with conditions for each.
  - `@example` — Provide usage examples, especially for complex or non-obvious APIs.

- **Additional Tags:**  
  Where relevant, incorporate these tags for completeness and clarity:
  - `@typeParam`, `@deprecated`, `@see`, `@defaultValue`, `@decorator`, `@privateRemarks`, and modifier tags such as `@public`, `@internal`, `@readonly`, etc.

- **Maintainability and Readability:**  
  Ensure that documentation is clear, concise, and aids both current and future maintainers in understanding the intent and usage of the code.

## Goal

Elevate the clarity, accuracy, and completeness of TSDoc comments for enhanced maintainability, onboarding, and developer productivity.

---

### Reference: TSDoc Base Tags

> **Use only the tags listed below. Do not include tags that are not explicitly part of this list.**

#### Block Tags

- `@remarks` — Additional information about the API.
- `@example` — Example usage of the API.
- `@param` — Documents a function or method parameter.
- `@returns` — Documents the return value of a function or method.
- `@throws` — Documents errors that may be thrown.
- `@deprecated` — Marks the API as deprecated.
- `@see` — References related information.
- `@defaultValue` — Documents the default value for a property or parameter.
- `@decorator` — Enables quoting a decorator expression in a doc comment.
- `@typeParam` — Documents a generic parameter (with name, hyphen, and description).
- `@privateRemarks` — Additional documentation not intended for public outputs.

#### Modifier Tags

- `@public` — Marks the API as public.
- `@private` — Marks the API as private.
- `@protected` — Marks the API as protected.
- `@readonly` — Marks a property as read-only.
- `@sealed` — Marks a class as sealed (cannot be subclassed).
- `@virtual` — Marks a method as virtual (can be overridden).
- `@override` — Indicates overriding an inherited definition.
- `@alpha`, `@beta`, `@experimental` — Indicate release stages.
- `@eventProperty` — Indicates the property returns an event object.
- `@internal` — Not for third-party consumption; may be omitted from public releases.
- `@packageDocumentation` — Describes an entire NPM package.

#### Inline Tags

- `{@link ...}` — Hyperlink to another API or URL.
- `{@inheritDoc ...}` — Inherits documentation from another API.
- `{@label ...}` — Labels a declaration for reference.

Refer to the full documentation in `/docs/TSDoc/TSDoc-Base-Tags.md` for detailed usage.
