/**
 * Vitest setup for Storybook component tests.
 *
 * @remarks
 * Applies the Storybook preview annotations (decorators, parameters, globals)
 * and ensures the Electron preload bridge mock is available before tests run.
 * The Vitest addon consumes these annotations via the portable stories API to
 * execute stories as browser-based tests.
 */

import { setProjectAnnotations } from "@storybook/react";

import preview from "./preview";
import { installElectronAPIMock } from "./setup/electron-api-mock";

const annotations = preview as Parameters<typeof setProjectAnnotations>[0];

installElectronAPIMock();
setProjectAnnotations(annotations);
