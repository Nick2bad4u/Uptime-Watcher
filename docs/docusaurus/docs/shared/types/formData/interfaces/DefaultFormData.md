# Interface: DefaultFormData

Defined in: [shared/types/formData.ts:62](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/formData.ts#L62)

Interface for default form data values.

## Properties

### http

> `readonly` **http**: `object`

Defined in: [shared/types/formData.ts:64](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/formData.ts#L64)

Default values for HTTP monitors

#### checkInterval

> **checkInterval**: `number`

#### enabled

> **enabled**: `true`

#### expectedStatusCode

> **expectedStatusCode**: `number`

#### followRedirects

> **followRedirects**: `true`

#### method

> **method**: `"GET"`

#### retryAttempts

> **retryAttempts**: `number`

#### timeout

> **timeout**: `number`

#### type

> **type**: `"http"`

#### url

> **url**: `string`

***

### ping

> `readonly` **ping**: `object`

Defined in: [shared/types/formData.ts:76](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/formData.ts#L76)

Default values for ping monitors

#### checkInterval

> **checkInterval**: `number`

#### enabled

> **enabled**: `true`

#### host

> **host**: `string`

#### maxPacketLoss

> **maxPacketLoss**: `number`

#### packetCount

> **packetCount**: `number`

#### packetSize

> **packetSize**: `number`

#### retryAttempts

> **retryAttempts**: `number`

#### timeout

> **timeout**: `number`

#### type

> **type**: `"ping"`

***

### port

> `readonly` **port**: `object`

Defined in: [shared/types/formData.ts:88](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/formData.ts#L88)

Default values for port monitors

#### checkInterval

> **checkInterval**: `number`

#### connectionTimeout

> **connectionTimeout**: `number`

#### enabled

> **enabled**: `true`

#### host

> **host**: `string`

#### port

> **port**: `number`

#### retryAttempts

> **retryAttempts**: `number`

#### timeout

> **timeout**: `number`

#### type

> **type**: `"port"`
