# IPC Automation Workflow

> **Last updated**: 2025-10-26 \
> **Audience**: Contributors who touch Electron IPC channels, preload bridges, or renderer event bindings.

Uptime Watcher 17.4.0 introduced a generation-first workflow for IPC contracts. Instead of hand-editing preload bridges and documentation, all authoritative channel metadata now lives in shared TypeScript schemas. The automation described below guarantees that the Electron main process, preload bridge, renderer typings, and published docs never drift apart.

---

## 1. Canonical Source of Truth

All IPC invoke channels and renderer event payloads are defined in:

- `shared/ipc/rendererEvents.ts` – enumerates renderer event channels and payload shapes.
- `shared/types/ipc.ts` – canonical invoke channel map used by both main-process handlers and renderer invokers.
- `shared/types/preload.ts` – maps typed invoke channels to preload bridge surfaces consumed by the renderer.

> ⚠️ **Important**: Update these shared definitions first. Manual edits to generated artifacts will be overwritten the next time the generator runs.

---

## 2. Available Scripts

```bash
npm run generate:ipc  # Rebuilds preload bridges + docs from the schema
npm run check:ipc      # Verifies generated artifacts match committed output
```

### 2.1 `npm run generate:ipc`

- Parses shared IPC definitions with `ts-morph`.
- Emits:
  - `shared/types/eventsBridge.ts` Reconciled bridge typings (listeners, emitters, payloads).
  - `docs/Architecture/generated/ipc-channel-inventory.md` Human-readable channel catalog.
  - Snapshot hashes embedded in generator comments to speed up drift detection.
- Applies project formatting via Prettier.
- Should be executed whenever channel names, payloads, or invoke handlers change.

### 2.2 `npm run check:ipc`

- Runs the generator in dry-run mode.
- Compares the newly generated output with the tracked files.
- Exits with code `1` if any diff is detected, making it suitable for CI gating.
- Emits contextual instructions so contributors know which command to run next.

> ✅ **CI Integration**: The lint workflow already invokes `npm run check:ipc`. Pull requests with mismatched artifacts will fail until `npm run generate:ipc` is rerun locally and committed.

---

## 3. Standard Workflow

1. **Edit schemas** in `shared/ipc/rendererEvents.ts` or related shared files.
2. **Regenerate artifacts**:
   ```bash
   npm run generate:ipc
   ```
3. **Review diffs** in `shared/types/eventsBridge.ts` and `docs/Architecture/generated/ipc-channel-inventory.md`.
4. **Commit all changed files** together with the source modification.
5. **Validate** locally:
   ```bash
   npm run check:ipc
   ```
   The command should exit cleanly without creating diffs.
6. **Run the default test/lint tasks** (`npm run lint:all`, `npm run test`) when touching contracts that affect runtime behavior.

---

## 4. Troubleshooting

| Symptom                                            | Cause                               | Fix                                                                              |
| -------------------------------------------------- | ----------------------------------- | -------------------------------------------------------------------------------- |
| `npm run check:ipc` fails on CI                    | Generated artifacts are stale       | Run `npm run generate:ipc`, commit the updated files, rerun checks               |
| Generator exits with `Cannot find module ts-morph` | Dependencies missing/outdated       | Run `npm install` (generator relies on dev dependencies)                         |
| Prettier formatting differs                        | Local Prettier version mismatched   | Run `npm run format` or ensure Prettier matches repo configuration               |
| New channel missing from docs                      | Schema not exported or wrong naming | Confirm additions to `RendererEventPayloadMap`/channel enums and rerun generator |

---

## 5. Contribution Guidelines

- **Batch related changes**: Schema, generated artifacts, and implementation updates should ship in the same pull request to maintain atomicity.
- **Avoid manual edits** to generated files. Instead, adjust inputs and rerun the script.
- **Record updates** in the changelog when channel behavior or payload shapes change.
- **Reference this guide** in pull requests so reviewers can validate the automation trail quickly.

---

## 6. Further Reading

- [Renderer Integration Guide](./RENDERER_INTEGRATION_GUIDE.md) – Channel usage patterns and migration checklist.
- [ADR 005: IPC Communication Protocol](../Architecture/ADRs/ADR_005_IPC_COMMUNICATION_PROTOCOL.md) – Architectural decisions and invariants.
- [Development Patterns Guide](../Architecture/Patterns/DEVELOPMENT_PATTERNS_GUIDE.md) – IPC handler registration best practices.

Need help? Drop questions in `#uptime-watcher-dev` with failing logs (`npm run check:ipc`) or open an issue describing the schema change alignment.
