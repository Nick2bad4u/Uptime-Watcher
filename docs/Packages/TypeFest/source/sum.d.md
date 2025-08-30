``` typescript
import type {NumberAbsolute, BuildTuple, TupleMax, ReverseSign} from './internal/index.d.ts';
import type {PositiveInfinity, NegativeInfinity, IsNegative} from './numeric.d.ts';
import type {Subtract} from './subtract.d.ts';
```

Returns the sum of two numbers.
Note:

- A or B can only support `-999` ~ `999`.
  @example

<!-- -->

    import type {Sum} from 'type-fest';
    Sum<111, 222>;
    //=> 333
    Sum<-111, 222>;
    //=> 111
    Sum<111, -222>;
    //=> -111
    Sum<PositiveInfinity, -9999>;
    //=> PositiveInfinity
    Sum<PositiveInfinity, NegativeInfinity>;
    //=> number

@category Numeric

``` typescript
export type Sum<A extends number, B extends number> =
```

``` typescript
    number extends A | B ? number
```

``` typescript
        : A extends B & (PositiveInfinity | NegativeInfinity) ? A // A or B could be used here as they are equal
```

``` typescript
            : A | B extends PositiveInfinity | NegativeInfinity ? number
```

``` typescript
                : A extends PositiveInfinity | NegativeInfinity ? A
```

``` typescript
                    : B extends PositiveInfinity | NegativeInfinity ? B
```

``` typescript
                        : A extends 0 ? B : B extends 0 ? A : A extends ReverseSign<B> ? 0
```

``` typescript
                            : SumPostChecks<A, B>;
```

Adds two numbers A and B, such that they are not equal with different signs and neither of them are 0, +/- infinity or the `number` type

``` typescript
type SumPostChecks<A extends number, B extends number, AreNegative = [IsNegative<A>, IsNegative<B>]> =
    AreNegative extends [false, false]
```

``` typescript
        ? SumPositives<A, B>
        : AreNegative extends [true, true]
```

``` typescript
            ? ReverseSign<SumPositives<NumberAbsolute<A>, NumberAbsolute<B>>>
```

``` typescript
            : NumberAbsolute<Subtract<NumberAbsolute<A>, NumberAbsolute<B>>> extends infer Result extends number
                ? TupleMax<[NumberAbsolute<A>, NumberAbsolute<B>]> extends infer Max_ extends number
                    ? Max_ extends A | B
```

``` typescript
                        ? Result
```

``` typescript
                        : ReverseSign<Result>
                    : never
                : never;
```

Adds two positive numbers.

``` typescript
type SumPositives<A extends number, B extends number> =
    [...BuildTuple<A>, ...BuildTuple<B>]['length'] extends infer Result extends number
        ? Result
        : never;
```