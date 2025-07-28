# Function: getEnvVar()

> **getEnvVar**\<`K`\>(`key`): `undefined` \| `KnownEnvironmentVariables`\[`K`\]

Defined in: [shared/utils/environment.ts:41](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/utils/environment.ts#L41)

Type-safe environment variable access utility.
Avoids index signature issues with process.env.

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
