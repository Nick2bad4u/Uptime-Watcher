/**
 * @file Stable uptime-watcher ESLint plugin wrapper.
 *
 * @remarks
 * Keep this file as the single stable import for consumers (e.g.
 * eslint.config.mjs), while keeping the plugin implementation self-contained
 * under `config/linting/plugins/uptime-watcher/` for easier extraction.
 */

export { default } from "./uptime-watcher/plugin.mjs";
