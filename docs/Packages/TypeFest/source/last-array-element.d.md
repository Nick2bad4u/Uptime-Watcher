Extracts the type of the last element of an array.
Use-case: Defining the return type of functions that extract the last element of an array, for example [`lodash.last`](https://lodash.com/docs/4.17.15#last).
@example

    import type {LastArrayElement} from 'type-fest';
    declare function lastOf<V extends readonly any[]>(array: V): LastArrayElement<V>;
    const array = ['foo', 2];
    typeof lastOf(array);
    //=> number
    const array = ['foo', 2] as const;
    typeof lastOf(array);
    //=> 2

@category Array
@category Template literal

``` typescript
export type LastArrayElement<Elements extends readonly unknown[], ElementBeforeTailingSpreadElement = never> =
```

``` typescript
    Elements extends readonly []
        ? ElementBeforeTailingSpreadElement
        : Elements extends readonly [...infer U, infer V]
            ? V
            : Elements extends readonly [infer U, ...infer V]
```

``` typescript
                ? LastArrayElement<V, U>
                : Elements extends ReadonlyArray<infer U>
                    ? U | ElementBeforeTailingSpreadElement
                    : never;
```