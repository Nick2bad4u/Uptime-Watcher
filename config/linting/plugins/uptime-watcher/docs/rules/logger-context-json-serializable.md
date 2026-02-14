# Logger Context Json Serializable

Requires logger metadata/context arguments to be JSON-serializable, aligned with TypeFest `JsonValue` expectations.

## What it checks

For logger methods (for example `debug`, `info`, `warn`, `error`, `action`), this rule validates that the context/details argument is serializable.

## Why

Non-serializable data in logging context causes unstable telemetry and inconsistent diagnostics.
