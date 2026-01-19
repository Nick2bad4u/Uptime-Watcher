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

type GenericEmitWarning = (...emitArgs: unknown[]) => unknown;

const SUPPRESSED_WARNING_SIGNATURES = [
	"`--localstorage-file` was provided without a valid path",
] as const;

// Storybook tooling can enable Node's experimental web storage flags. When the
// local storage backing file is not configured, Node emits a warning that is
// irrelevant to our Storybook story tests. Suppress it to keep output focused.
// In Vitest browser mode, this file runs inside the browser context and
// `process` is not defined. In Node contexts, suppress the noisy warning.

if (typeof process !== "undefined" && typeof process.emitWarning === "function") {
	const originalEmitWarning = process.emitWarning.bind(
		process
	) as GenericEmitWarning;

	process.emitWarning = ((warning: unknown, ...args: unknown[]) => {
		let message = "";

		if (typeof warning === "string") {
			message = warning;
		} else if (warning instanceof Error) {
			const { message: errorMessage } = warning;
			message = errorMessage;
		}

		if (
			message !== "" &&
			SUPPRESSED_WARNING_SIGNATURES.some((fragment) =>
				message.includes(fragment)
			)
		) {
			return;
		}

		originalEmitWarning(warning, ...args);
	}) as typeof process.emitWarning;
}

const annotations = preview as Parameters<typeof setProjectAnnotations>[0];

installElectronAPIMock();
setProjectAnnotations(annotations);
