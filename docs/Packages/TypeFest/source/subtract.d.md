``` typescript
import type {NumberAbsolute, BuildTuple, ReverseSign} from './internal/index.d.ts';
import type {PositiveInfinity, NegativeInfinity, IsNegative} from './numeric.d.ts';
import type {LessThan} from './less-than.d.ts';
```

Returns the difference between two numbers.
Note:

- A or B can only support `-999` ~ `999`.
  @example

<!-- -->

    import type {Subtract} from 'type-fest';
    Subtract<333, 222>;
    //=> 111
    Subtract<111, -222>;
    //=> 333
    Subtract<-111, 222>;
    //=> -333
    Subtract<18, 96>;
    //=> -78
    Subtract<PositiveInfinity, 9999>;
    //=> PositiveInfinity
    Subtract<PositiveInfinity, PositiveInfinity>;
    //=> number

@category Numeric

``` typescript
export type Subtract<A extends number, B extends number> =
```

``` typescript
    number extends A | B ? number
```

``` typescript
        : A extends B & (PositiveInfinity | NegativeInfinity) ? number
```

``` typescript
            : A extends NegativeInfinity ? NegativeInfinity : B extends PositiveInfinity ? NegativeInfinity
```

``` typescript
                : A extends PositiveInfinity ? PositiveInfinity : B extends NegativeInfinity ? PositiveInfinity
```

``` typescript
                    : A extends B ? 0
```

``` typescript
                        : A extends 0 ? ReverseSign<B> : B extends 0 ? A
```

``` typescript
                            : SubtractPostChecks<A, B>;
```

Subtracts two numbers A and B, such that they are not equal and neither of them are 0, +/- infinity or the `number` type

``` typescript
type SubtractPostChecks<A extends number, B extends number, AreNegative = [IsNegative<A>, IsNegative<B>]> =
    AreNegative extends [false, false]
        ? SubtractPositives<A, B>
        : AreNegative extends [true, true]
```

``` typescript
            ? ReverseSign<SubtractPositives<NumberAbsolute<A>, NumberAbsolute<B>>>
```

``` typescript
            : [...BuildTuple<NumberAbsolute<A>>, ...BuildTuple<NumberAbsolute<B>>] extends infer R extends unknown[]
                ? LessThan<A, B> extends true ? ReverseSign<R['length']> : R['length']
                : never;
```

Subtracts two positive numbers.

``` typescript
type SubtractPositives<A extends number, B extends number> =
    LessThan<A, B> extends true
```

``` typescript
        ? ReverseSign<SubtractIfAGreaterThanB<B, A>>
        : SubtractIfAGreaterThanB<A, B>;
```

Subtracts two positive numbers A and B such that A \> B.

``` typescript
type SubtractIfAGreaterThanB<A extends number, B extends number> =
```

``` typescript
    BuildTuple<A> extends [...BuildTuple<B>, ...infer R]
        ? R['length']
        : never;
```