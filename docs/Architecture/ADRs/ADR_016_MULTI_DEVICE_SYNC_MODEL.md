---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
doc_title: "ADR-016: Multi-Device Sync Data Model"
summary: "Defines the canonical sync model, conflict detection/merge rules, and payload boundaries for true multi-device sync without syncing raw SQLite files."
created: "2025-12-12"
last_reviewed: "2026-02-12"
doc_category: "guide"
author: "Nick2bad4u"
tags:
 - "uptime-watcher"
 - "architecture"
 - "adr"
 - "sync"
 - "conflict-resolution"
 - "offline-first"
 - "sqlite"
---

# ADR-016: Multi-Device Sync Data Model

## Table of Contents

1. [Status](#status)
2. [Context](#context)
3. [Decision](#decision)
4. [Conflict Resolution](#conflict-resolution)
5. [Consequences](#consequences)
6. [Implementation](#implementation)
7. [Testing & Validation](#testing--validation)
8. [Related ADRs](#related-adrs)
9. [Review](#review)

## Status

Accepted (implemented — complete)

> **Implementation status (as of 2026-01-11)**
>
> - ✅ Canonical sync domain types implemented under:
>   - `shared/types/cloudSync*.ts`
>   - `shared/types/cloudSyncDomain.ts`
> - ✅ Deterministic merge implementation:
>   - `shared/utils/cloudSyncState.ts`
>   - (Final hardening) delete tombstones are compared against the latest known
>     entity write so the merge is order-independent and idempotent.
> - ✅ Provider-backed transport:
>   - `electron/services/sync/ProviderCloudSyncTransport.ts`
> - ✅ Main sync engine (emit ops, compact snapshot, write manifest):
>   - `electron/services/sync/SyncEngine.ts`
> - ✅ Property tests for determinism/idempotency:
>   - `shared/test/cloudSyncState.property.test.ts`
> - ✅ Multi-device convergence integration test:
>   - `electron/test/services/sync/SyncEngine.test.ts`
> - ✅ Remote sync reset (maintenance):
>   - `electron/services/cloud/migrations/syncReset.ts`
>   - `shared/types/cloudSyncManifest.ts` (`resetAt`)
> - ✅ Remote sync reset preview (preflight):
>   - `shared/types/cloudSyncResetPreview.ts`
>   - IPC: `cloud-preview-reset-remote-sync`

## Context

“True sync” means multiple devices can concurrently edit configuration and converge.

Important non-goals for V1:

- Continuous merging of the SQLite database file.
- Full-fidelity sync of high-volume time series history by default.

SQLite is our **local persistence mechanism**, not our sync protocol.

## Decision

### 1) Sync domain state, not SQLite

We will sync a **canonical JSON state** describing the parts of the app that are naturally mergeable:

- Sites
- Monitors (config)
- App settings
- Optional: limited monitor history (opt-in and capped)

The local SQLite DB remains the authoritative on-device persistence layer, but it is _derived_ from the synced state.

### 2) Sync transport: operation log + periodic snapshots

We will implement a provider-backed sync transport (ADR-015) using:

- An append-only **per-device operation log** stored as **NDJSON** (`.ndjson`)
- Periodic **compacted snapshots** to bound replay time

This reduces write conflicts, because logs are written to per-device keys.

### 3) Identity + immutability

Entities must have stable IDs across devices.

In the current implementation:

- `Site.identifier` is generated (UUID-like) at creation time.
- `Monitor.id` is generated (UUID-like) at creation time.

The application treats these IDs as immutable primary keys. Renaming a site or
monitor is implemented by updating the `name` field, not by changing the
identifier.

Notes:

- The add-site UI generates an identifier by default, but we do not rely on a
  centralized "registry". The uniqueness requirement is enforced by local
  validation and by treating identifier collisions as data corruption.

### 4) Tombstones

Deletions are expressed via explicit sync operations (tombstones) and are
retained until compaction.

In code this is represented as:

- `CloudSyncOperation` of kind `delete-entity`
- A `deleted` write key stored on the derived entity state

### 5) Versioning

- Sync **operations** include:
  - `syncSchemaVersion`
  - `deviceId`
  - monotonic `opId` per device
  - `timestamp` (epoch ms)

- Sync **snapshots** and the **manifest** include:
  - `syncSchemaVersion`
  - their own version fields (`snapshotVersion`, `manifestVersion`)

> Note: the current implementation does **not** include `appVersion` in the
> sync payload model. If we add it later, it should be treated as metadata for
> diagnostics/compatibility reporting, not as part of the deterministic merge.

Migration rules:

- Sync schema migrations must be additive or include deterministic transforms.
- Clients must refuse unknown future schema versions unless a compatibility plan exists.

## Conflict Resolution

### Strategy

V1 uses a deterministic state merge strategy (CRDT-like in outcome, but not a
general-purpose CRDT framework):

- **Last-write-wins per field** using the `CloudSyncWriteKey` ordering.
  In practice this is:
  1. higher `timestamp` wins
  2. tie-breaker: lexicographically higher `deviceId` wins
  3. tie-breaker (same device): higher `opId` wins
- This ensures determinism even when multiple devices write concurrently or
  remote objects are listed/applied in different orders.

Implementation detail:

- Operations are sorted deterministically before application.
- If two operations share the exact same write key (not expected in healthy
  clients), additional tie-breakers ensure the merge remains deterministic and
  idempotent.

### Special cases

- Arrays are treated as ordinary JSON values and are replaced by LWW when they
  are stored as fields.
- Settings are stored as per-key fields and follow LWW at the field level.
- Monitor history is not part of the sync domain in V1.

If we add true set/OR-Set semantics later (for example, for muting lists), it
must be implemented explicitly at the domain layer (typed operations), not by
assuming generic array union semantics.

### User-visible conflict surfacing

Even with LWW, some conflicts should be surfaced:

- Two devices rename the same monitor differently within a short window.
- Two devices change the same URL/host.

Conflict surfacing is deferred for the MVP.

The merge logic converges deterministically, but does not yet persist a
first-class conflict log for renderer display.

### Delete semantics (tombstones) and resurrection

Deletes are expressed via tombstones and follow deterministic ordering rules:

- A `delete-entity` operation is applied if its write key is newer than the
  latest known write for that entity (any field write or prior deletion).
- A `set-field` operation is ignored if the entity has a newer deletion
  tombstone.
- A `set-field` operation with a write key newer than the tombstone
  resurrects the entity (clears `deleted`) and then applies the field write.

This design makes merges order-independent and idempotent.

## Consequences

### Positive

- Enables true sync without a dedicated server.
- Deterministic merges prevent "works on my machine" state divergence.
- Operation log allows auditability and future improvements.

### Negative

- Requires introducing immutable IDs and migration effort.
- LWW can surprise users (newer edit wins). Conflict UI mitigates this.

## Implementation

High-level components (actual implementation):

- `shared/types/cloudSync.ts` (`CloudSyncOperation`, write keys, ordering)
- `shared/types/cloudSyncDomain.ts` (canonical site/monitor/settings payloads)
- `shared/types/cloudSyncManifest.ts` (`CloudSyncManifest`)
- `shared/types/cloudSyncSnapshot.ts` (`CloudSyncSnapshot`)
- `shared/types/cloudSyncBaseline.ts` (local baseline for diffing)
- `shared/utils/cloudSyncState.ts` (deterministic operation application)
- `electron/services/sync/SyncEngine.ts` (end-to-end sync cycle)
- `electron/services/sync/ProviderCloudSyncTransport.ts` (provider-backed storage)

### Maintenance operations: remote reset

To support switching encryption modes and cleaning up older sync artifacts,
we implement an explicit **remote sync reset** maintenance operation.

For safety, the UI performs a preflight preview step first:

- Count the number of remote objects under `sync/`.
- Display known device IDs from the remote manifest.
- Display a per-device breakdown of operation-log objects derived from op keys
  and flag mismatches between manifest devices and ops-derived devices.

The reset action is only enabled once the preview has been fetched.

- The operation sets `manifest.resetAt` to the current epoch timestamp.
- The sync engine ignores operation-log objects whose embedded `createdAtEpochMs`
  is older than `resetAt`.

This provides a safety net when remote deletion is best-effort (e.g. network
errors), ensuring old plaintext operation logs do not resurface after a reset.

### Device identity (deviceId)

Device identity is intentionally local and does not require enrollment.

- Each device generates and persists a `deviceId` under the settings key
  `cloud.sync.deviceId`.
- If the stored value is missing or invalid, the sync engine generates a new
  `crypto.randomUUID()` value and persists it.
- `deviceId` is not a user identifier and must not be repurposed for analytics
  or licensing.
- A device is "enrolled" in a provider folder implicitly by having provider
  credentials and writing operations under `sync/`.

If a user wants to force a new device identity, they can clear local app data
or disconnect/reconnect the provider (or we can add an explicit "regenerate
deviceId" maintenance action in the Cloud settings).

Store integration:

- Renderer stores emit “domain mutations” through a single service boundary.
- Electron main process is responsible for writing sync operations and applying remote changes.

History syncing:

- Default: off.
- Optional: on (capped and compressed).

## Testing & Validation

- Property tests for merge determinism (same inputs → same outputs).
- Integration tests simulating two devices with interleaved ops.
- Upgrade tests for sync schema migrations.

## Related ADRs

- [ADR-015: Cloud Sync and Remote Backup Providers](./ADR_015_CLOUD_SYNC_AND_REMOTE_BACKUP.md)
- [ADR-013: Data Portability & Backup/Restore](./ADR_013_DATA_PORTABILITY_AND_BACKUP.md)
- [ADR-009: Validation Strategy](./ADR_009_VALIDATION_STRATEGY.md)
- [ADR-005: IPC Communication Protocol](./ADR_005_IPC_COMMUNICATION_PROTOCOL.md)

## Review

- Next review: 2026-03-01 or before switching sync artifact encryption to be
  enabled by default.
