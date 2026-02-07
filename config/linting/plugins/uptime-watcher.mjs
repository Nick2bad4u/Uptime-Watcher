/**
 * @remarks
 * Keep this file as the single stable import for consumers (e.g.
 * eslint.config.mjs), while keeping the plugin implementation self-contained
 * under `config/linting/plugins/uptime-watcher/` for easier extraction.
 *
 * @file Stable uptime-watcher ESLint plugin wrapper.
 */

export { default } from "eslint-plugin-uptime-watcher";
