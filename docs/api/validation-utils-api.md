# ✅ Validation Utilities API Reference

> **Navigation:** [📖 Docs Home](../README.md) » [📚 API Reference](README.md) » **Validation Utils API**

The Validation Utilities API provides input validation and constraint checking using the validator.js library, primarily used in form handling and data validation throughout the application.

## Overview

The application uses the [validator.js](https://github.com/validatorjs/validator.js) library for string validation and sanitization. This library provides a comprehensive set of validators for common data types and formats.

## Primary Usage

Validation is primarily used in the AddSiteForm component for validating user inputs before submission.

### Key Validation Functions Used

The application primarily uses these validator.js functions:

#### URL Validation

```typescript
import validator from 'validator';

// Validate HTTP/HTTPS URLs
validator.isURL(url, {
    allow_protocol_relative_urls: false,
    allow_trailing_dot: false, 
    allow_underscores: false,
    disallow_auth: false,
    protocols: ["http", "https"],
    require_protocol: true,
    require_valid_protocol: true,
});
```

**Used for:** Validating website URLs in HTTP monitor configuration

**Options:**

- `protocols`: Only allow HTTP and HTTPS protocols
- `require_protocol`: URL must include protocol (http:// or https://)
- `allow_underscores`: Reject URLs with underscores
- `allow_trailing_dot`: Reject URLs ending with a dot

#### Domain and IP Validation

```typescript
// Validate IP addresses (IPv4 and IPv6)
validator.isIP(host); // Returns true for valid IP addresses

// Validate Fully Qualified Domain Names  
validator.isFQDN(host, {
    allow_trailing_dot: false,
    allow_underscores: false,
});
```

**Used for:** Validating host addresses in port monitor configuration

**FQDN Options:**

- `allow_trailing_dot`: Reject domains ending with a dot
- `allow_underscores`: Reject domains with underscores

#### Port Validation

```typescript
// Validate port numbers (1-65535)
validator.isPort(port); // Returns true for valid port numbers
```

**Used for:** Validating port numbers in port monitor configuration

## Validation Patterns

### HTTP Monitor Validation

```typescript
function validateHttpMonitor(url: string): string[] {
    const errors: string[] = [];
    
    if (!url.trim()) {
        errors.push("Website URL is required for HTTP monitor");
    } else {
        const trimmedUrl = url.trim();
        
        // Check protocol requirement
        if (!/^https?:\/\//i.test(trimmedUrl)) {
            errors.push("HTTP monitor requires a URL starting with http:// or https://");
        } else if (!validator.isURL(trimmedUrl, {
            allow_protocol_relative_urls: false,
            allow_trailing_dot: false,
            allow_underscores: false,
            disallow_auth: false,
            protocols: ["http", "https"],
            require_protocol: true,
            require_valid_protocol: true,
        })) {
            errors.push("Please enter a valid URL with a proper domain");
        }
    }
    
    return errors;
}
```

### Port Monitor Validation

```typescript
function validatePortMonitor(host: string, port: string): string[] {
    const errors: string[] = [];
    
    // Validate host
    if (!host.trim()) {
        errors.push("Host is required for port monitor");
    } else {
        const trimmedHost = host.trim();
        const isValidIP = validator.isIP(trimmedHost);
        const isValidDomain = validator.isFQDN(trimmedHost, {
            allow_trailing_dot: false,
            allow_underscores: false,
        });

        if (!isValidIP && !isValidDomain) {
            errors.push("Host must be a valid IP address or domain name");
        }
    }
    
    // Validate port
    if (!port.trim()) {
        errors.push("Port is required for port monitor");
    } else if (!validator.isPort(port.trim())) {
        errors.push("Port must be a valid port number (1-65535)");
    }
    
    return errors;
}
```

### Check Interval Validation

```typescript
function validateCheckInterval(interval: number): string[] {
    const errors: string[] = [];
    
    if (!interval || interval <= 0) {
        errors.push("Check interval must be a positive number");
    }
    
    return errors;
}
```

## Available Validator.js Functions

The application has access to the full validator.js library. Here are commonly useful validators:

### String Content Validators

- `isAlpha(str)` - Check if string contains only letters
- `isAlphanumeric(str)` - Check if string contains only letters and numbers
- `isNumeric(str)` - Check if string contains only numbers
- `isAscii(str)` - Check if string contains only ASCII characters
- `isLength(str, options)` - Check if string length is within range

### Format Validators

- `isEmail(str)` - Validate email addresses
- `isURL(str, options)` - Validate URLs
- `isFQDN(str, options)` - Validate domain names
- `isIP(str)` - Validate IP addresses
- `isPort(str)` - Validate port numbers
- `isJSON(str)` - Validate JSON strings
- `isUUID(str)` - Validate UUID strings

### Numeric Validators

- `isInt(str, options)` - Validate integers with optional bounds
- `isFloat(str, options)` - Validate floating point numbers
- `isDecimal(str, options)` - Validate decimal numbers

### Date/Time Validators

- `isDate(str, options)` - Validate date strings
- `isISO8601(str)` - Validate ISO 8601 date format
- `isBefore(str, date)` - Check if date is before specified date
- `isAfter(str, date)` - Check if date is after specified date

## Form Integration

### Real-time Validation

```typescript
import { useState } from 'react';
import validator from 'validator';

function useFormValidation() {
    const [errors, setErrors] = useState<Record<string, string>>({});
    
    const validateField = (name: string, value: string) => {
        let error = '';
        
        switch (name) {
            case 'url':
                if (!value.trim()) {
                    error = 'URL is required';
                } else if (!validator.isURL(value, { 
                    protocols: ['http', 'https'],
                    require_protocol: true 
                })) {
                    error = 'Please enter a valid URL';
                }
                break;
                
            case 'email':
                if (value && !validator.isEmail(value)) {
                    error = 'Please enter a valid email address';
                }
                break;
                
            case 'port':
                if (value && !validator.isPort(value)) {
                    error = 'Please enter a valid port number (1-65535)';
                }
                break;
        }
        
        setErrors(prev => ({ ...prev, [name]: error }));
        return error === '';
    };
    
    return { errors, validateField };
}
```

### Submission Validation

```typescript
function validateFormSubmission(formData: FormData): ValidationResult {
    const errors: string[] = [];
    
    // Validate required fields
    if (!formData.url.trim()) {
        errors.push("URL is required");
    }
    
    // Validate formats
    if (formData.url && !validator.isURL(formData.url, {
        protocols: ['http', 'https'],
        require_protocol: true
    })) {
        errors.push("Invalid URL format");
    }
    
    if (formData.checkInterval <= 0) {
        errors.push("Check interval must be positive");
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}
```

## Custom Validation Helpers

### Protocol Validation

```typescript
/**
 * Check if URL starts with required protocol
 */
function hasRequiredProtocol(url: string): boolean {
    return /^https?:\/\//i.test(url.trim());
}

/**
 * Validate URL with custom error messages
 */
function validateUrlWithMessages(url: string): string | null {
    if (!url.trim()) {
        return "URL is required";
    }
    
    if (!hasRequiredProtocol(url)) {
        return "URL must start with http:// or https://";
    }
    
    if (!validator.isURL(url, {
        protocols: ['http', 'https'],
        require_protocol: true,
        require_valid_protocol: true
    })) {
        return "Please enter a valid URL with proper domain";
    }
    
    return null; // Valid
}
```

### Host Validation

```typescript
/**
 * Validate host (IP address or domain name)
 */
function validateHost(host: string): string | null {
    if (!host.trim()) {
        return "Host is required";
    }
    
    const trimmedHost = host.trim();
    const isValidIP = validator.isIP(trimmedHost);
    const isValidDomain = validator.isFQDN(trimmedHost, {
        allow_trailing_dot: false,
        allow_underscores: false,
    });
    
    if (!isValidIP && !isValidDomain) {
        return "Host must be a valid IP address or domain name";
    }
    
    return null; // Valid
}
```

## Error Handling

### Validation Error Collection

```typescript
interface ValidationError {
    field: string;
    message: string;
    value: string;
}

class ValidationErrorCollector {
    private errors: ValidationError[] = [];
    
    addError(field: string, message: string, value: string): void {
        this.errors.push({ field, message, value });
    }
    
    validateUrl(field: string, url: string): boolean {
        const error = validateUrlWithMessages(url);
        if (error) {
            this.addError(field, error, url);
            return false;
        }
        return true;
    }
    
    validateHost(field: string, host: string): boolean {
        const error = validateHost(host);
        if (error) {
            this.addError(field, error, host);
            return false;
        }
        return true;
    }
    
    getErrors(): ValidationError[] {
        return [...this.errors];
    }
    
    hasErrors(): boolean {
        return this.errors.length > 0;
    }
    
    getFirstError(): string | null {
        return this.errors.length > 0 ? this.errors[0].message : null;
    }
    
    clear(): void {
        this.errors = [];
    }
}
```

## Usage Examples

### Complete Form Validation

```typescript
import validator from 'validator';

interface MonitorFormData {
    type: 'http' | 'port';
    url?: string;
    host?: string;
    port?: string;
    name: string;
    checkInterval: number;
}

function validateMonitorForm(data: MonitorFormData): ValidationResult {
    const collector = new ValidationErrorCollector();
    
    // Validate name
    if (!data.name.trim()) {
        collector.addError('name', 'Monitor name is required', data.name);
    }
    
    // Validate by type
    if (data.type === 'http') {
        if (data.url) {
            collector.validateUrl('url', data.url);
        } else {
            collector.addError('url', 'URL is required for HTTP monitor', '');
        }
    } else if (data.type === 'port') {
        if (data.host) {
            collector.validateHost('host', data.host);
        } else {
            collector.addError('host', 'Host is required for port monitor', '');
        }
        
        if (data.port) {
            if (!validator.isPort(data.port)) {
                collector.addError('port', 'Invalid port number', data.port);
            }
        } else {
            collector.addError('port', 'Port is required for port monitor', '');
        }
    }
    
    // Validate interval
    if (data.checkInterval <= 0) {
        collector.addError('checkInterval', 'Check interval must be positive', String(data.checkInterval));
    }
    
    return {
        isValid: !collector.hasErrors(),
        errors: collector.getErrors(),
        firstError: collector.getFirstError()
    };
}
```

### React Hook Integration

```typescript
function useMonitorFormValidation() {
    const [errors, setErrors] = useState<Record<string, string>>({});
    
    const validate = useCallback((data: MonitorFormData) => {
        const result = validateMonitorForm(data);
        
        // Convert to field-keyed errors
        const fieldErrors: Record<string, string> = {};
        result.errors.forEach(error => {
            fieldErrors[error.field] = error.message;
        });
        
        setErrors(fieldErrors);
        return result.isValid;
    }, []);
    
    const clearError = useCallback((field: string) => {
        setErrors(prev => {
            const updated = { ...prev };
            delete updated[field];
            return updated;
        });
    }, []);
    
    const clearAllErrors = useCallback(() => {
        setErrors({});
    }, []);
    
    return {
        errors,
        validate,
        clearError,
        clearAllErrors,
        hasErrors: Object.keys(errors).length > 0
    };
}
```

## Best Practices

### Input Sanitization

Always trim inputs before validation:

```typescript
const trimmedInput = input.trim();
const isValid = validator.isURL(trimmedInput);
```

### Error Message Consistency

Use consistent error message patterns:

```typescript
const ERROR_MESSAGES = {
    REQUIRED: (field: string) => `${field} is required`,
    INVALID_FORMAT: (field: string) => `Please enter a valid ${field}`,
    INVALID_URL: 'Please enter a valid URL with http:// or https://',
    INVALID_HOST: 'Host must be a valid IP address or domain name',
    INVALID_PORT: 'Port must be a valid port number (1-65535)',
    POSITIVE_NUMBER: (field: string) => `${field} must be a positive number`
};
```

### Progressive Validation

Validate in stages from basic to complex:

1. Required field validation
2. Format validation
3. Business logic validation
4. Cross-field validation

### Performance Considerations

- Cache validation results for expensive operations
- Debounce real-time validation to avoid excessive calls
- Use field-level validation for immediate feedback
- Perform complete validation only on submission

## Integration Notes

- The validator.js library is primarily used in the AddSiteForm component
- All validation is client-side for immediate user feedback
- Server-side validation should mirror client-side rules
- Error messages are displayed in the UI immediately after validation
- Validation state is managed through React hooks and state management

## See Also

- [📋 Types API](types-api.md) - Site and monitor type definitions
- [🧩 Hook APIs](hook-apis.md) - Form validation hooks
- [🏪 Store API](store-api.md) - Form state management
- [🛠️ Utilities API](utilities-api.md) - General utility functions
- [💾 Database API](database-api.md) - Data persistence validation
- [📝 Logger API](logger-api.md) - Validation error logging

---

> **Related:** [📚 API Reference](README.md) | [📖 Documentation Home](../README.md)
