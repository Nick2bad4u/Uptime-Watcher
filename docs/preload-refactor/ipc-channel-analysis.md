# IPC Channel Analysis Report

Total channels found: 24
Domains: data, monitoring, sites, monitorTypes, stateSync, system

## Data Domain (6 channels)

### `export-data`

- **Method**: `exportData`
- **Parameters**: No
- **Validator**: DataHandlerValidators.exportData
- **Return Type**: `string`
- **Handler**: `async () => this.uptimeOrchestrator.exportData()...`

### `import-data`

- **Method**: `importData`
- **Parameters**: Yes
- **Validator**: DataHandlerValidators.importData
- **Return Type**: `string`
- **Handler**: `async (...args: unknown[]) =>
              this...`

### `update-history-limit`

- **Method**: `updateHistoryLimit`
- **Parameters**: Yes
- **Validator**: DataHandlerValidators.updateHistoryLimit
- **Return Type**: `number`
- **Handler**: `async (...args: unknown[]) =>
              this...`

### `get-history-limit`

- **Method**: `getHistoryLimit`
- **Parameters**: No
- **Validator**: DataHandlerValidators.getHistoryLimit
- **Return Type**: `number`
- **Handler**: `() => this.uptimeOrchestrator.getHistoryLimit()...`

### `reset-settings`

- **Method**: `resetSettings`
- **Parameters**: No
- **Validator**: DataHandlerValidators.resetSettings
- **Return Type**: `unknown`
- **Handler**: `async () => this.uptimeOrchestrator.resetSettings(...`

### `download-sqlite-backup`

- **Method**: `downloadSqliteBackup`
- **Parameters**: No
- **Validator**: result.buffer
- **Return Type**: `unknown`
- **Handler**: `async () => {
              const result = await...`

## Monitoring Domain (6 channels)

### `start-monitoring`

- **Method**: `startMonitoring`
- **Parameters**: No
- **Validator**: MonitoringHandlerValidators.startMonitoring
- **Return Type**: `boolean`
- **Handler**: `async () => {
              await this.uptimeOrc...`

### `stop-monitoring`

- **Method**: `stopMonitoring`
- **Parameters**: No
- **Validator**: MonitoringHandlerValidators.stopMonitoring
- **Return Type**: `boolean`
- **Handler**: `async () => {
              await this.uptimeOrc...`

### `format-monitor-detail`

- **Method**: `formatMonitorDetail`
- **Parameters**: Yes
- **Validator**: config.uiConfig
- **Return Type**: `unknown`
- **Handler**: `(...args: unknown[]) => {
              const mo...`

### `format-monitor-title-suffix`

- **Method**: `formatMonitorTitleSuffix`
- **Parameters**: Yes
- **Validator**: config.uiConfig
- **Return Type**: `unknown`
- **Handler**: `(...args: unknown[]) => {
              const mo...`

### `validate-monitor-data`

- **Method**: `validateMonitorData`
- **Parameters**: Yes
- **Validator**: data] = args as [string
- **Return Type**: `unknown`
- **Handler**: `(...args: unknown[]) => {
              const [m...`

### `remove-monitor`

- **Method**: `removeMonitor`
- **Parameters**: Yes
- **Validator**: `args[1] as string`
  )
- **Return Type**: `unknown`
- **Handler**: `async (...args: unknown[]) =>
              this...`

## Sites Domain (8 channels)

### `start-monitoring-for-site`

- **Method**: `startMonitoringForSite`
- **Parameters**: Yes
- **Validator**: monitorId
  );
  }
- **Return Type**: `Site`
- **Handler**: `async (...args: unknown[]) => {
              co...`

### `stop-monitoring-for-site`

- **Method**: `stopMonitoringForSite`
- **Parameters**: Yes
- **Validator**: monitorId
  );
  }
- **Return Type**: `Site`
- **Handler**: `async (...args: unknown[]) => {
              co...`

### `check-site-now`

- **Method**: `checkSiteNow`
- **Parameters**: Yes
- **Validator**: monitorId
  );
  }
- **Return Type**: `Site`
- **Handler**: `async (...args: unknown[]) => {
              co...`

### `add-site`

- **Method**: `addSite`
- **Parameters**: Yes
- **Validator**: SiteHandlerValidators.addSite
- **Return Type**: `Site`
- **Handler**: `async (...args: unknown[]) =>
              this...`

### `delete-all-sites`

- **Method**: `deleteAllSites`
- **Parameters**: No
- **Validator**: deleted ${result} sites`
  );
  return result;
  }
- **Return Type**: `Site`
- **Handler**: `async () => {
              logger.info("delete-...`

### `remove-site`

- **Method**: `removeSite`
- **Parameters**: Yes
- **Validator**: SiteHandlerValidators.removeSite
- **Return Type**: `Site`
- **Handler**: `async (...args: unknown[]) =>
              this...`

### `get-sites`

- **Method**: `getSites`
- **Parameters**: No
- **Validator**: SiteHandlerValidators.getSites
- **Return Type**: `Site[]`
- **Handler**: `async () => this.uptimeOrchestrator.getSites()...`

### `update-site`

- **Method**: `updateSite`
- **Parameters**: Yes
- **Validator**: `args[1] as Partial<Site>`
  )
- **Return Type**: `Site`
- **Handler**: `async (...args: unknown[]) =>
              this...`

## MonitorTypes Domain (1 channels)

### `get-monitor-types`

- **Method**: `getMonitorTypes`
- **Parameters**: No
- **Validator**: MonitorTypeHandlerValidators.getMonitorTypes
- **Return Type**: `unknown`
- **Handler**: `() => {
              // Get all monitor type co...`

## StateSync Domain (2 channels)

### `request-full-sync`

- **Method**: `requestFullSync`
- **Parameters**: No
- **Validator**: {
  action: "bulk-sync"
- **Return Type**: `Site[]`
- **Handler**: `async () => {
              // Get all sites and...`

### `get-sync-status`

- **Method**: `getSyncStatus`
- **Parameters**: No
- **Validator**: sites.length
- **Return Type**: `Site[]`
- **Handler**: `async () => {
              const sites = await ...`

## System Domain (1 channels)

### `open-external`

- **Method**: `openExternal`
- **Parameters**: Yes
- **Validator**: SystemHandlerValidators.openExternal
- **Return Type**: `boolean`
- **Handler**: `async (...args: unknown[]) => {
              //...`
