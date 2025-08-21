# src/utils/data/generateUuid

Utility function for generating unique identifiers.

## Remarks

Uses crypto.randomUUID in modern Electron/Node.js environments with a
fallback to a timestamp-based ID with random characters for older
environments. The fallback ensures the function works in all environments.

## Functions

- [generateUuid](functions/generateUuid.md)
