/**
 * Lightweight (non-Zod) constants for site field validation.
 *
 * @remarks
 * These constants exist so multiple layers (Zod schemas, IPC parameter
 * validators) can share identical constraints and messages without importing
 * the full schema graph.
 */

export const SITE_IDENTIFIER_MAX_LENGTH = 100;
export const SITE_NAME_MAX_LENGTH = 200;

export const SITE_IDENTIFIER_TOO_LONG_MESSAGE = "Site identifier too long";
export const SITE_NAME_TOO_LONG_MESSAGE = "Site name too long";

export const SITE_IDENTIFIER_REQUIRED_MESSAGE = "Site identifier is required";
export const SITE_NAME_REQUIRED_MESSAGE = "Site name is required";
