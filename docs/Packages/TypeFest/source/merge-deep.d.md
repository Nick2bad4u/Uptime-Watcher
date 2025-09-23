``` typescript
import type {ConditionalSimplifyDeep} from './conditional-simplify-deep.d.ts';
import type {OmitIndexSignature} from './omit-index-signature.d.ts';
import type {PickIndexSignature} from './pick-index-signature.d.ts';
import type {Merge} from './merge.d.ts';
import type {
    FirstArrayElement,
    IsBothExtends,
    UnknownArrayOrTuple,
    EnforceOptional,
} from './internal/index.d.ts';
import type {NonEmptyTuple} from './non-empty-tuple.d.ts';
import type {ArrayTail as _ArrayTail} from './array-tail.d.ts';
import type {UnknownRecord} from './unknown-record.d.ts';
import type {SimplifyDeep} from './simplify-deep.d.ts';
import type {UnknownArray} from './unknown-array.d.ts';
```

``` typescript
type Writable<TArray extends UnknownArray> = {-readonly [Key in keyof TArray]: TArray[Key]}; // TODO: Remove this
```

``` typescript
type ArrayTail<TArray extends UnknownArray> = TArray extends unknown // For distributing `TArray`
    ? keyof TArray & `${number}` extends never
        ? []
        : Writable<_ArrayTail<TArray>>
    : never; // Should never happen
```

``` typescript
type SimplifyDeepExcludeArray<T> = SimplifyDeep<T, UnknownArray>;
```

Try to merge two record properties or return the source property value, preserving `undefined` properties values in both cases.

``` typescript
type MergeDeepRecordProperty<
    Destination,
    Source,
    Options extends MergeDeepInternalOptions,
> = undefined extends Source
    ? MergeDeepOrReturn<Source, Exclude<Destination, undefined>, Exclude<Source, undefined>, Options> | undefined
    : MergeDeepOrReturn<Source, Destination, Source, Options>;
```

Walk through the union of the keys of the two objects and test in which object the properties are defined.
Rules:

1.  If the source does not contain the key, the value of the destination is returned.
2.  If the source contains the key and the destination does not contain the key, the value of the source is returned.
3.  If both contain the key, try to merge according to the chosen {@link MergeDeepOptions options} or return the source if unable to merge.

``` typescript
type DoMergeDeepRecord<
    Destination extends UnknownRecord,
    Source extends UnknownRecord,
    Options extends MergeDeepInternalOptions,
> =
```

``` typescript
    {
        [Key in keyof Destination as Key extends keyof Source ? never : Key]: Destination[Key];
    }
```

``` typescript
    & {
        [Key in keyof Source as Key extends keyof Destination ? never : Key]: Source[Key];
    }
```

``` typescript
    & {
        [Key in keyof Source as Key extends keyof Destination ? Key : never]: MergeDeepRecordProperty<Destination[Key], Source[Key], Options>;
    };
```

Wrapper around {@link DoMergeDeepRecord} which preserves index signatures.

``` typescript
type MergeDeepRecord<
    Destination extends UnknownRecord,
    Source extends UnknownRecord,
    Options extends MergeDeepInternalOptions,
> = DoMergeDeepRecord<OmitIndexSignature<Destination>, OmitIndexSignature<Source>, Options>
    & Merge<PickIndexSignature<Destination>, PickIndexSignature<Source>>;
```

``` typescript
type PickRestTypeHelper<Tail extends UnknownArrayOrTuple, Type> = Tail extends [] ? Type : PickRestType<Tail>;
```

Pick the rest type.
@example

    type Rest1 = PickRestType<[]>; // => []
    type Rest2 = PickRestType<[string]>; // => []
    type Rest3 = PickRestType<[...number[]]>; // => number[]
    type Rest4 = PickRestType<[string, ...number[]]>; // => number[]
    type Rest5 = PickRestType<string[]>; // => string[]

``` typescript
type PickRestType<Type extends UnknownArrayOrTuple> = number extends Type['length']
    ? PickRestTypeHelper<ArrayTail<Type>, Type>
    : [];
```

``` typescript
type OmitRestTypeHelper<
    Tail extends UnknownArrayOrTuple,
    Type extends UnknownArrayOrTuple,
    Result extends UnknownArrayOrTuple = [],
> = Tail extends []
    ? Result
    : OmitRestType<Tail, [...Result, FirstArrayElement<Type>]>;
```

Omit the rest type.
@example

    type Tuple1 = OmitRestType<[]>; // => []
    type Tuple2 = OmitRestType<[string]>; // => [string]
    type Tuple3 = OmitRestType<[...number[]]>; // => []
    type Tuple4 = OmitRestType<[string, ...number[]]>; // => [string]
    type Tuple5 = OmitRestType<[string, boolean[], ...number[]]>; // => [string, boolean[]]
    type Tuple6 = OmitRestType<string[]>; // => []

``` typescript
type OmitRestType<Type extends UnknownArrayOrTuple, Result extends UnknownArrayOrTuple = []> = number extends Type['length']
    ? OmitRestTypeHelper<ArrayTail<Type>, Type, Result>
    : Type;
```

``` typescript
type TypeNumberOrType<Type extends UnknownArrayOrTuple> = Type[number] extends never ? Type : Type[number];
```

``` typescript
type PickRestTypeFlat<Type extends UnknownArrayOrTuple> = TypeNumberOrType<PickRestType<Type>>;
```

Try to merge two array/tuple elements or return the source element if the end of the destination is reached or vis-versa.

``` typescript
type MergeDeepArrayOrTupleElements<
    Destination,
    Source,
    Options extends MergeDeepInternalOptions,
> = Source extends []
    ? Destination
    : Destination extends []
        ? Source
        : MergeDeepOrReturn<Source, Destination, Source, Options>;
```

Merge two tuples recursively.

``` typescript
type DoMergeDeepTupleAndTupleRecursive<
    Destination extends UnknownArrayOrTuple,
    Source extends UnknownArrayOrTuple,
    DestinationRestType,
    SourceRestType,
    Options extends MergeDeepInternalOptions,
> = Destination extends []
    ? Source extends []
        ? []
        : MergeArrayTypeAndTuple<DestinationRestType, Source, Options>
    : Source extends []
        ? MergeTupleAndArrayType<Destination, SourceRestType, Options>
        : [
            MergeDeepArrayOrTupleElements<FirstArrayElement<Destination>, FirstArrayElement<Source>, Options>,
            ...DoMergeDeepTupleAndTupleRecursive<ArrayTail<Destination>, ArrayTail<Source>, DestinationRestType, SourceRestType, Options>,
        ];
```

Merge two tuples recursively taking into account a possible rest element.

``` typescript
type MergeDeepTupleAndTupleRecursive<
    Destination extends UnknownArrayOrTuple,
    Source extends UnknownArrayOrTuple,
    Options extends MergeDeepInternalOptions,
> = [
    ...DoMergeDeepTupleAndTupleRecursive<OmitRestType<Destination>, OmitRestType<Source>, PickRestTypeFlat<Destination>, PickRestTypeFlat<Source>, Options>,
    ...MergeDeepArrayOrTupleElements<PickRestType<Destination>, PickRestType<Source>, Options>,
];
```

Merge an array type with a tuple recursively.

``` typescript
type MergeTupleAndArrayType<
    Tuple extends UnknownArrayOrTuple,
    ArrayType,
    Options extends MergeDeepInternalOptions,
> = Tuple extends []
    ? Tuple
    : [
        MergeDeepArrayOrTupleElements<FirstArrayElement<Tuple>, ArrayType, Options>,
        ...MergeTupleAndArrayType<ArrayTail<Tuple>, ArrayType, Options>,
    ];
```

Merge an array into a tuple recursively taking into account a possible rest element.

``` typescript
type MergeDeepTupleAndArrayRecursive<
    Destination extends UnknownArrayOrTuple,
    Source extends UnknownArrayOrTuple,
    Options extends MergeDeepInternalOptions,
> = [
    ...MergeTupleAndArrayType<OmitRestType<Destination>, Source[number], Options>,
    ...MergeDeepArrayOrTupleElements<PickRestType<Destination>, PickRestType<Source>, Options>,
];
```

Merge a tuple with an array type recursively.

``` typescript
type MergeArrayTypeAndTuple<
    ArrayType,
    Tuple extends UnknownArrayOrTuple,
    Options extends MergeDeepInternalOptions,
> = Tuple extends []
    ? Tuple
    : [
        MergeDeepArrayOrTupleElements<ArrayType, FirstArrayElement<Tuple>, Options>,
        ...MergeArrayTypeAndTuple<ArrayType, ArrayTail<Tuple>, Options>,
    ];
```

Merge a tuple into an array recursively taking into account a possible rest element.

``` typescript
type MergeDeepArrayAndTupleRecursive<
    Destination extends UnknownArrayOrTuple,
    Source extends UnknownArrayOrTuple,
    Options extends MergeDeepInternalOptions,
> = [
    ...MergeArrayTypeAndTuple<Destination[number], OmitRestType<Source>, Options>,
    ...MergeDeepArrayOrTupleElements<PickRestType<Destination>, PickRestType<Source>, Options>,
];
```

Merge mode for array/tuple elements.

``` typescript
type ArrayMergeMode = 'spread' | 'replace';
```

Test if it should spread top-level arrays.

``` typescript
type ShouldSpread<Options extends MergeDeepInternalOptions> = Options['spreadTopLevelArrays'] extends false
    ? Options['arrayMergeMode'] extends 'spread' ? true : false
    : true;
```

Merge two arrays/tuples according to the chosen {@link MergeDeepOptions.arrayMergeMode arrayMergeMode} option.

``` typescript
type DoMergeArrayOrTuple<
    Destination extends UnknownArrayOrTuple,
    Source extends UnknownArrayOrTuple,
    Options extends MergeDeepInternalOptions,
> = ShouldSpread<Options> extends true
    ? Array<Exclude<Destination, undefined>[number] | Exclude<Source, undefined>[number]>
    : Source; // 'replace'
```

Merge two arrays recursively.
If the two arrays are multi-level, we merge deeply, otherwise we merge the first level only.
Note: The `[number]` accessor is used to test the type of the second level.

``` typescript
type MergeDeepArrayRecursive<
    Destination extends UnknownArrayOrTuple,
    Source extends UnknownArrayOrTuple,
    Options extends MergeDeepInternalOptions,
> = Destination[number] extends UnknownArrayOrTuple
    ? Source[number] extends UnknownArrayOrTuple
        ? Array<MergeDeepArrayOrTupleRecursive<Destination[number], Source[number], Options>>
        : DoMergeArrayOrTuple<Destination, Source, Options>
    : Destination[number] extends UnknownRecord
        ? Source[number] extends UnknownRecord
            ? Array<SimplifyDeepExcludeArray<MergeDeepRecord<Destination[number], Source[number], Options>>>
            : DoMergeArrayOrTuple<Destination, Source, Options>
        : DoMergeArrayOrTuple<Destination, Source, Options>;
```

Merge two array/tuple recursively by selecting one of the four strategies according to the type of inputs.

- tuple/tuple
- tuple/array
- array/tuple
- array/array

``` typescript
type MergeDeepArrayOrTupleRecursive<
    Destination extends UnknownArrayOrTuple,
    Source extends UnknownArrayOrTuple,
    Options extends MergeDeepInternalOptions,
> = IsBothExtends<NonEmptyTuple, Destination, Source> extends true
    ? MergeDeepTupleAndTupleRecursive<Destination, Source, Options>
    : Destination extends NonEmptyTuple
        ? MergeDeepTupleAndArrayRecursive<Destination, Source, Options>
        : Source extends NonEmptyTuple
            ? MergeDeepArrayAndTupleRecursive<Destination, Source, Options>
            : MergeDeepArrayRecursive<Destination, Source, Options>;
```

Merge two array/tuple according to {@link MergeDeepOptions.recurseIntoArrays recurseIntoArrays} option.

``` typescript
type MergeDeepArrayOrTuple<
    Destination extends UnknownArrayOrTuple,
    Source extends UnknownArrayOrTuple,
    Options extends MergeDeepInternalOptions,
> = Options['recurseIntoArrays'] extends true
    ? MergeDeepArrayOrTupleRecursive<Destination, Source, Options>
    : DoMergeArrayOrTuple<Destination, Source, Options>;
```

Try to merge two objects or two arrays/tuples recursively into a new type or return the default value.

``` typescript
type MergeDeepOrReturn<
    DefaultType,
    Destination,
    Source,
    Options extends MergeDeepInternalOptions,
> = SimplifyDeepExcludeArray<[undefined] extends [Destination | Source]
    ? DefaultType
    : Destination extends UnknownRecord
        ? Source extends UnknownRecord
            ? MergeDeepRecord<Destination, Source, Options>
            : DefaultType
        : Destination extends UnknownArrayOrTuple
            ? Source extends UnknownArrayOrTuple
                ? MergeDeepArrayOrTuple<Destination, Source, EnforceOptional<Merge<Options, {spreadTopLevelArrays: false}>>>
                : DefaultType
            : DefaultType>;
```

MergeDeep options.
@see {@link MergeDeep}

Merge mode for array and tuple.
When we walk through the properties of the objects and the same key is found and both are array or tuple, a merge mode must be chosen:
- `replace`: Replaces the destination value by the source value. This is the default mode.
- `spread`: Spreads the destination and the source values.
See {@link MergeDeep} for usages and examples.
Note: Top-level arrays and tuples are always spread.
@default 'replace'

``` typescript
export type MergeDeepOptions = {
    arrayMergeMode?: ArrayMergeMode;
```

Whether to affect the individual elements of arrays and tuples.
If this option is set to `true` the following rules are applied:
- If the source does not contain the key, the value of the destination is returned.
- If the source contains the key and the destination does not contain the key, the value of the source is returned.
- If both contain the key, try to merge according to the chosen {@link MergeDeepOptions.arrayMergeMode arrayMergeMode} or return the source if unable to merge.
@default false

``` typescript
    recurseIntoArrays?: boolean;
};
```

Internal options.

``` typescript
type MergeDeepInternalOptions = Merge<MergeDeepOptions, {spreadTopLevelArrays?: boolean}>;
```

Merge default and internal options with user provided options.

``` typescript
type DefaultMergeDeepOptions<Options extends MergeDeepOptions> = Merge<{
    arrayMergeMode: 'replace';
    recurseIntoArrays: false;
    spreadTopLevelArrays: true;
}, Options>;
```

This utility selects the correct entry point with the corresponding default options. This avoids re-merging the options at each iteration.

``` typescript
type MergeDeepWithDefaultOptions<Destination, Source, Options extends MergeDeepOptions> = SimplifyDeepExcludeArray<
    [undefined] extends [Destination | Source]
        ? never
        : Destination extends UnknownRecord
            ? Source extends UnknownRecord
                ? MergeDeepRecord<Destination, Source, DefaultMergeDeepOptions<Options>>
                : never
            : Destination extends UnknownArrayOrTuple
                ? Source extends UnknownArrayOrTuple
                    ? MergeDeepArrayOrTuple<Destination, Source, DefaultMergeDeepOptions<Options>>
                    : never
                : never
>;
```

Merge two objects or two arrays/tuples recursively into a new type.

- Properties that only exist in one object are copied into the new object.
- Properties that exist in both objects are merged if possible or replaced by the one of the source if not.
- Top-level arrays and tuples are always spread.
- By default, inner arrays and tuples are replaced. See {@link MergeDeepOptions.arrayMergeMode arrayMergeMode} option to change this behaviour.
- By default, individual array/tuple elements are not affected. See {@link MergeDeepOptions.recurseIntoArrays recurseIntoArrays} option to change this behaviour.
  @example

<!-- -->

    import type {MergeDeep} from 'type-fest';
    type Foo = {
        life: number;
        items: string[];
        a: {b: string; c: boolean; d: number[]};
    };
    interface Bar {
        name: string;
        items: number[];
        a: {b: number; d: boolean[]};
    }
    type FooBar = MergeDeep<Foo, Bar>;
    // {
    //  life: number;
    //  name: string;
    //  items: number[];
    //  a: {b: number; c: boolean; d: boolean[]};
    // }
    type FooBar = MergeDeep<Foo, Bar, {arrayMergeMode: 'spread'}>;
    // {
    //  life: number;
    //  name: string;
    //  items: (string | number)[];
    //  a: {b: number; c: boolean; d: (number | boolean)[]};
    // }

@example

    import type {MergeDeep} from 'type-fest';
    // Merge two arrays
    type ArrayMerge = MergeDeep<string[], number[]>; // => (string | number)[]
    // Merge two tuples
    type TupleMerge = MergeDeep<[1, 2, 3], ['a', 'b']>; // => (1 | 2 | 3 | 'a' | 'b')[]
    // Merge an array into a tuple
    type TupleArrayMerge = MergeDeep<[1, 2, 3], string[]>; // => (string | 1 | 2 | 3)[]
    // Merge a tuple into an array
    type ArrayTupleMerge = MergeDeep<number[], ['a', 'b']>; // => (number | 'b' | 'a')[]

@example

    import type {MergeDeep, MergeDeepOptions} from 'type-fest';
    type Foo = {foo: 'foo'; fooBar: string[]};
    type Bar = {bar: 'bar'; fooBar: number[]};
    type FooBar = MergeDeep<Foo, Bar>;
    // { foo: "foo"; bar: "bar"; fooBar: number[]}
    type FooBarSpread = MergeDeep<Foo, Bar, {arrayMergeMode: 'spread'}>;
    // { foo: "foo"; bar: "bar"; fooBar: (string | number)[]}
    type FooBarArray = MergeDeep<Foo[], Bar[]>;
    // (Foo | Bar)[]
    type FooBarArrayDeep = MergeDeep<Foo[], Bar[], {recurseIntoArrays: true}>;
    // FooBar[]
    type FooBarArraySpreadDeep = MergeDeep<Foo[], Bar[], {recurseIntoArrays: true; arrayMergeMode: 'spread'}>;
    // FooBarSpread[]
    type FooBarTupleDeep = MergeDeep<[Foo, true, 42], [Bar, 'life'], {recurseIntoArrays: true}>;
    // [FooBar, 'life', 42]
    type FooBarTupleWithArrayDeep = MergeDeep<[Foo[], true], [Bar[], 'life', 42], {recurseIntoArrays: true}>;
    // [FooBar[], 'life', 42]

@example

    import type {MergeDeep, MergeDeepOptions} from 'type-fest';
    function mergeDeep<Destination, Source, Options extends MergeDeepOptions = {}>(
        destination: Destination,
        source: Source,
        options?: Options,
    ): MergeDeep<Destination, Source, Options> {
        // Make your implementation ...
    }

@experimental This type is marked as experimental because it depends on {@link ConditionalSimplifyDeep} which itself is experimental.
@see {@link MergeDeepOptions}
@category Array
@category Object
@category Utilities

``` typescript
export type MergeDeep<Destination, Source, Options extends MergeDeepOptions = {}> = MergeDeepWithDefaultOptions<
    SimplifyDeepExcludeArray<Destination>,
    SimplifyDeepExcludeArray<Source>,
    Options
>;
```