# Monitor Type Implementation Improvements Plan
<!-- markdownlint-disable -->
**Plan to streamline new monitor type implementation**

---

## 🎯 **Current State Analysis**

After analyzing the codebase, implementing a new monitor type currently requires changes to **23+ files** across backend and frontend. This is excessive and error-prone.

## 🚨 **Key Problems Identified**

### 1. **Hard-coded Type Lists Everywhere**
- Monitor type options in form: `AddSiteForm.tsx:170`
- Factory switch statements: `MonitorFactory.ts:30`
- Validation switch cases: `MonitorValidator.ts:45`
- Form field rendering: `AddSiteForm.tsx:180-220`

### 2. **Manual Registration Required**
- Factory pattern requires manual case additions
- Registry requires manual registration calls
- Repository SQL needs manual column additions
- Database mappers need manual field mappings

### 3. **Scattered Validation Logic**
- Frontend validation: `Submit.tsx:100-160`
- Backend validation: `MonitorValidator.ts:45-80`
- Form field validation: `AddSiteForm.tsx:validation`
- Database constraints: Schema definitions

### 4. **Type Safety Issues**
- `MonitorType = string` (no compile-time safety)
- Optional fields are `string | undefined` everywhere
- No centralized type definitions
- Runtime type checking scattered

### 5. **Database Schema Management**
- No migration system for new monitor fields
- Manual SQL in multiple files
- No version tracking for schema changes

---

## 🔧 **Proposed Improvements**

### **Priority 1: Centralized Monitor Type Configuration**

Create a single source of truth for all monitor types:

**File**: `electron/services/monitoring/MonitorTypeDefinitions.ts` (NEW)

```typescript
export interface MonitorTypeDefinition {
    type: string;
    displayName: string;
    description: string;
    version: string;
    fields: MonitorFieldDefinition[];
    serviceFactory: () => IMonitorService;
    validationSchema: ZodSchema;
}

export interface MonitorFieldDefinition {
    name: string;
    label: string;
    type: 'text' | 'number' | 'select' | 'url';
    required: boolean;
    placeholder?: string;
    helpText?: string;
    options?: { label: string; value: string }[];
    validation?: (value: any) => string[];
}

export const MONITOR_TYPE_DEFINITIONS: Record<string, MonitorTypeDefinition> = {
    http: {
        type: 'http',
        displayName: 'HTTP (Website/API)',
        description: 'Monitors HTTP/HTTPS endpoints for availability and response time',
        version: '1.0.0',
        fields: [
            {
                name: 'url',
                label: 'Website URL',
                type: 'url',
                required: true,
                placeholder: 'https://example.com',
                helpText: 'Enter the full URL including http:// or https://',
                validation: [(url) => validator.isURL(url) ? [] : ['Invalid URL format']]
            }
        ],
        serviceFactory: () => new HttpMonitor(),
        validationSchema: z.object({
            url: z.string().url()
        })
    },
    
    port: {
        type: 'port',
        displayName: 'Port (Host/Port)',
        description: 'Monitors TCP port connectivity',
        version: '1.0.0',
        fields: [
            {
                name: 'host',
                label: 'Host',
                type: 'text',
                required: true,
                placeholder: 'example.com or 192.168.1.1',
                helpText: 'Enter a valid host (domain or IP)'
            },
            {
                name: 'port',
                label: 'Port',
                type: 'number',
                required: true,
                placeholder: '80',
                helpText: 'Enter a port number (1-65535)'
            }
        ],
        serviceFactory: () => new PortMonitor(),
        validationSchema: z.object({
            host: z.string().min(1),
            port: z.number().min(1).max(65535)
        })
    },
    
    dns: {
        type: 'dns',
        displayName: 'DNS (Domain Resolution)',
        description: 'Monitors DNS resolution and record validation',
        version: '1.0.0',
        fields: [
            {
                name: 'hostname',
                label: 'Hostname',
                type: 'text',
                required: true,
                placeholder: 'example.com',
                helpText: 'Enter the hostname to resolve'
            },
            {
                name: 'recordType',
                label: 'DNS Record Type',
                type: 'select',
                required: true,
                options: [
                    { label: 'A Record (IPv4)', value: 'A' },
                    { label: 'AAAA Record (IPv6)', value: 'AAAA' },
                    { label: 'MX Record (Mail)', value: 'MX' },
                    { label: 'CNAME Record', value: 'CNAME' },
                    { label: 'TXT Record', value: 'TXT' }
                ]
            },
            {
                name: 'expectedValue',
                label: 'Expected Value',
                type: 'text',
                required: false,
                placeholder: '192.168.1.1',
                helpText: 'Optional expected value in DNS response'
            }
        ],
        serviceFactory: () => new DnsMonitor(),
        validationSchema: z.object({
            hostname: z.string().min(1),
            recordType: z.enum(['A', 'AAAA', 'MX', 'CNAME', 'TXT']),
            expectedValue: z.string().optional()
        })
    }
};

// Auto-generate types
export type MonitorType = keyof typeof MONITOR_TYPE_DEFINITIONS;
export type MonitorFieldName = {
    [K in MonitorType]: MONITOR_TYPE_DEFINITIONS[K]['fields'][number]['name']
}[MonitorType];
```

### **Priority 2: Auto-registering Factory**

**File**: `electron/services/monitoring/MonitorFactory.ts` (UPDATED)

```typescript
export class MonitorFactory {
    private static serviceInstances = new Map<string, IMonitorService>();
    
    public static getMonitor(type: MonitorType, config?: MonitorConfig): IMonitorService {
        const definition = MONITOR_TYPE_DEFINITIONS[type];
        if (!definition) {
            throw new Error(`Unsupported monitor type: ${type}`);
        }
        
        let instance = this.serviceInstances.get(type);
        if (!instance) {
            instance = definition.serviceFactory();
            if (config) {
                instance.updateConfig(config);
            }
            this.serviceInstances.set(type, instance);
        }
        
        return instance;
    }
    
    public static getAvailableTypes(): MonitorType[] {
        return Object.keys(MONITOR_TYPE_DEFINITIONS) as MonitorType[];
    }
    
    public static getTypeDefinition(type: MonitorType): MonitorTypeDefinition {
        return MONITOR_TYPE_DEFINITIONS[type];
    }
}
```

### **Priority 3: Dynamic Form Generation**

**File**: `src/components/AddSiteForm/DynamicMonitorFields.tsx` (NEW)

```tsx
interface DynamicMonitorFieldsProps {
    monitorType: MonitorType;
    values: Record<string, any>;
    onChange: (field: string, value: any) => void;
    isLoading?: boolean;
}

export function DynamicMonitorFields({ 
    monitorType, 
    values, 
    onChange, 
    isLoading 
}: DynamicMonitorFieldsProps) {
    const definition = MONITOR_TYPE_DEFINITIONS[monitorType];
    
    return (
        <div className="flex flex-col gap-2">
            {definition.fields.map((field) => (
                <DynamicField
                    key={field.name}
                    field={field}
                    value={values[field.name] || ''}
                    onChange={(value) => onChange(field.name, value)}
                    disabled={isLoading}
                />
            ))}
        </div>
    );
}

function DynamicField({ field, value, onChange, disabled }) {
    switch (field.type) {
        case 'text':
        case 'url':
            return (
                <TextField
                    disabled={disabled}
                    helpText={field.helpText}
                    id={field.name}
                    label={field.label}
                    onChange={onChange}
                    placeholder={field.placeholder}
                    required={field.required}
                    type={field.type}
                    value={value}
                />
            );
        case 'number':
            return (
                <TextField
                    disabled={disabled}
                    helpText={field.helpText}
                    id={field.name}
                    label={field.label}
                    onChange={(val) => onChange(Number(val))}
                    placeholder={field.placeholder}
                    required={field.required}
                    type="number"
                    value={value}
                />
            );
        case 'select':
            return (
                <SelectField
                    disabled={disabled}
                    id={field.name}
                    label={field.label}
                    onChange={onChange}
                    options={field.options || []}
                    value={value}
                />
            );
        default:
            return null;
    }
}
```

### **Priority 4: Unified Validation System**

**File**: `src/utils/monitorValidation.ts` (NEW)

```typescript
export function validateMonitor(type: MonitorType, data: Record<string, any>): string[] {
    const definition = MONITOR_TYPE_DEFINITIONS[type];
    
    try {
        definition.validationSchema.parse(data);
        return [];
    } catch (error) {
        if (error instanceof ZodError) {
            return error.errors.map(err => err.message);
        }
        return ['Validation failed'];
    }
}

export function validateMonitorField(
    type: MonitorType, 
    fieldName: string, 
    value: any
): string[] {
    const definition = MONITOR_TYPE_DEFINITIONS[type];
    const field = definition.fields.find(f => f.name === fieldName);
    
    if (!field) return [];
    
    const errors: string[] = [];
    
    // Required field validation
    if (field.required && (!value || value.toString().trim() === '')) {
        errors.push(`${field.label} is required`);
        return errors;
    }
    
    // Custom field validation
    if (field.validation && value) {
        for (const validator of field.validation) {
            errors.push(...validator(value));
        }
    }
    
    return errors;
}
```

### **Priority 5: Database Schema Automation**

**File**: `electron/services/database/MonitorFieldMapper.ts` (NEW)

```typescript
export class MonitorFieldMapper {
    public static getFieldDefinitions(): DatabaseFieldDefinition[] {
        const fields: DatabaseFieldDefinition[] = [];
        
        for (const definition of Object.values(MONITOR_TYPE_DEFINITIONS)) {
            for (const field of definition.fields) {
                fields.push({
                    name: field.name,
                    type: this.getSqlType(field.type),
                    nullable: !field.required,
                    monitorType: definition.type
                });
            }
        }
        
        return fields;
    }
    
    public static mapRowToMonitor(row: Record<string, any>): Partial<Monitor> {
        const monitor: Partial<Monitor> = {};
        
        for (const definition of Object.values(MONITOR_TYPE_DEFINITIONS)) {
            for (const field of definition.fields) {
                if (row[field.name] !== undefined && row[field.name] !== null) {
                    (monitor as any)[field.name] = this.convertFromDb(row[field.name], field.type);
                }
            }
        }
        
        return monitor;
    }
    
    public static mapMonitorToRow(monitor: Monitor): Record<string, any> {
        const row: Record<string, any> = {};
        
        const definition = MONITOR_TYPE_DEFINITIONS[monitor.type];
        if (definition) {
            for (const field of definition.fields) {
                row[field.name] = (monitor as any)[field.name] ?? null;
            }
        }
        
        return row;
    }
    
    private static getSqlType(fieldType: string): string {
        switch (fieldType) {
            case 'number': return 'INTEGER';
            case 'text':
            case 'url':
            case 'select':
            default: return 'TEXT';
        }
    }
    
    private static convertFromDb(value: any, fieldType: string): any {
        switch (fieldType) {
            case 'number': return Number(value);
            default: return String(value);
        }
    }
}
```

---

## 📋 **Implementation Roadmap**

### **Phase 1: Foundation (Week 1)**
1. Create `MonitorTypeDefinitions.ts` with existing types
2. Update `MonitorFactory` to use definitions
3. Create migration system for database fields
4. Add comprehensive tests

### **Phase 2: Dynamic UI (Week 2)**
1. Create `DynamicMonitorFields` component
2. Update `AddSiteForm` to use dynamic fields
3. Implement unified validation system
4. Update monitor selector components

### **Phase 3: Validation & Safety (Week 3)**
1. Implement Zod validation schemas
2. Add TypeScript strict typing
3. Create field mapper system
4. Add comprehensive error handling

### **Phase 4: Testing & Documentation (Week 4)**
1. Update all existing tests
2. Add integration tests for new system
3. Create documentation for adding new types
4. Add example monitor type implementation

---

## 🎯 **Expected Results**

### **Before: Adding DNS Monitor**
- **Files to modify**: 23+
- **Lines of code**: 500+
- **Time estimate**: 2-3 days
- **Error potential**: High (manual updates)

### **After: Adding DNS Monitor**
- **Files to modify**: 2
- **Lines of code**: 100
- **Time estimate**: 2-3 hours
- **Error potential**: Low (automated)

### **New Implementation Process**
1. Add monitor type definition to `MONITOR_TYPE_DEFINITIONS`
2. Create monitor service class
3. Add tests
4. Deploy

**That's it!** Everything else is automatically handled:
- ✅ Form fields auto-generated
- ✅ Validation auto-applied
- ✅ Database mapping auto-handled
- ✅ Factory registration auto-done
- ✅ Type safety auto-enforced

---

## 🔧 **Quick Implementation Example**

Adding a new "Ping" monitor type:

```typescript
// 1. Add to MONITOR_TYPE_DEFINITIONS
ping: {
    type: 'ping',
    displayName: 'Ping (ICMP)',
    description: 'Monitors host reachability via ICMP ping',
    version: '1.0.0',
    fields: [
        {
            name: 'target',
            label: 'Target Host',
            type: 'text',
            required: true,
            placeholder: 'example.com',
            helpText: 'Host to ping'
        },
        {
            name: 'packetCount',
            label: 'Packet Count',
            type: 'number',
            required: false,
            placeholder: '4',
            helpText: 'Number of ping packets to send'
        }
    ],
    serviceFactory: () => new PingMonitor(),
    validationSchema: z.object({
        target: z.string().min(1),
        packetCount: z.number().min(1).max(10).optional()
    })
}

// 2. Create PingMonitor.ts
export class PingMonitor implements IMonitorService {
    // Standard implementation...
}
```

**Done!** The ping monitor is now fully integrated with forms, validation, database, and UI.

---

This improvement plan will reduce new monitor type implementation from **23+ files** to **2 files**, making the system much more maintainable and less error-prone.
