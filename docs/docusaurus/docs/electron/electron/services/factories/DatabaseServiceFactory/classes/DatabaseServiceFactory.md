# Class: DatabaseServiceFactory

Defined in: [electron/services/factories/DatabaseServiceFactory.ts:89](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/factories/DatabaseServiceFactory.ts#L89)

Factory for creating database-related services with proper dependency injection.

## Remarks

Centralizes service creation to resolve Dependency Inversion Principle violations. All services are created with proper abstractions and dependency injection. This class is the single entry point for constructing all database-related services in the backend.

## Constructors

### Constructor

> **new DatabaseServiceFactory**(`dependencies`): `DatabaseServiceFactory`

Defined in: [electron/services/factories/DatabaseServiceFactory.ts:101](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/factories/DatabaseServiceFactory.ts#L101)

Constructs a new DatabaseServiceFactory instance.

#### Parameters

##### dependencies

[`DatabaseServiceFactoryDependencies`](../interfaces/DatabaseServiceFactoryDependencies.md)

The [DatabaseServiceFactoryDependencies](../interfaces/DatabaseServiceFactoryDependencies.md) required for service creation.

#### Returns

`DatabaseServiceFactory`

#### Remarks

Initializes the factory with all required dependencies and sets up a logger adapter for use by created services.

## Methods

### createBackupService()

> **createBackupService**(): [`IDataBackupService`](../interfaces/IDataBackupService.md)

Defined in: [electron/services/factories/DatabaseServiceFactory.ts:114](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/factories/DatabaseServiceFactory.ts#L114)

Creates a data backup service instance.

#### Returns

[`IDataBackupService`](../interfaces/IDataBackupService.md)

Data backup service implementation.

#### Remarks

Returns a new [DataBackupService](../../../../utils/database/DataBackupService/classes/DataBackupService.md) with injected dependencies for backup operations.

***

### createImportExportService()

> **createImportExportService**(): [`IDataImportExportService`](../interfaces/IDataImportExportService.md)

Defined in: [electron/services/factories/DatabaseServiceFactory.ts:129](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/factories/DatabaseServiceFactory.ts#L129)

Creates a data import/export service instance.

#### Returns

[`IDataImportExportService`](../interfaces/IDataImportExportService.md)

Data import/export service implementation.

#### Remarks

Returns a new [DataImportExportService](../../../../utils/database/DataImportExportService/classes/DataImportExportService.md) with injected dependencies for import/export operations.

***

### createSiteRepositoryService()

> **createSiteRepositoryService**(): [`SiteRepositoryService`](../../../../utils/database/SiteRepositoryService/classes/SiteRepositoryService.md)

Defined in: [electron/services/factories/DatabaseServiceFactory.ts:146](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/factories/DatabaseServiceFactory.ts#L146)

Creates a site repository service instance.

#### Returns

[`SiteRepositoryService`](../../../../utils/database/SiteRepositoryService/classes/SiteRepositoryService.md)

Site repository service implementation.

#### Remarks

Returns a new [SiteRepositoryService](../../../../utils/database/SiteRepositoryService/classes/SiteRepositoryService.md) with injected dependencies for site repository operations.
