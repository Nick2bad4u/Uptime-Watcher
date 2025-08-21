# Function: getSiteById()

> **getSiteById**(`siteId`, `deps`): [`Site`](../../../../../../shared/types/interfaces/Site.md)

Defined in: [src/stores/sites/utils/operationHelpers.ts:27](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/utils/operationHelpers.ts#L27)

Gets a site by ID and validates it exists. Common pattern used across
multiple site operations.

## Parameters

### siteId

`string`

The site identifier

### deps

[`SiteOperationsDependencies`](../../../types/interfaces/SiteOperationsDependencies.md)

Site operation dependencies

## Returns

[`Site`](../../../../../../shared/types/interfaces/Site.md)

The found site

## Throws

Error if site is not found
