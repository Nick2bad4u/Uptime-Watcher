---
name: "Review-Types-Typefest"
agent: "BeastMode"
description: "Systematically harden TypeScript types and implement type-fest utilities."
argument-hint: "Improve Type Safety & Implement Type-Fest"
---

# Review and Harden TypeScript Definitions

You are an expert TypeScript developer with deep knowledge of type systems and the `type-fest` library. Your task is to systematically review a TypeScript codebase to identify areas where type safety can be improved. This includes replacing loose types (like `any`, `object`, or untyped `Function`) with stricter definitions, leveraging `type-fest` utilities + types to enhance type clarity and safety.

*Note: This is a recursive prompt designed to continuously improve the TypeScript codebase. The goal is to progressively eliminate loose types, replace them with strict definitions, and leverage the `type-fest` library for better utility types. You must scan files iteratively. As you finish one module, move on to the next area that needs improvement.*

### List of Typefest Types and Utilities to Use

### Basic

- `Primitive` - Matches any [primitive value](https://developer.mozilla.org/en-US/docs/Glossary/Primitive).
- `Class` - Matches a [`class`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes).
- `Constructor` - Matches a [`class` constructor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes).
- `AbstractClass` - Matches an [`abstract class`](https://www.typescriptlang.org/docs/handbook/2/classes.html#abstract-classes-and-members).
- `AbstractConstructor` - Matches an [`abstract class`](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-2.html#abstract-construct-signatures) constructor.
- `TypedArray` - Matches any [typed array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray), like `Uint8Array` or `Float64Array`.
- `ObservableLike` - Matches a value that is like an [Observable](https://github.com/tc39/proposal-observable).
- `LowercaseLetter` - Matches any lowercase letter in the basic Latin alphabet (a-z).
- `UppercaseLetter` - Matches any uppercase letter in the basic Latin alphabet (A-Z).
- `DigitCharacter` - Matches any digit as a string ('0'-'9').
- `Alphanumeric` - Matches any lowercase letter (a-z), uppercase letter (A-Z), or digit ('0'-'9') in the basic Latin alphabet.

### Utilities

- `EmptyObject` - Represents a strictly empty plain object, the `{}` value.
- `NonEmptyObject` - Represents an object with at least 1 non-optional key.
- `UnknownRecord` - Represents an object with `unknown` value. You probably want this instead of `{}`.
- `UnknownArray` - Represents an array with `unknown` value.
- `UnknownMap` - Represents a map with `unknown` key and value.
- `UnknownSet` - Represents a set with `unknown` value.
- `Except` - Create a type from an object type without certain keys. This is a stricter version of [`Omit`](https://www.typescriptlang.org/docs/handbook/utility-types.html#omittype-keys).
- `Writable` - Create a type that strips `readonly` from the given type. Inverse of `Readonly<T>`.
- `WritableDeep` - Create a deeply mutable version of an `object`/`ReadonlyMap`/`ReadonlySet`/`ReadonlyArray` type. The inverse of `ReadonlyDeep<T>`. Use `Writable<T>` if you only need one level deep.
- `Merge` - Merge two types into a new type. Keys of the second type overrides keys of the first type.
- `MergeDeep` - Merge two objects or two arrays/tuples recursively into a new type.
- `MergeExclusive` - Create a type that has mutually exclusive keys.
- `OverrideProperties` - Override only existing properties of the given type. Similar to `Merge`, but enforces that the original type has the properties you want to override.
- `RequireAtLeastOne` - Create a type that requires at least one of the given keys.
- `RequireExactlyOne` - Create a type that requires exactly a single key of the given keys and disallows more.
- `RequireAllOrNone` - Create a type that requires all of the given keys or none of the given keys.
- `RequireOneOrNone` - Create a type that requires exactly a single key of the given keys and disallows more, or none of the given keys.
- `SingleKeyObject` - Create a type that only accepts an object with a single key.
- `RequiredDeep` - Create a deeply required version of another type. Use [`Required<T>`](https://www.typescriptlang.org/docs/handbook/utility-types.html#requiredtype) if you only need one level deep.
- `PickDeep` - Pick properties from a deeply-nested object. Use [`Pick<T>`](https://www.typescriptlang.org/docs/handbook/utility-types.html#picktype-keys) if you only need one level deep.
- `OmitDeep` - Omit properties from a deeply-nested object. Use [`Omit<T>`](https://www.typescriptlang.org/docs/handbook/utility-types.html#omittype-keys) if you only need one level deep.
- `OmitIndexSignature` - Omit any index signatures from the given object type, leaving only explicitly defined properties.
- `PickIndexSignature` - Pick only index signatures from the given object type, leaving out all explicitly defined properties.
- `PartialDeep` - Create a deeply optional version of another type. Use [`Partial<T>`](https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype) if you only need one level deep.
- `PartialOnUndefinedDeep` - Create a deep version of another type where all keys accepting `undefined` type are set to optional.
- `UndefinedOnPartialDeep` - Create a deep version of another type where all optional keys are set to also accept `undefined`.
- `ReadonlyDeep` - Create a deeply immutable version of an `object`/`Map`/`Set`/`Array` type. Use [`Readonly<T>`](https://www.typescriptlang.org/docs/handbook/utility-types.html#readonlytype) if you only need one level deep.
- `LiteralUnion` - Create a union type by combining primitive types and literal types without sacrificing auto-completion in IDEs for the literal type part of the union.
 - `Tagged` - Create a [tagged type](https://medium.com/@KevinBGreene/surviving-the-typescript-ecosystem-branding-and-type-tagging-6cf6e516523d) that can support [multiple tags](https://github.com/sindresorhus/type-fest/issues/665) and [per-tag metadata](https://medium.com/@ethanresnick/advanced-typescript-tagged-types-improved-with-type-level-metadata-5072fc125fcf). (This replaces the previous `Opaque` type, which is now deprecated.)
 - `UnwrapTagged` - Get the untagged portion of a tagged type created with `Tagged`. (This replaces the previous `UnwrapOpaque` type, which is now deprecated.)
 - `InvariantOf` - Create an [invariant type](https://basarat.gitbook.io/typescript/type-system/type-compatibility#footnote-invariance), which is a type that does not accept supertypes and subtypes.
 - `SetOptional` - Create a type that makes the given keys optional.
 - `SetReadonly` - Create a type that makes the given keys readonly.
 - `SetRequired` - Create a type that makes the given keys required.
 - `SetRequiredDeep` - Like `SetRequired` except it selects the keys deeply.
 - `SetNonNullable` - Create a type that makes the given keys non-nullable.
 - `SetNonNullableDeep` - Create a type that makes the specified keys non-nullable (removes `null` and `undefined`), supports deeply nested key paths, and leaves all other keys unchanged.
 - `ValueOf` - Create a union of the given object's values, and optionally specify which keys to get the values from.
 - `ConditionalKeys` - Extract keys from a shape where values extend the given `Condition` type.
 - `ConditionalPick` - Like `Pick` except it selects properties from a shape where the values extend the given `Condition` type.
 - `ConditionalPickDeep` - Like `ConditionalPick` except that it selects the properties deeply.
 - `ConditionalExcept` - Like `Omit` except it removes properties from a shape where the values extend the given `Condition` type.
 - `UnionToIntersection` - Convert a union type to an intersection type.
 - `LiteralToPrimitive` - Convert a [literal type](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-types) to the primitive type it belongs to.
 - `LiteralToPrimitiveDeep` - Like `LiteralToPrimitive` except it converts literal types inside an object or array deeply.
 - `Stringified` - Create a type with the keys of the given type changed to `string` type.
 - `IterableElement` - Get the element type of an `Iterable`/`AsyncIterable`. For example, `Array`, `Set`, `Map`, generator, stream, etc.
 - `Entry` - Create a type that represents the type of an entry of a collection.
 - `Entries` - Create a type that represents the type of the entries of a collection.
 - `SetReturnType` - Create a function type with a return type of your choice and the same parameters as the given function type.
 - `SetParameterType` - Create a function that replaces some parameters with the given parameters.
 - `Simplify` - Useful to flatten the type output to improve type hints shown in editors. And also to transform an interface into a type to aide with assignability.
 - `SimplifyDeep` - Deeply simplifies an object type.
 - `Get` - Get a deeply-nested property from an object using a key path, like [Lodash's `.get()`](https://lodash.com/docs/latest#get) function.
 - `KeyAsString` - Get keys of the given type as strings.
 - `Schema` - Create a deep version of another object type where property values are recursively replaced into a given value type.
 - `Exact` - Create a type that does not allow extra properties.
 - `KeysOfUnion` - Create a union of all keys from a given type, even those exclusive to specific union members.
 - `OptionalKeysOf` - Extract all optional keys from the given type.
 - `HasOptionalKeys` - Create a `true`/`false` type depending on whether the given type has any optional fields.
 - `RequiredKeysOf` - Extract all required keys from the given type.
 - `HasRequiredKeys` - Create a `true`/`false` type depending on whether the given type has any required fields.
 - `ReadonlyKeysOf` - Extract all readonly keys from the given type.
 - `HasReadonlyKeys` - Create a `true`/`false` type depending on whether the given type has any readonly fields.
 - `WritableKeysOf` - Extract all writable (non-readonly) keys from the given type.
 - `HasWritableKeys` - Create a `true`/`false` type depending on whether the given type has any writable fields.
 - `Spread` - Mimic the type inferred by TypeScript when merging two objects or two arrays/tuples using the spread syntax.
 - `IsEqual` - Returns a boolean for whether the two given types are equal.
 - `TaggedUnion` - Create a union of types that share a common discriminant property.
 - `IntRange` - Generate a union of numbers (includes the start and excludes the end).
 - `IntClosedRange` - Generate a union of numbers (includes the start and the end).
 - `ArrayIndices` - Provides valid indices for a constant array or tuple.
 - `ArrayValues` - Provides all values for a constant array or tuple.
 - `ArraySplice` - Create a new array type by adding or removing elements at a specified index range in the original array.
 - `ArrayTail` - Extract the type of an array or tuple minus the first element.
 - `SetFieldType` - Create a type that changes the type of the given keys.
 - `Paths` - Generate a union of all possible paths to properties in the given object.
 - `SharedUnionFields` - Create a type with shared fields from a union of object types.
 - `SharedUnionFieldsDeep` - Create a type with shared fields from a union of object types, deeply traversing nested structures.
 - `AllUnionFields` - Create a type with all fields from a union of object types.
 - `DistributedOmit` - Omits keys from a type, distributing the operation over a union.
 - `DistributedPick` - Picks keys from a type, distributing the operation over a union.
 - `And` - Returns a boolean for whether two given types are both true.
 - `Or` - Returns a boolean for whether either of two given types is true.
 - `Xor` - Returns a boolean for whether only one of two given types is true.
 - `AllExtend` - Returns a boolean for whether every element in an array type extends another type.
 - `NonEmptyTuple` - Matches any non-empty tuple.
 - `NonEmptyString` - Matches any non-empty string.
 - `FindGlobalType` - Tries to find the type of a global with the given name.
 - `FindGlobalInstanceType` - Tries to find one or more types from their globally-defined constructors.
 - `ConditionalSimplify` - Simplifies a type while including and/or excluding certain types from being simplified.
 - `ConditionalSimplifyDeep` - Recursively simplifies a type while including and/or excluding certain types from being simplified.
 - `ExclusifyUnion` - Ensure mutual exclusivity in object unions by adding other members’ keys as `?: never`.

### Type Guard

- `If` - An if-else-like type that resolves depending on whether the given `boolean` type is `true` or `false`.
- `IsLiteral` - Returns a boolean for whether the given type is a [literal type](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-types).
- `IsStringLiteral` - Returns a boolean for whether the given type is a `string` [literal type](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-types).
- `IsNumericLiteral` - Returns a boolean for whether the given type is a `number` or `bigint` [literal type](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-types).
- `IsBooleanLiteral` - Returns a boolean for whether the given type is a `true` or `false` [literal type](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-types).
- `IsSymbolLiteral` - Returns a boolean for whether the given type is a `symbol` [literal type](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-types).
- `IsAny` - Returns a boolean for whether the given type is `any`.
- `IsNever` - Returns a boolean for whether the given type is `never`.
- `IsUnknown` - Returns a boolean for whether the given type is `unknown`.
- `IsEmptyObject` - Returns a boolean for whether the type is strictly equal to an empty plain object, the `{}` value.
- `IsNull` - Returns a boolean for whether the given type is `null`.
- `IsUndefined` - Returns a boolean for whether the given type is `undefined`.
- `IsTuple` - Returns a boolean for whether the given array is a tuple.
- `IsUnion` - Returns a boolean for whether the given type is a union.
- `IsLowercase` - Returns a boolean for whether the given string literal is lowercase.
- `IsUppercase` - Returns a boolean for whether the given string literal is uppercase.
- `IsOptional` - Returns a boolean for whether the given type includes `undefined`.
- `IsNullable` - Returns a boolean for whether the given type includes `null`.
- `IsOptionalKeyOf` - Returns a boolean for whether the given key is an optional key of type.
- `IsRequiredKeyOf` - Returns a boolean for whether the given key is a required key of type.
- `IsReadonlyKeyOf` - Returns a boolean for whether the given key is a readonly key of type.
- `IsWritableKeyOf` - Returns a boolean for whether the given key is a writable key of type.

### JSON

- `Jsonify` - Transform a type to one that is assignable to the `JsonValue` type.
- `Jsonifiable` - Matches a value that can be losslessly converted to JSON.
- `JsonPrimitive` - Matches a JSON primitive.
- `JsonObject` - Matches a JSON object.
- `JsonArray` - Matches a JSON array.
- `JsonValue` - Matches any valid JSON value.

### Structured clone

 - `StructuredCloneable` - Matches a value that can be losslessly cloned using `structuredClone`.

### Async

 - `Promisable` - Create a type that represents either the value or the value wrapped in `PromiseLike`.
 - `AsyncReturnType` - Unwrap the return type of a function that returns a `Promise`.
 - `Asyncify` - Create an async version of the given function type.

### String

 - `Trim` - Remove leading and trailing spaces from a string.
 - `Split` - Represents an array of strings split using a given character or character set.
 - `Words` - Represents an array of strings split using a heuristic for detecting words.
 - `Replace` - Represents a string with some or all matches replaced by a replacement.
 - `StringSlice` - Returns a string slice of a given range, just like `String#slice()`.
 - `StringRepeat` - Returns a new string which contains the specified number of copies of a given string, just like `String#repeat()`.
 - `RemovePrefix` - Remove the specified prefix from the start of a string.

### Array

- `Arrayable` - Create a type that represents either the value or an array of the value.
- `Includes` - Returns a boolean for whether the given array includes the given item.
- `Join` - Join an array of strings and/or numbers using the given string as a delimiter.
- `ArraySlice` - Returns an array slice of a given range, just like `Array#slice()`.
- `ArrayElement` - Extracts the element type of an array or tuple.
- `LastArrayElement` - Extract the type of the last element of an array.
- `FixedLengthArray` - Create a type that represents an array of the given type and length. The `Array` prototype methods that manipulate its length are excluded from the resulting type.
- `MultidimensionalArray` - Create a type that represents a multidimensional array of the given type and dimensions.
- `MultidimensionalReadonlyArray` - Create a type that represents a multidimensional readonly array of the given type and dimensions.
- `ReadonlyTuple` - Create a type that represents a read-only tuple of the given type and length.
- `TupleToUnion` - Convert a tuple/array into a union type of its elements.
- `UnionToTuple` - Convert a union type into an unordered tuple type of its elements.
- `TupleToObject` - Transforms a tuple into an object, mapping each tuple index to its corresponding type as a key-value pair.
- `TupleOf` - Create a tuple type of the specified length with elements of the specified type.
- `SplitOnRestElement` - Splits an array into three parts, where the first contains all elements before the rest element, the second is the `rest` element itself, and the third contains all elements after the rest element.
- `ExtractRestElement` - Extract the `rest` element type from an array.
- `ExcludeRestElement` - Create a tuple with the `rest` element removed.

### Numeric

- `PositiveInfinity` - Matches the hidden `Infinity` type.
- `NegativeInfinity` - Matches the hidden `-Infinity` type.
- `Finite` - A finite `number`.
- `Integer` - A `number` that is an integer.
- `Float` - A `number` that is not an integer.
- `NegativeFloat` - A negative (`-∞ < x < 0`) `number` that is not an integer.
- `Negative` - A negative `number`/`bigint` (`-∞ < x < 0`)
- `NonNegative` - A non-negative `number`/`bigint` (`0 <= x < ∞`).
- `NegativeInteger` - A negative (`-∞ < x < 0`) `number` that is an integer.
- `NonNegativeInteger` - A non-negative (`0 <= x < ∞`) `number` that is an integer.
- `IsNegative` - Returns a boolean for whether the given number is a negative number.
- `IsFloat` - Returns a boolean for whether the given number is a float, like `1.5` or `-1.5`.
- `IsInteger` - Returns a boolean for whether the given number is a integer, like `-5`, `1.0` or `100`.
- `GreaterThan` - Returns a boolean for whether a given number is greater than another number.
- `GreaterThanOrEqual` - Returns a boolean for whether a given number is greater than or equal to another number.
- `LessThan` - Returns a boolean for whether a given number is less than another number.
- `LessThanOrEqual` - Returns a boolean for whether a given number is less than or equal to another number.
- `Sum` - Returns the sum of two numbers.
- `Subtract` - Returns the difference between two numbers.

### Change case

- `CamelCase` - Convert a string literal to camel-case (`fooBar`).
- `CamelCasedProperties` - Convert object properties to camel-case (`fooBar`).
- `CamelCasedPropertiesDeep` - Convert object properties to camel-case recursively (`fooBar`).
- `KebabCase` - Convert a string literal to kebab-case (`foo-bar`).
- `KebabCasedProperties` - Convert object properties to kebab-case (`foo-bar`).
- `KebabCasedPropertiesDeep` - Convert object properties to kebab-case recursively (`foo-bar`).
- `PascalCase` - Convert a string literal to pascal-case (`FooBar`).
- `PascalCasedProperties` - Convert object properties to pascal-case (`FooBar`).
- `PascalCasedPropertiesDeep` - Convert object properties to pascal-case recursively (`FooBar`).
- `SnakeCase` - Convert a string literal to snake-case (`foo_bar`).
- `SnakeCasedProperties` - Convert object properties to snake-case (`foo_bar`).
- `SnakeCasedPropertiesDeep` - Convert object properties to snake-case recursively (`foo_bar`).
- `ScreamingSnakeCase` - Convert a string literal to screaming-snake-case (`FOO_BAR`).
- `DelimiterCase` - Convert a string literal to a custom string delimiter casing.
- `DelimiterCasedProperties` - Convert object properties to a custom string delimiter casing.
- `DelimiterCasedPropertiesDeep` - Convert object properties to a custom string delimiter casing recursively.

### Miscellaneous

- `GlobalThis` - Declare locally scoped properties on `globalThis`.
- `PackageJson` - Type for [npm's `package.json` file](https://docs.npmjs.com/creating-a-package-json-file). It also includes support for [TypeScript Declaration Files](https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html).
- `TsConfigJson` - Type for [TypeScript's `tsconfig.json` file](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html).

### Improved built-in

- `ExtendsStrict` - A stricter, non-distributive version of `extends` for checking whether one type is assignable to another.
- `ExtractStrict` - A stricter version of `Extract<T, U>` that ensures every member of `U` can successfully extract something from `T`.
- `ExcludeStrict` - A stricter version of `Exclude<T, U>` that ensures every member of `U` can successfully exclude something from `T`.

## Workflow
1. **Scan for Loose Types**:
   - Identify areas using `any`, `as any`, loose `object`, or untyped `Function` definitions.
   - Prioritize core domain logic and shared utilities.
2. **Implement `type-fest` Utilities**:
   - Refactor complex mapped types using `type-fest` equivalents (e.g., `Merge`, `Opaque`, `Jsonifiable`, `SetOptional`) where they improve readability or safety.
3. **Tighten Null/Undefined Handling**:
   - Look for potential runtime errors masked by optional chaining or lack of strict null checks.
4. **Refactor Unions and Enums**:
   - Improve string literals by converting them to Unions or Enums.
   - Use Template Literal Types for pattern-matching strings where appropriate.
5. **Use unlimited requests and time as needed.**
6. **Do not skip complex files.** These often yield the highest value when typed strictly.
7. **Iterative Loop**: Once a file is refactored, verify it against the compiler, then look for the next candidate file.
8. Continue the process until the codebase is significantly hardened.

---
## Type-Fest Implementation Guidelines

The best way to use `type-fest` is to gradually replace loose or complex type definitions with the well-tested and community-approved utilities provided by the library. This not only improves type safety but also enhances code readability and maintainability.

Note: All type-fest source files referenced below are available locally at `node_modules/type-fest/source/` - you can refer to them for implementation details.

---
## Special Instructions
- **Reduce `any`**: Aim to replace `any` with `unknown` or specific types wherever possible.
- **Inference**: Look for variables relying on implicit `any` and add annotations.
- **Generics**: Ensure Generics have appropriate constraints (e.g., `extends`) rather than being unbounded.
- **Documentation**: If a type becomes complex during refactoring, add TSDoc comments explaining the logic.
- **Logic Checks**: If strictly typing a file reveals logical bugs, document them or fix them if the solution is obvious.

---
## Requirements
- Improve type safety in scanned files.
- Ensure the project compiles without errors after changes.
- Use `type-fest` where it adds value or clarity.
- Document any major refactors.

### Important AI Note
- **Time constraint setting:** `unlimited`
- **Compute Resource setting:** `unlimited`
- **Thinking Mode setting:** `Ultrathink` or `High`
- **Loop Mode:** `Enabled` (Keep scanning for new files to improve).
- **Self-Review:** After each change, review the modifications for potential improvements or oversights.


### Repeated Prompt
- If you feel you have scanned everything, restart the process to catch any missed files or new areas for improvement. Look at your context and scan areas that aren't in there yet. Get all the way down to the nested folders and files, no matter how small.
