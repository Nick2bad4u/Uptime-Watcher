# Function: getEnvVar()

> **getEnvVar**\<`K`\>(`key`): `undefined` \| `KnownEnvironmentVariables`\[`K`\]

Defined in: [shared/utils/environment.ts:28](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/utils/environment.ts#L28)

Type-safe environment variable access utility. Avoids index signature issues
with process.env.

## Type Parameters

### K

`K` *extends* keyof `KnownEnvironmentVariables`

## Parameters

### key

`K`

The environment variable key to access

## Returns

`undefined` \| `KnownEnvironmentVariables`\[`K`\]

The environment variable value or undefined
