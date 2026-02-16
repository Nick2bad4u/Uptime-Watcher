import { ESLintUtils } from "@typescript-eslint/utils";

const RULE_DOCS_URL_BASE =
    "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher-type-utils/docs/rules";

/**
 * Creates a typed rule with repo-local docs URLs.
 */
const createRuleCreator = ESLintUtils.RuleCreator;

export const createTypedRule = /** @type {any} */ (
    createRuleCreator((ruleName) => `${RULE_DOCS_URL_BASE}/${ruleName}.md`)
);

/**
 * Retrieves parser services and type checker for typed rules.
 *
 * @param {import("@typescript-eslint/utils").TSESLint.RuleContext<string, readonly unknown[]>} context
 */
export const getTypedRuleServices = (context) => {
    const parserServices = ESLintUtils.getParserServices(context, true);

    if (!parserServices.program) {
        throw new Error(
            "Typed rule requires parserServices.program; ensure projectService is enabled for this lint run."
        );
    }

    return {
        checker: parserServices.program.getTypeChecker(),
        parserServices,
    };
};

/**
 * @param {import("typescript").TypeChecker} checker
 * @param {import("typescript").Type} sourceType
 * @param {import("typescript").Type} targetType
 */
export const isTypeAssignableTo = (checker, sourceType, targetType) => {
    if (typeof checker.isTypeAssignableTo === "function") {
        return checker.isTypeAssignableTo(sourceType, targetType);
    }

    return checker.typeToString(sourceType) === checker.typeToString(targetType);
};

/**
 * @param {{
 *   checker: import("typescript").TypeChecker;
 *   signature: import("typescript").Signature | null | undefined;
 *   index: number;
 *   location: import("typescript").Node;
 * }} args
 *
 * @returns {import("typescript").Type | undefined}
 */
export const getSignatureParameterTypeAt = (args) => {
    const { checker, index, location, signature } = args;

    const symbol = signature?.parameters[index];
    if (!symbol) {
        return;
    }

    return checker.getTypeOfSymbolAtLocation(symbol, location);
};

/**
 * @param {string} filePath
 */
export const isTestFilePath = (filePath) => {
    const normalizedPath = filePath.replaceAll("\\", "/").toLowerCase();

    return (
        normalizedPath.includes("/__tests__/") ||
        normalizedPath.includes("/tests/") ||
        normalizedPath.endsWith(".test.ts") ||
        normalizedPath.endsWith(".test.tsx") ||
        normalizedPath.endsWith(".test.js") ||
        normalizedPath.endsWith(".test.jsx") ||
        normalizedPath.endsWith(".spec.ts") ||
        normalizedPath.endsWith(".spec.tsx") ||
        normalizedPath.endsWith(".spec.js") ||
        normalizedPath.endsWith(".spec.jsx") ||
        normalizedPath.endsWith(".test.mts") ||
        normalizedPath.endsWith(".spec.mts") ||
        normalizedPath.endsWith(".test.cts") ||
        normalizedPath.endsWith(".spec.cts")
    );
};
