/**
 * IPC payload limits shared across renderer, preload, and main-process code.
 */

/**
 * Maximum UTF-8 byte length accepted for clipboard text transported over IPC.
 */
export const MAX_IPC_CLIPBOARD_TEXT_BYTES: number = 5 * 1024 * 1024;
