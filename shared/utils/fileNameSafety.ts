const WINDOWS_RESERVED_FILE_BASENAMES = new Set([
    "aux",
    "com1",
    "com2",
    "com3",
    "com4",
    "com5",
    "com6",
    "com7",
    "com8",
    "com9",
    "con",
    "lpt1",
    "lpt2",
    "lpt3",
    "lpt4",
    "lpt5",
    "lpt6",
    "lpt7",
    "lpt8",
    "lpt9",
    "nul",
    "prn",
]);

/**
 * Returns true when a filename basename is a Windows reserved device name.
 */
export function isWindowsReservedFileBasename(baseName: string): boolean {
    return WINDOWS_RESERVED_FILE_BASENAMES.has(baseName.toLowerCase());
}
