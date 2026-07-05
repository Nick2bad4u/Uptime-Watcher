import { createNullPrototypeObject } from "@shared/utils/objectSafety";
import * as z from "zod";

function getEnumerableOwnDataEntries(
    value: unknown
): [string, unknown][] | null {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
        return null;
    }

    const entries: [string, unknown][] = [];
    for (const key of Object.keys(value)) {
        const descriptor = Object.getOwnPropertyDescriptor(value, key);
        if (descriptor?.enumerable && "value" in descriptor) {
            entries.push([key, descriptor.value]);
        }
    }

    return entries;
}

/**
 * Creates a record schema that treats dangerous object keys as data.
 *
 * @remarks
 * Zod record parsing can lose special keys such as `__proto__` when cloning
 * into ordinary objects. Cloud sync payloads need those keys to survive as
 * own data properties, because settings keys and entity IDs are user data.
 */
export function createOwnDataRecordSchema<T>(
    valueSchema: z.ZodType<T>,
    keySchema: z.ZodType<string> = z.string().min(1)
): z.ZodType<Record<string, T>> {
    return z
        .custom<Record<string, unknown>>(
            (value) => getEnumerableOwnDataEntries(value) !== null,
            "Expected a record"
        )
        .superRefine((value, ctx) => {
            const entries = getEnumerableOwnDataEntries(value);
            if (!entries) {
                return;
            }

            for (const [key, entry] of entries) {
                const parsedKey = keySchema.safeParse(key);
                if (!parsedKey.success) {
                    for (const issue of parsedKey.error.issues) {
                        ctx.addIssue({
                            code: "custom",
                            message: issue.message,
                            path: [key],
                        });
                    }
                }

                const parsed = valueSchema.safeParse(entry);
                if (!parsed.success) {
                    for (const issue of parsed.error.issues) {
                        ctx.addIssue({
                            code: "custom",
                            message: issue.message,
                            path: [
                                key,
                                ...issue.path,
                            ],
                        });
                    }
                }
            }
        })
        .transform((value) => {
            const result = createNullPrototypeObject<Record<string, T>>();
            for (const [key, entry] of getEnumerableOwnDataEntries(value) ??
                []) {
                Object.defineProperty(result, key, {
                    configurable: true,
                    enumerable: true,
                    value: valueSchema.parse(entry),
                    writable: true,
                });
            }

            return result;
        });
}
