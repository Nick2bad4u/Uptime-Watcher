# Function: createTemplateLogger()

> **createTemplateLogger**(`baseLogger`): `object`

Defined in: [shared/utils/logTemplates.ts:447](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/utils/logTemplates.ts#L447)

Enhanced logger wrapper that supports template interpolation.

## Parameters

### baseLogger

`Logger`

## Returns

`object`

### debug()

> **debug**: (`message`, `variables?`) => `void`

#### Parameters

##### message

`string`

##### variables?

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string` \| `number`\>

#### Returns

`void`

### error()

> **error**: (`message`, `variables?`) => `void`

#### Parameters

##### message

`string`

##### variables?

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string` \| `number`\>

#### Returns

`void`

### info()

> **info**: (`message`, `variables?`) => `void`

#### Parameters

##### message

`string`

##### variables?

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string` \| `number`\>

#### Returns

`void`

### warn()

> **warn**: (`message`, `variables?`) => `void`

#### Parameters

##### message

`string`

##### variables?

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string` \| `number`\>

#### Returns

`void`

## Example

```typescript
import { createTemplateLogger } from "@shared/utils/logTemplates";

const logger = createTemplateLogger(baseLogger);

// Use with templates
logger.info(LOG_TEMPLATES.services.SITE_MANAGER_INITIALIZED, {
    count: 42,
});

// Use normally for dynamic content
logger.debug(`Processing site ${siteId} with custom logic`);
```
