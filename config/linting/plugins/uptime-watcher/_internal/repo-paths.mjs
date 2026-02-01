/**
 * @file Shared repository path constants for uptime-watcher ESLint rules.
 */

import * as path from "node:path";
import { fileURLToPath } from "node:url";

import { normalizePath } from "./path-utils.mjs";

/**
 * Absolute path to the repository root.
 *
 * @remarks
 * Derived relative to this module so the rules stay portable when the workspace
 * is relocated.
 */
export const REPO_ROOT = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    "..",
    "..",
    "..",
    ".."
);

export const SHARED_DIR = path.resolve(REPO_ROOT, "shared");
export const NORMALIZED_SHARED_DIR = normalizePath(SHARED_DIR);

export const SRC_DIR = path.resolve(REPO_ROOT, "src");
export const NORMALIZED_SRC_DIR = normalizePath(SRC_DIR);

export const ELECTRON_DIR = path.resolve(REPO_ROOT, "electron");
export const NORMALIZED_ELECTRON_DIR = normalizePath(ELECTRON_DIR);
