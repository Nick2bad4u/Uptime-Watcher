``` typescript
import type {ArraySplice} from './array-splice.d.ts';
import type {ExactKey, IsArrayReadonly, NonRecursiveType, SetArrayAccess, ToString} from './internal/index.d.ts';
import type {IsEqual} from './is-equal.d.ts';
import type {IsNever} from './is-never.d.ts';
import type {LiteralUnion} from './literal-union.d.ts';
import type {Paths} from './paths.d.ts';
import type {SimplifyDeep} from './simplify-deep.d.ts';
import type {UnionToTuple} from './union-to-tuple.d.ts';
import type {UnknownArray} from './unknown-array.d.ts';
```

Omit properties from a deeply-nested object.
It supports recursing into arrays.
It supports removing specific items from an array, replacing each removed item with unknown at the specified index.
Use-case: Remove unneeded parts of complex objects.
Use [`Omit`](https://www.typescriptlang.org/docs/handbook/utility-types.html#omittype-keys) if you only need one level deep.
@example

    import type {OmitDeep} from 'type-fest';
    type Info = {
        userInfo: {
            name: string;
            uselessInfo: {
                foo: string;
            };
        };
    };
    type UsefulInfo = OmitDeep<Info, 'userInfo.uselessInfo'>;
    // type UsefulInfo = {
    //  userInfo: {
    //      name: string;
    //  };
    // };
    // Supports removing multiple paths
    type Info1 = {
        userInfo: {
            name: string;
            uselessField: string;
            uselessInfo: {
                foo: string;
            };
        };
    };
    type UsefulInfo1 = OmitDeep<Info1, 'userInfo.uselessInfo' | 'userInfo.uselessField'>;
    // type UsefulInfo1 = {
    //  userInfo: {
    //      name: string;
    //  };
    // };
    // Supports array
    type A = OmitDeep<[1, 'foo', 2], 1>;
    // type A = [1, unknown, 2];
    // Supports recursing into array
    type Info1 = {
        address: [
            {
                street: string
            },
            {
                street2: string,
                foo: string
            };
        ];
    }
    type AddressInfo = OmitDeep<Info1, 'address.1.foo'>;
    // type AddressInfo = {
    //  address: [
    //      {
    //          street: string;
    //      },
    //      {
    //          street2: string;
    //      };
    //  ];
    // };

@category Object
@category Array

``` typescript
export type OmitDeep<T, PathUnion extends LiteralUnion<Paths<T>, string>> =
    SimplifyDeep<
        OmitDeepHelper<T, UnionToTuple<PathUnion>>,
        UnknownArray>;
```

Internal helper for {@link OmitDeep}.
Recursively transforms `T` by applying {@link OmitDeepWithOnePath} for each path in `PathTuple`.

``` typescript
type OmitDeepHelper<T, PathTuple extends UnknownArray> =
    PathTuple extends [infer Path, ...infer RestPaths]
        ? OmitDeepHelper<OmitDeepWithOnePath<T, Path & (string | number)>, RestPaths>
        : T;
```

Omit one path from the given object/array.

``` typescript
type OmitDeepWithOnePath<T, Path extends string | number> =
T extends NonRecursiveType
    ? T
    : T extends UnknownArray ? SetArrayAccess<OmitDeepArrayWithOnePath<T, Path>, IsArrayReadonly<T>>
        : T extends object ? OmitDeepObjectWithOnePath<T, Path>
            : T;
```

Omit one path from the given object.

``` typescript
type OmitDeepObjectWithOnePath<ObjectT extends object, P extends string | number> =
P extends `${infer RecordKeyInPath}.${infer SubPath}`
    ? {
        [Key in keyof ObjectT]:
        IsEqual<RecordKeyInPath, ToString<Key>> extends true
            ? ExactKey<ObjectT, Key> extends infer RealKey
                ? RealKey extends keyof ObjectT
                    ? OmitDeepWithOnePath<ObjectT[RealKey], SubPath>
                    : ObjectT[Key]
                : ObjectT[Key]
            : ObjectT[Key]
    }
    : ExactKey<ObjectT, P> extends infer Key
        ? IsNever<Key> extends true
            ? ObjectT
            : Key extends PropertyKey
                ? Omit<ObjectT, Key>
                : ObjectT
        : ObjectT;
```

Omit one path from from the given array.
It replaces the item to `unknown` at the given index.
@example

    type A = OmitDeepArrayWithOnePath<[10, 20, 30, 40], 2>;
    //=> type A = [10, 20, unknown, 40];

``` typescript
type OmitDeepArrayWithOnePath<ArrayType extends UnknownArray, P extends string | number> =
```

``` typescript
    P extends `${infer ArrayIndex extends number}.${infer SubPath}`
```

``` typescript
        ? number extends ArrayIndex
            ? Array<OmitDeepWithOnePath<NonNullable<ArrayType[number]>, SubPath>>
```

``` typescript
            : ArraySplice<ArrayType, ArrayIndex, 1, [OmitDeepWithOnePath<NonNullable<ArrayType[ArrayIndex]>, SubPath>]>
```

``` typescript
        : P extends `${infer ArrayIndex extends number}`
```

``` typescript
            ? number extends ArrayIndex
                ? []
```

``` typescript
                : ArraySplice<ArrayType, ArrayIndex, 1, [unknown]>
            : ArrayType;
```