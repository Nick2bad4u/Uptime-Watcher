# Monitor Type Migration System - Implementation Plan
<!-- markdownlint-disable -->
## 📋 **Current State**
The `migrateMonitorType` function currently has a TODO to implement actual migration logic:

```typescript
// TODO: Implement actual migration logic when needed
// For now, return success for same version or simple version bumps
```

## 🎯 **Migration System Goals**

### **1. Version Management**
- Track monitor type versions in database
- Support semantic versioning (e.g., "1.0.0", "1.1.0", "2.0.0")
- Handle version compatibility checks
- Support backward compatibility where possible

### **2. Data Transformation**
- Transform monitor data between versions
- Handle field renames, type changes, and structure modifications
- Preserve existing data while upgrading schemas
- Support rollback if migrations fail

### **3. Migration Strategies**
- **Field Mapping**: Map old field names to new field names
- **Type Coercion**: Convert data types (string to number, etc.)
- **Default Values**: Add default values for new required fields
- **Data Validation**: Validate data after migration
- **Schema Evolution**: Support additive changes safely

## 🏗️ **Implementation Plan**

### **Phase 1: Migration Framework**

#### **1.1 Migration Registry**
```typescript
interface MigrationRule {
    fromVersion: string;
    toVersion: string;
    transform: (data: any) => Promise<any>;
    description: string;
    isBreaking: boolean;
}

class MigrationRegistry {
    private migrations = new Map<string, MigrationRule[]>();
    
    registerMigration(monitorType: string, rule: MigrationRule): void;
    getMigrationPath(monitorType: string, from: string, to: string): MigrationRule[];
    canMigrate(monitorType: string, from: string, to: string): boolean;
}
```

#### **1.2 Version Utilities**
```typescript
class VersionManager {
    static compare(version1: string, version2: string): number;
    static isCompatible(from: string, to: string): boolean;
    static parseVersion(version: string): { major: number; minor: number; patch: number };
    static getMigrationPath(from: string, to: string): string[];
}
```

### **Phase 2: Migration Execution Engine**

#### **2.1 Migration Orchestrator**
```typescript
class MigrationOrchestrator {
    async migrateMonitorData(
        monitorType: string,
        data: any,
        fromVersion: string,
        toVersion: string
    ): Promise<{
        success: boolean;
        data?: any;
        appliedMigrations: string[];
        errors: string[];
        warnings: string[];
    }>;
}
```

#### **2.2 Database Schema Migration**
```typescript
interface SchemaMigration {
    version: string;
    up: (db: Database) => Promise<void>;
    down: (db: Database) => Promise<void>;
    description: string;
}

class DatabaseSchemaMigrator {
    async migrateDatabase(targetVersion: string): Promise<void>;
    async rollbackToVersion(targetVersion: string): Promise<void>;
    getCurrentVersion(): Promise<string>;
}
```

### **Phase 3: Concrete Migration Examples**

#### **3.1 HTTP Monitor Migration (v1.0.0 → v1.1.0)**
```typescript
// Example: Adding timeout field with default value
const httpV1_0_to_1_1: MigrationRule = {
    fromVersion: "1.0.0",
    toVersion: "1.1.0",
    isBreaking: false,
    description: "Add timeout field with default 30s",
    transform: async (data) => ({
        ...data,
        timeout: data.timeout || 30000, // Default 30 seconds
    }),
};
```

#### **3.2 Port Monitor Migration (v1.0.0 → v2.0.0)**
```typescript
// Example: Changing port from string to number (breaking change)
const portV1_0_to_2_0: MigrationRule = {
    fromVersion: "1.0.0",
    toVersion: "2.0.0",
    isBreaking: true,
    description: "Convert port field from string to number",
    transform: async (data) => ({
        ...data,
        port: typeof data.port === "string" ? parseInt(data.port, 10) : data.port,
    }),
};
```

### **Phase 4: Integration Points**

#### **4.1 Monitor Type Registry Integration**
```typescript
registerMonitorType({
    type: "http",
    version: "1.1.0", // Current version
    previousVersions: ["1.0.0"], // Supported legacy versions
    migrations: [httpV1_0_to_1_1],
    // ... other config
});
```

#### **4.2 Database Storage**
```sql
-- Store monitor type versions
CREATE TABLE monitor_versions (
    id INTEGER PRIMARY KEY,
    monitor_type TEXT NOT NULL,
    version TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Track applied migrations
CREATE TABLE applied_migrations (
    id INTEGER PRIMARY KEY,
    monitor_type TEXT NOT NULL,
    from_version TEXT NOT NULL,
    to_version TEXT NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN NOT NULL
);
```

### **Phase 5: Error Handling & Rollback**

#### **5.1 Migration Safety**
- Validate data before and after migration
- Create backups before major migrations
- Support dry-run mode for testing
- Implement rollback mechanisms

#### **5.2 Failure Recovery**
```typescript
class MigrationRecovery {
    async createBackup(monitorType: string): Promise<string>;
    async restoreFromBackup(backupId: string): Promise<void>;
    async validateMigration(data: any, targetVersion: string): Promise<boolean>;
}
```

## 📅 **Implementation Timeline**

### **Immediate (High Priority)**
1. **Basic Migration Framework** - Implement `MigrationRegistry` and `VersionManager`
2. **Simple Migrations** - Support additive changes (new optional fields)
3. **Version Tracking** - Store and retrieve monitor type versions

### **Short Term (Medium Priority)**
1. **Database Schema Migration** - Implement `DatabaseSchemaMigrator`
2. **Breaking Change Support** - Handle field type changes and renames
3. **Validation Integration** - Validate data after migration

### **Long Term (Low Priority)**
1. **Advanced Migration Strategies** - Complex data transformations
2. **Migration UI** - User interface for migration management
3. **Performance Optimization** - Batch migrations and caching

## 🔧 **Implementation Code Examples**

### **Basic Migration Implementation**
```typescript
export async function migrateMonitorType(
    monitorType: MonitorType,
    fromVersion: string,
    toVersion: string,
    data?: any
): Promise<{
    success: boolean;
    appliedMigrations: string[];
    errors: string[];
    data?: any;
}> {
    try {
        // Validate monitor type
        const validationResult = EnhancedTypeGuard.validateMonitorType(monitorType);
        if (!validationResult.success) {
            return {
                success: false,
                appliedMigrations: [],
                errors: [validationResult.error ?? "Invalid monitor type"],
            };
        }

        // Get migration path
        const migrationPath = getMigrationPath(monitorType, fromVersion, toVersion);
        
        if (migrationPath.length === 0) {
            return {
                success: true,
                appliedMigrations: [],
                errors: [],
                data,
            };
        }

        // Apply migrations in sequence
        let currentData = data;
        const appliedMigrations: string[] = [];
        
        for (const migration of migrationPath) {
            try {
                currentData = await migration.transform(currentData);
                appliedMigrations.push(`${migration.fromVersion}_to_${migration.toVersion}`);
                
                logger.info(`Applied migration: ${monitorType} ${migration.fromVersion} → ${migration.toVersion}`);
            } catch (error) {
                logger.error(`Migration failed: ${monitorType} ${migration.fromVersion} → ${migration.toVersion}`, error);
                return {
                    success: false,
                    appliedMigrations,
                    errors: [`Migration failed: ${error.message}`],
                    data: currentData,
                };
            }
        }

        return {
            success: true,
            appliedMigrations,
            errors: [],
            data: currentData,
        };
    } catch (error) {
        logger.error("Migration error:", error);
        return {
            success: false,
            appliedMigrations: [],
            errors: [`Migration failed: ${error.message}`],
        };
    }
}
```

## 📝 **Next Steps**

1. **Review and Approve Plan** - Get stakeholder approval for migration strategy
2. **Implement Phase 1** - Start with basic migration framework
3. **Add Tests** - Comprehensive test coverage for migration logic
4. **Documentation** - Update developer documentation with migration guide
5. **Gradual Rollout** - Implement migrations incrementally for existing monitor types

---

**This plan provides a comprehensive foundation for implementing a robust monitor type migration system that can handle version upgrades, data transformations, and backward compatibility while maintaining data integrity.**
