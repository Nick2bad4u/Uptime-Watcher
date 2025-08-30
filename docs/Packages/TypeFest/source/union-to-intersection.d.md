Convert a union type to an intersection type using [distributive conditional types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html#distributive-conditional-types).
Inspired by [this Stack Overflow answer](https://stackoverflow.com/a/50375286/2172153).
@example

    import type {UnionToIntersection} from 'type-fest';
    type Union = {the(): void} | {great(arg: string): void} | {escape: boolean};
    type Intersection = UnionToIntersection<Union>;
    //=> {the(): void; great(arg: string): void; escape: boolean};

A more applicable example which could make its way into your library code follows.
@example

    import type {UnionToIntersection} from 'type-fest';
    class CommandOne {
        commands: {
            a1: () => undefined,
            b1: () => undefined,
        }
    }
    class CommandTwo {
        commands: {
            a2: (argA: string) => undefined,
            b2: (argB: string) => undefined,
        }
    }
    const union = [new CommandOne(), new CommandTwo()].map(instance => instance.commands);
    type Union = typeof union;
    //=> {a1(): void; b1(): void} | {a2(argA: string): void; b2(argB: string): void}
    type Intersection = UnionToIntersection<Union>;
    //=> {a1(): void; b1(): void; a2(argA: string): void; b2(argB: string): void}

@category Type

``` typescript
export type UnionToIntersection<Union> = (
```

``` typescript
    Union extends unknown
```

``` typescript
        ? (distributedUnion: Union) => void
```

``` typescript
        : never
```

``` typescript
) extends ((mergedIntersection: infer Intersection) => void)
```

``` typescript
    ? Intersection & Union
    : never;
```