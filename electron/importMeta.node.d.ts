/**
 * Electron main-process TypeScript shim for Node.js `import.meta` extensions.
 *
 * @remarks
 * Node.js v25+ (and recent Electron builds) provide `import.meta.dirname` and
 * `import.meta.filename` for ESM modules.
 *
 * TypeScript's standard library typings currently do not include these
 * properties on `ImportMeta`, which forces unnecessary type assertions or
 * eslint-disable comments.
 *
 * This shim is intentionally scoped to the Electron main-process project (via
 * `tsconfig.electron.json` including the `electron/**` folder) so
 * renderer/browser code is not tempted to rely on Node-only `import.meta`
 * properties.
 */

declare global {
    interface ImportMeta {
        /** Absolute directory path of the current module. */
        readonly dirname: string;

        /** Absolute filename path of the current module. */
        readonly filename: string;
    }
}

/**
 * Marker export to ensure this declaration file is treated as a module.
 *
 * @remarks
 * We intentionally avoid `export {}` because the repo enables
 * `@typescript-eslint/no-useless-empty-export` with autofix.
 */
export type UptimeWatcherImportMetaNodeShim = true;
