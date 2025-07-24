# Interface: SiteRepositoryDependencies

Defined in: [electron/services/database/SiteRepository.ts:18](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/database/SiteRepository.ts#L18)

Repository for managing site data persistence.
Handles CRUD operations for sites in the database.

## Remarks

**Data Consistency Standards:**
- Site names: Default to "Unnamed Site" when null/undefined for consistency
- Monitoring: Default to true (1) when undefined for safety
- All operations maintain referential integrity within transactions

## Properties

### databaseService

> **databaseService**: [`DatabaseService`](../../DatabaseService/classes/DatabaseService.md)

Defined in: [electron/services/database/SiteRepository.ts:19](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/database/SiteRepository.ts#L19)
