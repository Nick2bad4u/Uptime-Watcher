/**
 * ESLint guard preventing duplicate declarations of shared contract interfaces.
 *
 * @remarks
 * Ensures renderer and Electron layers import canonical DTO interfaces from the
 * shared package instead of redefining them locally. Add additional interface
 * names to the allowlist below as new shared contracts are formalized.
 */

const SHARED_CONTRACT_INTERFACE_NAMES = ["MonitorTypeOption"];

const buildRestrictedSyntaxEntries = () =>
    SHARED_CONTRACT_INTERFACE_NAMES.map((interfaceName) => ({
        message: `Do not redeclare the shared interface "${interfaceName}". Import it from @shared instead.`,
        selector: `TSInterfaceDeclaration[id.name='${interfaceName}']`,
    }));

export default {
    files: [
        "src/**/*.{ts,tsx}",
        "electron/**/*.{ts,tsx}",
        "docs/**/*.{ts,tsx}",
        "scripts/**/*.{ts,tsx}",
    ],
    ignores: ["shared/types/**/*", "**/*.d.ts"],
    name: "Shared Contract Interface Guard",
    rules: {
        "no-restricted-syntax": ["error", ...buildRestrictedSyntaxEntries()],
    },
};
