# IPC Handler Signature Matches Validator

Ensures typed IPC handler registration remains consistent across:

- channel request/response contracts,
- handler function signatures, and
- validator output types.

## What it checks

For calls such as `registerStandardizedIpcHandler(...)` and `registerIpcHandle(...)`, this rule verifies:

1. The handler function type is assignable to the channel contract signature.
2. The validator return type is assignable to the handler's first parameter type.

## Why

Syntax-only checks can confirm that a validator exists, but not that it returns the right shape. This rule prevents silent contract drift across IPC boundaries.
