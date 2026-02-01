/**
 * @file Rule: no-redeclare-shared-contract-interfaces
 *
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs`.
 */

/**
 * ESLint rule preventing redeclaration of canonical shared contract
 * interfaces.
 *
 * @remarks
 * This helps ensure Electron and renderer layers import the shared contracts
 * rather than drifting out of sync.
 */
export const noRedeclareSharedContractInterfacesRule = {
    /**
     * @param {{ report: (arg0: { node: any; messageId: string; data: { name: any; }; }) => void; }} context
     */
    create(context) {
        const interfaceNames = new Set([
            "MonitorTypeOption",
        ]);

        return {
            /**
             * @param {{id: any}} node
             */
            TSInterfaceDeclaration(node) {
                const id = node?.id;
                if (!id || id.type !== "Identifier") {
                    return;
                }

                if (!interfaceNames.has(id.name)) {
                    return;
                }

                context.report({
                    data: { name: id.name },
                    messageId: "noRedeclare",
                    node: id,
                });
            },
        };
    },

    meta: {
        type: "problem",
        docs: {
            description:
                "disallow redeclaring canonical shared contract interfaces; import them from @shared instead",
            recommended: true,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/no-redeclare-shared-contract-interfaces.md",
        },
        schema: [],
        messages: {
            noRedeclare:
                "Do not redeclare '{{name}}'. Import it from @shared instead.",
        },
    },
};
