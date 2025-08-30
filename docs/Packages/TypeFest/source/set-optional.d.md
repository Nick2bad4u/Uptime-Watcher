``` typescript
import type {Except} from './except.d.ts';
import type {HomomorphicPick} from './internal/index.d.ts';
import type {Simplify} from './simplify.d.ts';
```

Create a type that makes the given keys optional. The remaining keys are kept as is. The sister of the `SetRequired` type.
Use-case: You want to define a single model where the only thing that changes is whether or not some of the keys are optional.
@example

    import type {SetOptional} from 'type-fest';
    type Foo = {
        a: number;
        b?: string;
        c: boolean;
    }
    type SomeOptional = SetOptional<Foo, 'b' | 'c'>;
    // type SomeOptional = {
    //  a: number;
    //  b?: string; // Was already optional and still is.
    //  c?: boolean; // Is now optional.
    // }

@category Object

``` typescript
export type SetOptional<BaseType, Keys extends keyof BaseType> =
    (BaseType extends (...arguments_: never) => any
        ? (...arguments_: Parameters<BaseType>) => ReturnType<BaseType>
        : unknown)
    & _SetOptional<BaseType, Keys>;
```

``` typescript
type _SetOptional<BaseType, Keys extends keyof BaseType> =
    BaseType extends unknown // To distribute `BaseType` when it's a union type.
        ? Simplify<
```

``` typescript
            Except<BaseType, Keys> &
```

``` typescript
            Partial<HomomorphicPick<BaseType, Keys>>
        >
        : never;
```