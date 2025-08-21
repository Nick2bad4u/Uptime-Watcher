# Variable: DATABASE\_ERRORS

> `const` **DATABASE\_ERRORS**: `object`

Defined in: [shared/utils/errorCatalog.ts:246](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/utils/errorCatalog.ts#L246)

Database-related error messages.

## Type declaration

### BACKUP\_FAILED

> `readonly` **BACKUP\_FAILED**: `"Backup operation failed"` = `"Backup operation failed"`

Error when backup operation fails

### CONNECTION\_FAILED

> `readonly` **CONNECTION\_FAILED**: `"Database connection failed"` = `"Database connection failed"`

Error when database connection fails

### CONSTRAINT\_VIOLATION

> `readonly` **CONSTRAINT\_VIOLATION**: `"Data constraint violation"` = `"Data constraint violation"`

Error when data constraint is violated

### DATABASE\_LOCKED

> `readonly` **DATABASE\_LOCKED**: `"Database is locked"` = `"Database is locked"`

Error when database is locked

### DUPLICATE\_ENTRY

> `readonly` **DUPLICATE\_ENTRY**: `"Duplicate entry detected"` = `"Duplicate entry detected"`

Error when duplicate entry is detected

### IMPORT\_DATA\_INVALID

> `readonly` **IMPORT\_DATA\_INVALID**: `"Invalid import data format"` = `"Invalid import data format"`

Error when import data format is invalid

### MIGRATION\_FAILED

> `readonly` **MIGRATION\_FAILED**: `"Data migration failed"` = `"Data migration failed"`

Error when data migration fails

### QUERY\_FAILED

> `readonly` **QUERY\_FAILED**: `"Database query failed"` = `"Database query failed"`

Error when query execution fails

### RECORD\_NOT\_FOUND

> `readonly` **RECORD\_NOT\_FOUND**: `"Record not found"` = `"Record not found"`

Error when record is not found

### RESTORE\_FAILED

> `readonly` **RESTORE\_FAILED**: `"Restore operation failed"` = `"Restore operation failed"`

Error when restore operation fails

### TRANSACTION\_FAILED

> `readonly` **TRANSACTION\_FAILED**: `"Database transaction failed"` = `"Database transaction failed"`

Error when transaction fails

## Remarks

Error messages for database operations, data persistence issues, and data
integrity errors.
