// @ts-check
// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair -- This file intentionally uses JSDoc types that trigger TSDoc warnings in this repo; disable the rule for the whole file.
/* eslint-disable @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types, tsdoc/syntax -- This file is a runtime TypeDoc renderer plugin loaded by Node; adding JSDoc type syntax triggers TSDoc brace warnings in this repo. */

/**
 * @file TypeDoc plugin which rewrites a repo-specific `path#Export` convention
 *   into TypeDoc's declaration-reference module source syntax: `path!Export`.
 *
 *   Why:
 *
 *   - In TypeDoc declaration references, `#` means "instance member" navigation.
 *   - `!` separates the _module source_ from the component path.
 *   - So `src/foo#bar` is interpreted as: navigate to `src/foo` in the current
 *       scope, then find instance member `bar` — which almost never exists.
 *
 *   This repository intentionally uses `path#Symbol` because VS Code can resolve
 *   it as a workspace link. TypeDoc cannot.
 *
 *   This plugin runs during conversion and adjusts link texts before TypeDoc's
 *   own link resolver executes, so we get valid internal links in generated
 *   docs while keeping the source comments unchanged for the IDE.
 */

import { Converter } from "typedoc";

import { convertHashLinksToBangLinksInComment } from "./hashToBangLinksCore.mjs";

// TypeDoc's built-in LinkResolverPlugin runs at priority -300. This plugin must
// run before it, so our priority must be > -300.
const RUN_BEFORE_LINK_RESOLVER_PRIORITY = 50;

/**
 * TypeDoc plugin entrypoint.
 *
 * @param {import("typedoc").Application} app
 */
export function load(app) {
    // Run before TypeDoc's built-in LinkResolverPlugin (priority -300).
    app.converter.on(
        Converter.EVENT_RESOLVE_END,
        (context) => {
            const { project } = context;
            const { reflections } = project;
            /** @type {Record<string, import("typedoc").Reflection>} */
            const reflectionMap = reflections;
            // Avoid Object.values allocation on large projects.
            for (const reflectionId in reflectionMap) {
                if (Object.hasOwn(reflectionMap, reflectionId)) {
                    const reflection =
                        /** @type {import("typedoc").Reflection} */ (
                            reflectionMap[reflectionId]
                        );
                    if (reflection.comment) {
                        convertHashLinksToBangLinksInComment(
                            reflection.comment
                        );
                    }
                }
            }
        },
        RUN_BEFORE_LINK_RESOLVER_PRIORITY
    );
}
