# Variable: SITE\_ERRORS

> `const` **SITE\_ERRORS**: `object`

Defined in: [shared/utils/errorCatalog.ts:42](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/utils/errorCatalog.ts#L42)

Site-related error messages.

## Type declaration

### ALREADY\_EXISTS

> `readonly` **ALREADY\_EXISTS**: `"Site with this identifier already exists"` = `"Site with this identifier already exists"`

Error when site already exists with the same identifier

### FAILED\_TO\_ADD

> `readonly` **FAILED\_TO\_ADD**: `"Failed to add site"` = `"Failed to add site"`

Error when attempting to add a site fails

### FAILED\_TO\_CHECK

> `readonly` **FAILED\_TO\_CHECK**: `"Failed to check site"` = `"Failed to check site"`

Error when site configuration check fails

### FAILED\_TO\_DELETE

> `readonly` **FAILED\_TO\_DELETE**: `"Failed to delete site"` = `"Failed to delete site"`

Error when attempting to delete a site fails

### FAILED\_TO\_UPDATE

> `readonly` **FAILED\_TO\_UPDATE**: `"Failed to update site"` = `"Failed to update site"`

Error when attempting to update a site fails

### INVALID\_IDENTIFIER

> `readonly` **INVALID\_IDENTIFIER**: `"Site identifier is invalid or missing"` = `"Site identifier is invalid or missing"`

Error when site identifier is invalid or empty

### INVALID\_NAME

> `readonly` **INVALID\_NAME**: `"Site name is invalid or missing"` = `"Site name is invalid or missing"`

Error when site name is invalid or empty

### NOT\_FOUND

> `readonly` **NOT\_FOUND**: `"Site not found"` = `"Site not found"`

Error when a requested site cannot be found

## Remarks

Error messages for site CRUD operations, configuration management, and
site-level monitoring operations.
