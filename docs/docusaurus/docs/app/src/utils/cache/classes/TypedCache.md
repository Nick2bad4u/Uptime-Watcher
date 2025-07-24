# Class: TypedCache\<K, V\>

Defined in: [src/utils/cache.ts:22](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/utils/cache.ts#L22)

Generic cache implementation with TTL support.

## Type Parameters

### K

`K`

### V

`V`

## Constructors

### Constructor

> **new TypedCache**\<`K`, `V`\>(`options`): `TypedCache`\<`K`, `V`\>

Defined in: [src/utils/cache.ts:34](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/utils/cache.ts#L34)

#### Parameters

##### options

[`CacheOptions`](../interfaces/CacheOptions.md) = `{}`

#### Returns

`TypedCache`\<`K`, `V`\>

## Accessors

### size

#### Get Signature

> **get** **size**(): `number`

Defined in: [src/utils/cache.ts:26](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/utils/cache.ts#L26)

Get cache size.

##### Returns

`number`

## Methods

### cleanup()

> **cleanup**(): `void`

Defined in: [src/utils/cache.ts:42](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/utils/cache.ts#L42)

Clean up expired entries.

#### Returns

`void`

***

### clear()

> **clear**(): `void`

Defined in: [src/utils/cache.ts:55](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/utils/cache.ts#L55)

Clear all cached entries.

#### Returns

`void`

***

### delete()

> **delete**(`key`): `boolean`

Defined in: [src/utils/cache.ts:62](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/utils/cache.ts#L62)

Delete specific key.

#### Parameters

##### key

`K`

#### Returns

`boolean`

***

### get()

> **get**(`key`): `undefined` \| `V`

Defined in: [src/utils/cache.ts:69](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/utils/cache.ts#L69)

Get value from cache if not expired.

#### Parameters

##### key

`K`

#### Returns

`undefined` \| `V`

***

### has()

> **has**(`key`): `boolean`

Defined in: [src/utils/cache.ts:88](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/utils/cache.ts#L88)

Check if key exists and is not expired.

#### Parameters

##### key

`K`

#### Returns

`boolean`

***

### set()

> **set**(`key`, `value`, `ttl?`): `void`

Defined in: [src/utils/cache.ts:95](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/utils/cache.ts#L95)

Set value in cache with optional TTL.

#### Parameters

##### key

`K`

##### value

`V`

##### ttl?

`number`

#### Returns

`void`
