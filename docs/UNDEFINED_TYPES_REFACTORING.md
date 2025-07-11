# Undefined Types Refactoring Report

<!-- markdownlint-disable -->

## Overview

This document tracks the removal of unnecessary undefined types from the Uptime Watcher codebase.

## Analysis Summary

### Types Analysis

1. **Monitor Interface** - Many optional fields can be made required with sensible defaults
2. **Site Interface** - Some fields can be made required
3. **StatusHistory Interface** - Details field is genuinely optional
4. **Database Handling** - Some undefined handling is needed for NULL database values

## Changes Made

### 1. Monitor Interface Changes

- ✅ `responseTime`: Changed from `number | undefined` to `number` (default: -1 for never checked)
- ✅ `monitoring`: Changed from `boolean | undefined` to `boolean` (default: true)
- ✅ `checkInterval`: Changed from `number | undefined` to `number` (default: 300000ms)
- ✅ `timeout`: Changed from `number | undefined` to `number` (default: 5000ms)
- ✅ `retryAttempts`: Changed from `number | undefined` to `number` (default: 3)

### 2. Site Interface Changes

- ✅ `name`: Changed from `string | undefined` to `string` (default: "Unnamed Site")
- ✅ `monitoring`: Changed from `boolean | undefined` to `boolean` (default: true)

### 3. StatusUpdate Interface Changes

- ✅ `previousStatus`: Removed `| undefined` (will use type union without undefined)

### 4. Types That MUST Remain Optional/Undefined

#### Database Mapping Context

- `Monitor.lastChecked?: Date` - Genuinely optional, undefined before first check
- `Monitor.url?: string` - Only for HTTP monitors, undefined for port monitors
- `Monitor.host?: string` - Only for port monitors, undefined for HTTP monitors
- `Monitor.port?: number` - Only for port monitors, undefined for HTTP monitors
- `StatusHistory.details?: string` - Optional additional information

#### Rationale for Required Undefined Types

1. **Type-specific fields**: `url`/`host`/`port` must be optional based on monitor type
2. **Temporal fields**: `lastChecked` is undefined until first check occurs
3. **Optional metadata**: `details` in StatusHistory is supplementary information

## Implementation Strategy

1. Update type definitions in both `electron/types.ts` and `src/types.ts`
2. Update default creation functions to provide sensible defaults
3. Update database mapping to handle the new required fields
4. Update test files to match new type requirements
5. Run comprehensive tests to ensure no breakage

## Testing Plan

- Run all existing tests after each change
- Verify database operations work correctly
- Ensure frontend and backend integration remains intact
- Test monitor creation, update, and scheduling functionality
