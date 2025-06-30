# Implementing New Monitor Properties: A Complete Guide

This document provides a comprehensive guide for adding new properties to the Monitor interface in the Uptime Watcher application. It was created based on the implementation of the monitor-specific timeout feature and serves as a template for future enhancements.

## Overview

When adding a new property to monitors, you need to make changes across multiple layers of the application:

- **Frontend Types & Interfaces**
- **Backend Types & Interfaces**
- **Database Schema & Repository**
- **UI Components**
- **State Management**
- **Backend Services**

## Step-by-Step Implementation Guide

### 1. Frontend Type Definitions

**File:** `src/types.ts`

Add the new property to the Monitor interface:

```typescript
export interface Monitor {
 // ...existing properties...
 /** New property description */
 newProperty?: PropertyType;
}
```

**Key Points:**

- Use optional properties (`?`) unless the property is always required
- Add comprehensive JSDoc comments
- Follow the existing naming convention (camelCase)
- Place the property logically within the interface structure

### 2. Backend Type Definitions

**File:** `electron/types.ts`

Mirror the frontend Monitor interface:

```typescript
export interface Monitor {
 // ...existing properties...
 /** New property description */
 newProperty?: PropertyType;
}
```

**Important:** Keep frontend and backend Monitor interfaces synchronized to avoid type mismatches.

### 3. Database Schema Updates

**File:** Database migration or manual SQL

Add the column to the monitors table:

```sql
ALTER TABLE monitors ADD COLUMN newProperty INTEGER DEFAULT defaultValue;
```

**Notes:**

- Use appropriate SQLite data types (TEXT, INTEGER, REAL, BOOLEAN)
- Set reasonable default values
- Consider existing data and how it should be handled

### 4. Database Repository Updates

**File:** `electron/services/database/MonitorRepository.ts`

#### 4.1 Update the `create` method

```typescript
await db.run(
 `INSERT INTO monitors (site_identifier, type, url, host, port, checkInterval, timeout, newProperty, monitoring, status, responseTime, lastChecked) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
 [
  // ...existing parameters...
  monitor.newProperty !== undefined ? processValue(monitor.newProperty) : null,
  // ...remaining parameters...
 ]
);
```

#### 4.2 Update the `update` method

```typescript
if (monitor.newProperty !== undefined) {
 updateFields.push("newProperty = ?");
 updateValues.push(monitor.newProperty !== undefined ? processValue(monitor.newProperty) : null);
}
```

#### 4.3 Update the `rowToMonitor` method

```typescript
private rowToMonitor(row: Record<string, unknown>): Site["monitors"][0] {
    return {
        // ...existing properties...
        newProperty: typeof row.newProperty === "expectedType"
            ? row.newProperty
            : row.newProperty
              ? convertValue(row.newProperty)
              : undefined,
        // ...remaining properties...
    };
}
```

#### 4.4 Update `bulkCreate` method if needed

Add the new property to the bulk insert SQL and parameters array.

### 5. Store Actions (State Management)

**File:** `src/store.ts`

#### 5.1 Add new action to interface

```typescript
interface AppState {
 // ...existing actions...
 updateMonitorNewProperty: (siteId: string, monitorId: string, newProperty: PropertyType) => Promise<void>;
}
```

#### 5.2 Implement the action

```typescript
updateMonitorNewProperty: async (siteId: string, monitorId: string, newProperty: PropertyType) => {
    const state = get();
    state.clearError();
    try {
        const site = get().sites.find((s) => s.identifier === siteId);
        if (!site) throw new Error("Site not found");
        const updatedMonitors = site.monitors.map((monitor) =>
            monitor.id === monitorId ? { ...monitor, newProperty: newProperty } : monitor
        );
        await window.electronAPI.sites.updateSite(siteId, { monitors: updatedMonitors });
        await state.syncSitesFromBackend();
    } catch (error) {
        state.setError(`Failed to update monitor new property: ${(error as Error).message}`);
        throw error;
    }
},
```

### 6. UI Components

#### 6.1 Update Hook (useSiteDetails)

**File:** `src/hooks/site/useSiteDetails.ts`

Add local state management:

```typescript
// Local state for the new property
const [localNewProperty, setLocalNewProperty] = useState<PropertyType>(selectedMonitor?.newProperty ?? defaultValue);
const [newPropertyChanged, setNewPropertyChanged] = useState(false);

// Update effect
useEffect(() => {
 setLocalNewProperty(selectedMonitor?.newProperty ?? defaultValue);
 setNewPropertyChanged(false);
}, [selectedMonitor?.newProperty, selectedMonitor?.type, currentSite.identifier]);

// Change handler
const handleNewPropertyChange = useCallback(
 (e: React.ChangeEvent<HTMLInputElement>) => {
  setLocalNewProperty(convertInputValue(e.target.value));
  setNewPropertyChanged(convertInputValue(e.target.value) !== selectedMonitor?.newProperty);
 },
 [selectedMonitor?.newProperty]
);

// Save handler
const handleSaveNewProperty = useCallback(async () => {
 clearError();
 try {
  await updateMonitorNewProperty(currentSite.identifier, selectedMonitorId, localNewProperty);
  setNewPropertyChanged(false);
  logger.user.action("Updated monitor new property", {
   monitorId: selectedMonitorId,
   newValue: localNewProperty,
   siteId: currentSite.identifier,
  });
 } catch (error) {
  logger.site.error(currentSite.identifier, error instanceof Error ? error : String(error));
 }
}, [currentSite.identifier, selectedMonitorId, localNewProperty, updateMonitorNewProperty, clearError]);

// Return values
return {
 // ...existing values...
 localNewProperty,
 newPropertyChanged,
 handleNewPropertyChange,
 handleSaveNewProperty,
};
```

#### 6.2 Update Navigation Component

**File:** `src/components/SiteDetails/SiteDetailsNavigation.tsx`

Add props to interface:

```typescript
interface SiteDetailsNavigationProps {
 // ...existing props...
 localNewProperty: PropertyType;
 newPropertyChanged: boolean;
 handleNewPropertyChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
 handleSaveNewProperty: () => Promise<void>;
}
```

Add UI controls:

```tsx
{/* New Property control */}
<ThemedText variant="secondary" size="base">
    New Property:
</ThemedText>
<input
    type="appropriate-type"
    value={localNewProperty}
    onChange={handleNewPropertyChange}
    className="w-20 px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    disabled={isLoading}
    aria-label="Monitor new property description"
/>
{newPropertyChanged && (
    <ThemedButton variant="primary" size="sm" onClick={handleSaveNewProperty}>
        Save
    </ThemedButton>
)}
```

#### 6.3 Update Settings Tab

**File:** `src/components/SiteDetails/tabs/SettingsTab.tsx`

Add to props interface and create settings section similar to timeout configuration.

#### 6.4 Update Parent Component

**File:** `src/components/SiteDetails/SiteDetails.tsx`

Pass the new props to child components:

```tsx
<SiteDetailsNavigation
    // ...existing props...
    localNewProperty={localNewProperty}
    newPropertyChanged={newPropertyChanged}
    handleNewPropertyChange={handleNewPropertyChange}
    handleSaveNewProperty={handleSaveNewProperty}
/>

<SettingsTab
    // ...existing props...
    localNewProperty={localNewProperty}
    newPropertyChanged={newPropertyChanged}
    handleNewPropertyChange={handleNewPropertyChange}
    handleSaveNewProperty={handleSaveNewProperty}
/>
```

### 7. Backend Service Updates

#### 7.1 Monitoring Services

**Files:** `electron/services/monitoring/HttpMonitor.ts`, `electron/services/monitoring/PortMonitor.ts`

If the new property affects monitoring behavior, update the services:

```typescript
public async check(monitor: Site["monitors"][0]): Promise<MonitorCheckResult> {
    // Use monitor-specific property with fallback
    const newPropertyValue = monitor.newProperty ?? this.config.defaultNewProperty;

    // Apply the property in monitoring logic
    // ...
}
```

#### 7.2 Configuration Updates

**File:** `electron/services/monitoring/types.ts`

If needed, add to MonitorConfig interface:

```typescript
export interface MonitorConfig {
 // ...existing properties...
 defaultNewProperty?: PropertyType;
}
```

### 8. Constants and Validation

**File:** `src/constants.ts`

Add validation constraints if needed:

```typescript
export const NEW_PROPERTY_CONSTRAINTS = {
 MIN: minimumValue,
 MAX: maximumValue,
 STEP: stepValue,
} as const;
```

### 9. Testing Considerations

- **Database Migration:** Test with existing data
- **UI Validation:** Test edge cases and invalid inputs
- **State Management:** Test save/load/reset cycles
- **Backend Integration:** Test API calls and error handling
- **Cross-Component:** Test data flow between components

### 10. Common Pitfalls and Solutions

#### 10.1 Type Mismatches

**Problem:** Frontend and backend types drift apart
**Solution:** Use shared type definitions or strict synchronization

#### 10.2 Database Serialization

**Problem:** Complex types not properly stored/retrieved
**Solution:** Use proper serialization in repository methods

#### 10.3 State Reset Issues

**Problem:** Local state resets unexpectedly
**Solution:** Careful effect dependencies and reset logic

#### 10.4 Missing Repository Methods

**Problem:** CRUD operations don't handle new property
**Solution:** Systematically update create/read/update methods

#### 10.5 UI Prop Threading

**Problem:** Props not passed through component hierarchy
**Solution:** Follow the data flow systematically from hook to UI

#### 10.6 Unit Conversion Issues

**Problem:** UI shows different units than backend stores
**Solution:** Establish clear conversion points and document the data flow. For timeout: UI uses seconds, backend uses milliseconds, conversion happens only in the hook layer.

## Real-World Example: Timeout Property Implementation

The monitor-specific timeout feature was implemented following this exact pattern:

1. **Frontend types:** Added `timeout?: number` to Monitor interface
2. **Backend types:** Mirrored the frontend change
3. **Database:** Used existing timeout column with default 10000ms
4. **Repository:** Added timeout handling to create/update/read methods
5. **Store:** Added `updateMonitorTimeout` action
6. **Hook:** Added local timeout state and handlers (stores in seconds, converts to ms when saving)
7. **Navigation:** Added timeout input with validation (displays/accepts seconds)
8. **Settings:** Added timeout configuration section (displays/accepts seconds)
9. **Services:** Updated HttpMonitor and PortMonitor to use monitor timeout (uses ms)
10. **Constants:** Used existing TIMEOUT_CONSTRAINTS for validation (in seconds for UI)

### Key Data Flow Pattern

- **UI Layer:** Always works in seconds for user-friendly values
- **State Management:** Stores and displays seconds, converts to milliseconds only when saving to backend
- **Backend/Database:** Always stores and processes milliseconds
- **Conversion Points:** Only in `useSiteDetails` hook when saving/loading data

## Checklist for New Properties

- [ ] Frontend Monitor interface updated
- [ ] Backend Monitor interface updated
- [ ] Database schema updated (if needed)
- [ ] MonitorRepository create() method updated
- [ ] MonitorRepository update() method updated
- [ ] MonitorRepository rowToMonitor() method updated
- [ ] MonitorRepository bulkCreate() method updated (if applicable)
- [ ] Store action added
- [ ] useSiteDetails hook updated with local state
- [ ] useSiteDetails hook updated with handlers
- [ ] SiteDetailsNavigation props interface updated
- [ ] SiteDetailsNavigation UI controls added
- [ ] SettingsTab props interface updated
- [ ] SettingsTab UI section added
- [ ] SiteDetails parent component updated
- [ ] Monitoring services updated (if applicable)
- [ ] Constants/validation added (if applicable)
- [ ] Documentation updated
- [ ] Testing completed

## Future Improvements

- **Automated Synchronization:** Create tooling to keep frontend/backend types in sync
- **Code Generation:** Generate repository methods from interface changes
- **Migration Scripts:** Automate database schema updates
- **Testing Framework:** Create standard tests for new property implementations
- **Type Safety:** Use stricter typing to catch integration issues early

This guide ensures consistent, maintainable implementations of new monitor properties while following the established architecture patterns of the Uptime Watcher application.
