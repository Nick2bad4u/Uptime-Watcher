# Uptime Watcher - Complete Documentation v22.5.0

## Hierarchy Summary

### AccessibilityProperties

- [AccessibilityProperties](shared/types/componentProps/interfaces/AccessibilityProperties.md)
    - [ThemedBoxProperties](src/theme/components/ThemedBox/interfaces/ThemedBoxProperties.md)
        - [SurfaceContainerProperties](src/components/shared/SurfaceContainer/interfaces/SurfaceContainerProperties.md)
    - [ThemedCheckboxProperties](src/theme/components/ThemedCheckbox/interfaces/ThemedCheckboxProperties.md)
    - [ThemedInputProperties](src/theme/components/ThemedInput/interfaces/ThemedInputProperties.md)
    - [ThemedSelectProperties](src/theme/components/ThemedSelect/interfaces/ThemedSelectProperties.md)
    - [ThemedSliderProperties](src/theme/components/ThemedSlider/interfaces/ThemedSliderProperties.md)
    - [ThemedTextProperties](src/theme/components/ThemedText/interfaces/ThemedTextProperties.md)
    - [StandardButtonProperties](shared/types/componentProps/interfaces/StandardButtonProperties.md)
    - [StandardInputProperties](shared/types/componentProps/interfaces/StandardInputProperties.md)
    - [StandardSelectProperties](shared/types/componentProps/interfaces/StandardSelectProperties.md)
    - [StandardCheckableProperties](shared/types/componentProps/interfaces/StandardCheckableProperties.md)
    - [StandardContainerProperties](shared/types/componentProps/interfaces/StandardContainerProperties.md)
    - [StandardModalProperties](shared/types/componentProps/interfaces/StandardModalProperties.md)
    - [StandardDataDisplayProperties](shared/types/componentProps/interfaces/StandardDataDisplayProperties.md)

---

### BaseCloudStorageProvider

- [BaseCloudStorageProvider](electron/services/cloud/providers/BaseCloudStorageProvider/classes/BaseCloudStorageProvider.md)
    - [FilesystemCloudStorageProvider](electron/services/cloud/providers/FilesystemCloudStorageProvider/classes/FilesystemCloudStorageProvider.md)
    - [DropboxCloudStorageProvider](electron/services/cloud/providers/dropbox/DropboxCloudStorageProvider/classes/DropboxCloudStorageProvider.md)
    - [GoogleDriveCloudStorageProvider](electron/services/cloud/providers/googleDrive/GoogleDriveCloudStorageProvider/classes/GoogleDriveCloudStorageProvider.md)

---

### BaseEventData

- [BaseEventData](shared/types/events/interfaces/BaseEventData.md)
    - [CacheInvalidatedEventData](shared/types/events/interfaces/CacheInvalidatedEventData.md)
    - [DatabaseConnectionEventData](shared/types/events/interfaces/DatabaseConnectionEventData.md)
    - [DatabaseErrorEventData](shared/types/events/interfaces/DatabaseErrorEventData.md)
    - [DatabaseRetryEventData](shared/types/events/interfaces/DatabaseRetryEventData.md)
    - [DatabaseSuccessEventData](shared/types/events/interfaces/DatabaseSuccessEventData.md)
    - [MonitorCheckCompletedEventData](shared/types/events/interfaces/MonitorCheckCompletedEventData.md)
    - [HistoryLimitUpdatedEventData](shared/types/events/interfaces/HistoryLimitUpdatedEventData.md)
    - [MonitoringControlEventData](shared/types/events/interfaces/MonitoringControlEventData.md)
    - [BaseStateSyncEventData](shared/types/events/interfaces/BaseStateSyncEventData.md)
        - [BulkStateSyncEventData](shared/types/events/interfaces/BulkStateSyncEventData.md)
        - [DeltaStateSyncEventData](shared/types/events/interfaces/DeltaStateSyncEventData.md)

---

### BaseFormData

- [BaseFormData](src/types/monitorFormData/interfaces/BaseFormData.md)
    - [HttpFormData](src/types/monitorFormData/interfaces/HttpFormData.md)
    - [HttpKeywordFormData](src/types/monitorFormData/interfaces/HttpKeywordFormData.md)
    - [HttpStatusFormData](src/types/monitorFormData/interfaces/HttpStatusFormData.md)
    - [HttpLatencyFormData](src/types/monitorFormData/interfaces/HttpLatencyFormData.md)
    - [PingFormData](src/types/monitorFormData/interfaces/PingFormData.md)
    - [PortFormData](src/types/monitorFormData/interfaces/PortFormData.md)
    - [DnsFormData](src/types/monitorFormData/interfaces/DnsFormData.md)
    - [SslFormData](src/types/monitorFormData/interfaces/SslFormData.md)
    - [CdnEdgeConsistencyFormData](src/types/monitorFormData/interfaces/CdnEdgeConsistencyFormData.md)
    - [WebsocketKeepaliveFormData](src/types/monitorFormData/interfaces/WebsocketKeepaliveFormData.md)

---

### BaseLogger

- [BaseLogger](shared/utils/logger/interfaces/interfaces/BaseLogger.md)
    - [ExtendedLogger](shared/utils/logger/interfaces/interfaces/ExtendedLogger.md)
        - [UnifiedLogger](shared/utils/logger/interfaces/interfaces/UnifiedLogger.md)
            - [LoggerInterface](src/components/AddSiteForm/Submit/interfaces/LoggerInterface.md)

---

### BaseRow

- [BaseRow](shared/types/database/interfaces/BaseRow.md)
    - [HistoryRow](shared/types/database/interfaces/HistoryRow.md)
    - [MonitorRow](shared/types/database/interfaces/MonitorRow.md)
    - [SettingsRow](shared/types/database/interfaces/SettingsRow.md)
    - [SiteRow](shared/types/database/interfaces/SiteRow.md)

---

### BaseSiteOperations

- [BaseSiteOperations](src/stores/sites/baseTypes/interfaces/BaseSiteOperations.md)
    - [SitesActions](src/stores/sites/types/interfaces/SitesActions.md)
    - [SiteOperationsActions](src/stores/sites/useSiteOperations/interfaces/SiteOperationsActions.md)

---

### BaseSiteState

- [BaseSiteState](src/stores/sites/baseTypes/interfaces/BaseSiteState.md)

---

### BaseSiteSubscriptions

- [BaseSiteSubscriptions](src/stores/sites/baseTypes/interfaces/BaseSiteSubscriptions.md)

---

### BaseSiteSync

- [BaseSiteSync](src/stores/sites/baseTypes/interfaces/BaseSiteSync.md)

---

### BaseValidationResult

- [BaseValidationResult](shared/types/validation/interfaces/BaseValidationResult.md)
    - [FormValidationResult](shared/types/validation/interfaces/FormValidationResult.md)
    - [MonitorConfigValidationResult](shared/types/validation/interfaces/MonitorConfigValidationResult.md)
    - [ThemeValidationResult](shared/types/validation/interfaces/ThemeValidationResult.md)
    - [ValidationResult](shared/types/validation/interfaces/ValidationResult.md)

---

### ChartDataPoint

- [ChartDataPoint](shared/types/chartConfig/interfaces/ChartDataPoint.md)
    - [UptimeChartDataPoint](shared/types/chartHybrid/interfaces/UptimeChartDataPoint.md)

---

### CloudEncryptionConfigBase

- [CloudEncryptionConfigBase](shared/types/cloudEncryption/interfaces/CloudEncryptionConfigBase.md)
    - [CloudEncryptionConfigNone](shared/types/cloudEncryption/interfaces/CloudEncryptionConfigNone.md)
    - [CloudEncryptionConfigPassphrase](shared/types/cloudEncryption/interfaces/CloudEncryptionConfigPassphrase.md)

---

### CloudStorageProvider

- [CloudStorageProvider](electron/services/cloud/providers/CloudStorageProvider.types/interfaces/CloudStorageProvider.md)
    - [EncryptedSyncCloudStorageProvider](electron/services/cloud/providers/EncryptedSyncCloudStorageProvider/classes/EncryptedSyncCloudStorageProvider.md)

---

### CloudSyncTransport

- [CloudSyncTransport](electron/services/sync/CloudSyncTransport.types/interfaces/CloudSyncTransport.md)
    - [ProviderCloudSyncTransport](electron/services/sync/ProviderCloudSyncTransport/classes/ProviderCloudSyncTransport.md)

---

### CoreComponentProperties

- [CoreComponentProperties](shared/types/componentProps/interfaces/CoreComponentProperties.md)
    - [HistoryChartProperties](src/components/common/HistoryChart/interfaces/HistoryChartProperties.md)

    - [StatusBadgeProperties](src/components/common/StatusBadge/interfaces/StatusBadgeProperties.md)

    - [FormErrorAlertProperties](src/components/shared/FormErrorAlert/interfaces/FormErrorAlertProperties.md)

    - [SettingItemProperties](src/components/shared/SettingItem/interfaces/SettingItemProperties.md)

    - [MiniChartBarProperties](src/theme/components/MiniChartBar/interfaces/MiniChartBarProperties.md)

    - [StatusIndicatorProperties](src/theme/components/StatusIndicator/interfaces/StatusIndicatorProperties.md)

    - [ThemedBadgeProperties](src/theme/components/ThemedBadge/interfaces/ThemedBadgeProperties.md)

    - [ThemedCardProperties](src/theme/components/ThemedCard/interfaces/ThemedCardProperties.md)

    - [ThemedIconButtonProperties](src/theme/components/ThemedIconButton/interfaces/ThemedIconButtonProperties.md)

    - [ThemedProgressProperties](src/theme/components/ThemedProgress/interfaces/ThemedProgressProperties.md)

    - [ThemedTooltipProperties](src/theme/components/ThemedTooltip/interfaces/ThemedTooltipProperties.md)

    - [ErrorAlertProperties](src/components/common/ErrorAlert/ErrorAlert/interfaces/ErrorAlertProperties.md)

    - [SiteMonitoringButtonProperties](src/components/common/SiteMonitoringButton/SiteMonitoringButton/interfaces/SiteMonitoringButtonProperties.md)

---

### DomIdentityProperties

- [DomIdentityProperties](shared/types/componentProps/interfaces/DomIdentityProperties.md)

---

### EnhancedMonitoringDependencies

- [EnhancedMonitoringDependencies](electron/services/monitoring/EnhancedMonitoringDependencies/interfaces/EnhancedMonitoringDependencies.md)
    - [EnhancedMonitorCheckConfig](electron/services/monitoring/EnhancedMonitorChecker/interfaces/EnhancedMonitorCheckConfig.md)

---

### FormFieldBaseProperties

- [FormFieldBaseProperties](shared/types/componentProps/interfaces/FormFieldBaseProperties.md)
    - [BaseFormFieldProperties](src/components/AddSiteForm/BaseFormField/interfaces/BaseFormFieldProperties.md)
    - [FormFieldProperties](src/components/AddSiteForm/FormField/interfaces/FormFieldProperties.md)
    - [StringFieldPropsBase](src/components/AddSiteForm/fields/fieldFactories/interfaces/StringFieldPropsBase.md)
        - [TextFieldProperties](src/components/AddSiteForm/TextField/interfaces/TextFieldProperties.md)

---

### HttpMonitorSchemaBaseArgs

- [HttpMonitorSchemaBaseArgs](shared/validation/monitorSchemas.http/interfaces/HttpMonitorSchemaBaseArgs.md)
    - [HttpHeaderMonitorSchemaArgs](shared/validation/monitorSchemas.http/interfaces/HttpHeaderMonitorSchemaArgs.md)
    - [HttpJsonMonitorSchemaArgs](shared/validation/monitorSchemas.http/interfaces/HttpJsonMonitorSchemaArgs.md)

---

### IconProperties

- [IconProperties](shared/types/componentProps/interfaces/IconProperties.md)

---

### IDatabaseCommand

- [IDatabaseCommand](electron/services/commands/DatabaseCommands/interfaces/IDatabaseCommand.md)
    - [DatabaseCommand](electron/services/commands/DatabaseCommands/classes/DatabaseCommand.md)
        - [DownloadBackupCommand](electron/services/commands/DatabaseCommands/classes/DownloadBackupCommand.md)
        - [SaveBackupToPathCommand](electron/services/commands/DatabaseCommands/classes/SaveBackupToPathCommand.md)
        - [ExportDataCommand](electron/services/commands/DatabaseCommands/classes/ExportDataCommand.md)
        - [ImportDataCommand](electron/services/commands/DatabaseCommands/classes/ImportDataCommand.md)
        - [RestoreBackupCommand](electron/services/commands/DatabaseCommands/classes/RestoreBackupCommand.md)
        - [LoadSitesCommand](electron/services/commands/DatabaseCommands/classes/LoadSitesCommand.md)

---

### IMonitorService

- [IMonitorService](electron/services/monitoring/types/interfaces/IMonitorService.md)
    - [CdnEdgeConsistencyMonitor](electron/services/monitoring/CdnEdgeConsistencyMonitor/classes/CdnEdgeConsistencyMonitor.md)
    - [DnsMonitor](electron/services/monitoring/DnsMonitor/classes/DnsMonitor.md)
    - [MonitorServiceAdapterBase](electron/services/monitoring/shared/monitorServiceAdapterBase/classes/MonitorServiceAdapterBase.md)
    - [PingMonitor](electron/services/monitoring/PingMonitor/classes/PingMonitor.md)
    - [PortMonitor](electron/services/monitoring/PortMonitor/classes/PortMonitor.md)
    - [SslMonitor](electron/services/monitoring/SslMonitor/classes/SslMonitor.md)
    - [WebsocketKeepaliveMonitor](electron/services/monitoring/WebsocketKeepaliveMonitor/classes/WebsocketKeepaliveMonitor.md)

---

### MonitoringOperationSummary

- [MonitoringOperationSummary](shared/types/interfaces/MonitoringOperationSummary.md)
    - [MonitoringStartSummary](shared/types/interfaces/MonitoringStartSummary.md)
    - [MonitoringStopSummary](shared/types/interfaces/MonitoringStopSummary.md)

---

### MonitorValidationFieldValuesBase

- [MonitorValidationFieldValuesBase](src/utils/monitorValidationFields/interfaces/MonitorValidationFieldValuesBase.md)
    - [MonitorValidationFieldValues](src/utils/monitorValidationFields/interfaces/MonitorValidationFieldValues.md)
    - [MonitorValidationFieldValuesInput](src/utils/monitorValidationFields/interfaces/MonitorValidationFieldValuesInput.md)

---

### SecretStore

- [SecretStore](electron/services/cloud/secrets/SecretStore/interfaces/SecretStore.md)
    - [EphemeralSecretStore](electron/services/cloud/secrets/SecretStore/classes/EphemeralSecretStore.md)
    - [FallbackSecretStore](electron/services/cloud/secrets/SecretStore/classes/FallbackSecretStore.md)
    - [SafeStorageSecretStore](electron/services/cloud/secrets/SecretStore/classes/SafeStorageSecretStore.md)

---

### SiteActionsResult

- [SiteActionsResult](src/hooks/site/useSiteActions/interfaces/SiteActionsResult.md)
    - [UseSiteResult](src/hooks/site/useSite/interfaces/UseSiteResult.md)

---

### SiteMonitorResult

- [SiteMonitorResult](src/hooks/site/useSiteMonitor/interfaces/SiteMonitorResult.md)

---

### SiteSnapshotDetails

- [SiteSnapshotDetails](shared/utils/siteSnapshots/interfaces/SiteSnapshotDetails.md)
    - [SiteSyncSnapshotDetails](shared/utils/siteSnapshots/interfaces/SiteSyncSnapshotDetails.md)

---

### SiteStats

- [SiteStats](src/hooks/site/useSiteStats/interfaces/SiteStats.md)

---

### StateProperties

- [StateProperties](shared/types/componentProps/interfaces/StateProperties.md)

---

### StylingProperties

- [StylingProperties](shared/types/componentProps/interfaces/StylingProperties.md)

---

### TypedEventBus

- [TypedEventBus](electron/events/TypedEventBus/classes/TypedEventBus.md)
    - [UptimeOrchestrator](electron/UptimeOrchestrator/classes/UptimeOrchestrator.md)

---
