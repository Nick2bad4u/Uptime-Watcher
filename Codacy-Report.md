# Medium Code Complexity Report

---

## Methods Exceeding Cyclomatic Complexity Limit

| Severity | Type          | Location                                        | Line | Signature/Description                                              | Complexity (Limit) |
| -------- | ------------- | ----------------------------------------------- | ---- | ------------------------------------------------------------------ | ------------------ |
| MEDIUM   | Cyclomatic    | electron/services/ipc/validators.ts             | 105  | `IpcValidators.requiredString(params[1], secondParamName);`        | 19 (8)             |
| MEDIUM   | Lines of Code | electron/services/ipc/validators.ts             | 71   | `IpcValidators.requiredString`                                     | 71 (50)            |
| MEDIUM   | Cyclomatic    | src/components/Header/Header.tsx                | 50   | `useMemo(() => {`                                                  | 9 (8)              |
| MEDIUM   | Lines of Code | src/hooks/site/useSiteDetails.ts                | 538  | `handleSaveName = useCallback(async () => {`                       | 55 (50)            |
| MEDIUM   | Cyclomatic    | src/components/SiteDetails/useAddSiteForm.ts    | 151  | `isFormValid = useCallback(() => {`                                | 11 (8)             |
| MEDIUM   | Cyclomatic    | electron/events/eventTypes.ts                   | 1059 | `isEventOfCategory(eventName, category)`                           | 13 (8)             |
| MEDIUM   | Cyclomatic    | shared/types/database.ts                        | 209  | `isValidMonitorRow(obj: unknown): obj is MonitorRow`               | 9 (8)              |
| MEDIUM   | Cyclomatic    | src/utils/monitorValidation.ts                  | 218  | `() => {`                                                          | 9 (8)              |
| MEDIUM   | Cyclomatic    | electron/services/monitoring/MigrationSystem.ts | 408  | `validateVersionString(version: string, parameterName: string)`    | 11 (8)             |
| MEDIUM   | Cyclomatic    | electron/events/middleware.ts                   | 386  | `async (event: string, _data: unknown, next: () => Promise<void>)` | 9 (8)              |
| MEDIUM   | Lines of Code | src/theme/components.tsx                        | 1    | File                                                               | 951                |
| MEDIUM   | Cyclomatic    | electron/services/ipc/validators.ts             | 100  | `IpcValidators.requiredString(params[0], firstParamName);`         | 11 (8)             |
| MEDIUM   | Cyclomatic    | shared/utils/stringConversion.ts                | 51   | `safeStringify(value: unknown): string`                            | 9 (8)              |
| MEDIUM   | Cyclomatic    | electron/services/ipc/validators.ts             | 97   | `createTwoStringValidator(firstParamName, secondParamName)`        | 11 (8)             |
| MEDIUM   | Lines of Code | src/theme/utils/themeMerging.ts                 | 35   | `deepMergeTheme(baseTheme, overrides)`                             | 70 (50)            |
| MEDIUM   | Cyclomatic    | shared/types/database.ts                        | 181  | `isValidHistoryRow(obj: unknown): obj is HistoryRow`               | 12 (8)             |
| MEDIUM   | Lines of Code | src/components/SiteDetails/useAddSiteForm.ts    | 92   | `useAddSiteForm()`                                                 | 75 (50)            |

---

## Legend

- **Cyclomatic**: Cyclomatic complexity (number of independent paths through a function/method)
- **Lines of Code**: Total non-comment lines of code in method or file
- **Limit**: The maximum allowed by the code style/quality rules

---

> **Note:** Methods and files in this report exceed medium complexity thresholds and may benefit from refactoring for maintainability.
