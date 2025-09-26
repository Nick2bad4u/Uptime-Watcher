/**
 * Utility for stripping out props that React would warn about when applied to
 * DOM nodes.
 *
 * @remarks
 * Property-based component tests generate many synthetic props. Passing them
 * directly through mocked themed components frequently triggers React DOM
 * warnings about unsupported attributes. This helper keeps only the subset of
 * props that native elements can safely receive while still allowing event
 * handlers and accessibility attributes.
 */
const SAFE_PROPS = new Set<string>([
    "accept",
    "action",
    "alt",
    "autoComplete",
    "autoFocus",
    "checked",
    "className",
    "cols",
    "contentEditable",
    "defaultChecked",
    "defaultValue",
    "disabled",
    "draggable",
    "encType",
    "form",
    "formAction",
    "formEncType",
    "formMethod",
    "formNoValidate",
    "formTarget",
    "height",
    "href",
    "htmlFor",
    "id",
    "lang",
    "list",
    "max",
    "maxLength",
    "method",
    "min",
    "minLength",
    "multiple",
    "name",
    "pattern",
    "placeholder",
    "rel",
    "required",
    "role",
    "rows",
    "spellCheck",
    "src",
    "step",
    "style",
    "tabIndex",
    "target",
    "title",
    "translate",
    "type",
    "value",
    "width",
    "wrap",
]);

const SAFE_PREFIXES = ["data-", "aria-"];
const EVENT_HANDLER_PATTERN = /^on[A-Z]/u;

export type DomLikeProps = Record<string, unknown>;

/**
 * Filters a props bag down to DOM-safe attributes.
 *
 * @param props - Arbitrary props to sanitize.
 * @param additionalAllowed - Extra property names to retain for the specific
 *   element.
 *
 * @returns New props object containing only allowed attributes.
 */
export function sanitizeDomProps<Props extends DomLikeProps>(
    props: Props,
    additionalAllowed: readonly string[] = []
): Partial<Props> {
    if (!props) {
        return {} as Partial<Props>;
    }

    const allowed = new Set([...SAFE_PROPS, ...additionalAllowed]);
    const safeEntries = Object.entries(props).filter(([key, value]) => {
        if (typeof key !== "string") {
            return false;
        }

        if (value === undefined) {
            return false;
        }

        if (allowed.has(key)) {
            return true;
        }

        if (EVENT_HANDLER_PATTERN.test(key)) {
            return true;
        }

        return SAFE_PREFIXES.some((prefix) => key.startsWith(prefix));
    });

    return Object.fromEntries(safeEntries) as Partial<Props>;
}
