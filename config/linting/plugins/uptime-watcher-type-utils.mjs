/**
 * @remarks
 * Stable import wrapper for the internal `uptime-watcher-type-utils` plugin.
 *
 * @file Stable uptime-watcher type-utils ESLint plugin wrapper.
 */

/* eslint-disable unicorn/prevent-abbreviations, import-x/no-relative-packages -- Wrapper filename and local relative import are intentional for plugin entrypoint stability. */
export { default } from "./uptime-watcher-type-utils/plugin.mjs";
/* eslint-enable unicorn/prevent-abbreviations, import-x/no-relative-packages */
