import type { PartialDeep, UnknownRecord  } from "type-fest";

import { objectEntries, objectHasIn, safeCastTo   } from "ts-extras";

import type { ElectronAPI } from "../../types";

type PlainObject = UnknownRecord;

const isPlainObject = (value: unknown): value is PlainObject => {
    if (value === null || typeof value !== "object") {
        return false;
    }

    if (Array.isArray(value)) {
        return false;
    }

    return Object.getPrototypeOf(value) === Object.prototype;
};

const shallowCloneApi = (api: ElectronAPI): ElectronAPI => {
    const clone: PlainObject = { ...api };

    for (const [key, value] of objectEntries(clone)) {
        if (isPlainObject(value)) {
            clone[key] = { ...value };
        }
    }

    return clone as unknown as ElectronAPI;
};

const mergeInto = (target: PlainObject, source: PlainObject): void => {
    for (const [key, value] of objectEntries(source)) {
        if (value === undefined) {
            continue;
        }

        const current = target[key];

        if (isPlainObject(current) && isPlainObject(value)) {
            mergeInto(current, value);
        } else {
            target[key] = value;
        }
    }
};

/**
 * Installs a test-local `window.electronAPI` mock.
 *
 * @remarks
 * The global test setup installs a canonical `electronAPI` mock. Some suites
 * still override it ad-hoc, which can leak changes into later tests. This
 * helper provides a consistent pattern:
 *
 * - Shallow-clone the existing API surface,
 * - Apply deep overrides,
 * - Install the clone into `globalThis` + `window`,
 * - Return a restore function.
 */
export const installElectronApiMock = (
    overrides: PartialDeep<ElectronAPI> = {},
    options: {
        /**
         * Ensure `globalThis.window` exists.
         *
         * @remarks
         * Some Vitest suites run in a non-DOM environment. Production code
         * accesses `window.electronAPI`, so those suites historically created a
         * fake `window` object. This option centralizes that behavior and
         * restores the original global after the test.
         */
        ensureWindow?: boolean;
    } = {}
): { mock: ElectronAPI; restore: () => void } => {
    const original = safeCastTo<| ElectronAPI
        | undefined>(Reflect.get(globalThis, "electronAPI"));

    if (!original) {
        throw new Error(
            "installElectronApiMock requires the global test setup to install globalThis.electronAPI"
        );
    }

    const mock = shallowCloneApi(original);
    mergeInto(
        mock as unknown as PlainObject,
        overrides
    );

    const isHadWindow = objectHasIn(globalThis, "window");
    const isCreatedWindow = options.ensureWindow === true && !isHadWindow;

    if (isCreatedWindow) {
        Object.defineProperty(globalThis, "window", {
            configurable: true,
            value: {},
            writable: true,
        });
    }

    const windowRef = Reflect.get(globalThis, "window");

    Object.defineProperty(globalThis, "electronAPI", {
        configurable: true,
        value: mock,
        writable: true,
    });

    if (windowRef !== undefined && typeof windowRef === "object") {
        Object.defineProperty(windowRef, "electronAPI", {
            configurable: true,
            value: mock,
            writable: true,
        });
    }

    const restore = (): void => {
        Object.defineProperty(globalThis, "electronAPI", {
            configurable: true,
            value: original,
            writable: true,
        });

        const currentWindowRef = Reflect.get(globalThis, "window");
        if (
            currentWindowRef !== undefined &&
            typeof currentWindowRef === "object"
        ) {
            Object.defineProperty(currentWindowRef, "electronAPI", {
                configurable: true,
                value: original,
                writable: true,
            });
        }

        if (isCreatedWindow) {
            delete (safeCastTo<UnknownRecord>(globalThis))["window"];
        }
    };

    return { mock, restore };
};
