/**
 * DNS record parsing helpers.
 *
 * @remarks
 * `DnsMonitor` uses Node's `node:dns/promises` resolvers, which return
 * heterogenous result shapes depending on record type. This module centralizes
 * the parsing/formatting logic so it doesn't bloat the monitor service and so
 * record-specific rules remain consistent across refactors.
 *
 * @public
 */

import { isRecord } from "@shared/utils/typeHelpers";

/** Parsed/normalized DNS record data for display and verification. */
export interface ParsedDnsRecords {
    /** Values that can be compared against an `expectedValue` string. */
    readonly actualValues: readonly string[];
    /** Human-readable summary for UI/logging. */
    readonly details: string;
    /** Whether the resolver returned at least one record (or equivalent). */
    readonly hasRecords: boolean;
    /** Whether to skip `expectedValue` checks for this record type. */
    readonly skipExpectedValueCheck: boolean;
}

const isString = (value: unknown): value is string => typeof value === "string";

const pickNumber = (
    primary: unknown,
    fallback: unknown
): number | undefined => {
    if (typeof primary === "number") {
        return primary;
    }

    if (typeof fallback === "number") {
        return fallback;
    }

    return undefined;
};

const parseAddressRecords = (
    result: unknown,
    recordType: string
): ParsedDnsRecords => {
    if (!Array.isArray(result)) {
        return {
            actualValues: [],
            details: `No ${recordType} records found`,
            hasRecords: false,
            skipExpectedValueCheck: false,
        };
    }

    const actualValues = result.filter(isString);
    return {
        actualValues,
        details: `${recordType} records: ${actualValues.join(", ")}`,
        hasRecords: actualValues.length > 0,
        skipExpectedValueCheck: false,
    };
};

const parseAnyRecords = (result: unknown): ParsedDnsRecords => {
    if (!Array.isArray(result)) {
        return {
            actualValues: [],
            details: "No ANY records found",
            hasRecords: false,
            skipExpectedValueCheck: true,
        };
    }

    const anyRecords = result.filter(isRecord);
    return {
        actualValues: anyRecords.map((record) => JSON.stringify(record)),
        details: `ANY records (${anyRecords.length} items)`,
        // Preserve legacy behavior: ANY success is based on the raw array size.
        hasRecords: result.length > 0,
        skipExpectedValueCheck: true,
    };
};

const parseCaaRecords = (result: unknown): ParsedDnsRecords => {
    if (!Array.isArray(result)) {
        return {
            actualValues: [],
            details: "No CAA records found",
            hasRecords: false,
            skipExpectedValueCheck: false,
        };
    }

    const caaRecords = result.filter(isRecord);
    const actualValues = caaRecords.flatMap((record) => {
        const { iodef, issue } = record;
        if (typeof issue === "string") {
            return [issue];
        }
        if (typeof iodef === "string") {
            return [iodef];
        }
        return [];
    });

    return {
        actualValues,
        details: `CAA records: ${caaRecords.length}`,
        hasRecords: actualValues.length > 0,
        skipExpectedValueCheck: false,
    };
};

const parseCnameRecords = (result: unknown): ParsedDnsRecords => {
    if (!Array.isArray(result) || result.length === 0) {
        return {
            actualValues: [],
            details: "No CNAME records found",
            hasRecords: false,
            skipExpectedValueCheck: false,
        };
    }

    const actualValues = result.filter(isString);
    return {
        actualValues,
        details:
            actualValues.length > 0
                ? `CNAME record: ${actualValues[0]}`
                : "No CNAME records found",
        hasRecords: actualValues.length > 0,
        skipExpectedValueCheck: false,
    };
};

const parseMxRecords = (result: unknown): ParsedDnsRecords => {
    if (!Array.isArray(result)) {
        return {
            actualValues: [],
            details: "No MX records found",
            hasRecords: false,
            skipExpectedValueCheck: false,
        };
    }

    const mxRecords = result.filter(isRecord).flatMap((record) => {
        const { exchange, priority } = record;
        if (
            typeof exchange === "string" &&
            typeof priority === "number" &&
            Number.isFinite(priority)
        ) {
            return [{ exchange, priority }];
        }
        return [];
    });

    const formattedRecords = mxRecords
        .map((record) => `${record.priority} ${record.exchange}`)
        .join(", ");

    const actualValues = mxRecords.map((record) => record.exchange);
    return {
        actualValues,
        details: `MX records: ${formattedRecords}`,
        hasRecords: actualValues.length > 0,
        skipExpectedValueCheck: false,
    };
};

const parseNaptrRecords = (result: unknown): ParsedDnsRecords => {
    if (!Array.isArray(result)) {
        return {
            actualValues: [],
            details: "No NAPTR records found",
            hasRecords: false,
            skipExpectedValueCheck: false,
        };
    }

    const naptr = result.filter(isRecord).flatMap((record) => {
        const { flags, regexp, replacement, service } = record;
        if (
            typeof flags === "string" &&
            typeof regexp === "string" &&
            typeof replacement === "string" &&
            typeof service === "string"
        ) {
            return [{ flags, regexp, replacement, service }];
        }
        return [];
    });

    const actualValues = naptr.map((record) => record.replacement);
    return {
        actualValues,
        details: `NAPTR records: ${naptr
            .map(
                (record) =>
                    `${record.flags} ${record.service} ${record.replacement}`
            )
            .join(", ")}`,
        hasRecords: actualValues.length > 0,
        skipExpectedValueCheck: false,
    };
};

const parseSoaRecord = (result: unknown): ParsedDnsRecords => {
    if (!isRecord(result)) {
        return {
            actualValues: [],
            details: "No SOA record found",
            hasRecords: false,
            skipExpectedValueCheck: false,
        };
    }

    const { hostmaster, nsname, serial } = result;
    if (
        typeof hostmaster !== "string" ||
        typeof nsname !== "string" ||
        typeof serial !== "number" ||
        !Number.isFinite(serial)
    ) {
        return {
            actualValues: [],
            details: "No SOA record found",
            hasRecords: false,
            skipExpectedValueCheck: false,
        };
    }

    const actualValues = [nsname, hostmaster];
    return {
        actualValues,
        details: `SOA: ${nsname} ${hostmaster} (serial ${serial})`,
        hasRecords: true,
        skipExpectedValueCheck: false,
    };
};

const parseSrvRecords = (result: unknown): ParsedDnsRecords => {
    if (!Array.isArray(result)) {
        return {
            actualValues: [],
            details: "No SRV records found",
            hasRecords: false,
            skipExpectedValueCheck: false,
        };
    }

    const srvRecords = result.filter(isRecord).flatMap((record) => {
        const { name, port, priority, weight } = record;
        if (
            typeof name === "string" &&
            typeof port === "number" &&
            Number.isFinite(port) &&
            typeof priority === "number" &&
            Number.isFinite(priority) &&
            typeof weight === "number" &&
            Number.isFinite(weight)
        ) {
            return [{ name, port, priority, weight }];
        }
        return [];
    });

    const formattedRecords = srvRecords
        .map(
            (record) =>
                `${record.priority} ${record.weight} ${record.port} ${record.name}`
        )
        .join(", ");

    const actualValues = srvRecords.map((record) => record.name);
    return {
        actualValues,
        details: `SRV records: ${formattedRecords}`,
        hasRecords: actualValues.length > 0,
        skipExpectedValueCheck: false,
    };
};

const parseTlsaRecords = (result: unknown): ParsedDnsRecords => {
    if (!Array.isArray(result)) {
        return {
            actualValues: [],
            details: "No TLSA records found",
            hasRecords: false,
            skipExpectedValueCheck: false,
        };
    }

    const tlsa = result.filter(isRecord).flatMap((record) => {
        const { certUsage, match, matchingType, selector, usage } = record;

        const resolvedCertUsage = pickNumber(certUsage, usage);
        const resolvedMatch = pickNumber(match, matchingType);
        if (
            typeof resolvedCertUsage === "number" &&
            typeof resolvedMatch === "number" &&
            typeof selector === "number"
        ) {
            return [
                {
                    certUsage: resolvedCertUsage,
                    match: resolvedMatch,
                    selector,
                },
            ];
        }
        return [];
    });

    const actualValues = tlsa.map(
        (record) => `${record.certUsage}:${record.selector}:${record.match}`
    );

    return {
        actualValues,
        details: `TLSA records: ${tlsa.length}`,
        hasRecords: actualValues.length > 0,
        skipExpectedValueCheck: false,
    };
};

const parseTxtRecords = (result: unknown): ParsedDnsRecords => {
    if (!Array.isArray(result)) {
        return {
            actualValues: [],
            details: "No TXT records found",
            hasRecords: false,
            skipExpectedValueCheck: false,
        };
    }

    const txtRecords = result.filter((entry): entry is unknown[] =>
        Array.isArray(entry)
    );
    const flatRecords = txtRecords.flatMap((entry) => entry.filter(isString));
    return {
        actualValues: flatRecords,
        details: `TXT records: ${flatRecords.join(", ")}`,
        hasRecords: flatRecords.length > 0,
        skipExpectedValueCheck: false,
    };
};

const parseUnknownRecords = (recordType: string): ParsedDnsRecords => ({
    actualValues: [],
    details: `Unknown record type: ${recordType}`,
    hasRecords: false,
    skipExpectedValueCheck: false,
});

const DNS_RECORD_PARSERS: Readonly<
    Record<string, (result: unknown, recordType: string) => ParsedDnsRecords>
> = {
    A: parseAddressRecords,
    AAAA: parseAddressRecords,
    ANY: (result) => parseAnyRecords(result),
    CAA: (result) => parseCaaRecords(result),
    CNAME: (result) => parseCnameRecords(result),
    MX: (result) => parseMxRecords(result),
    NAPTR: (result) => parseNaptrRecords(result),
    NS: (result) => parseAddressRecords(result, "NS"),
    PTR: (result) => parseAddressRecords(result, "PTR"),
    SOA: (result) => parseSoaRecord(result),
    SRV: (result) => parseSrvRecords(result),
    TLSA: (result) => parseTlsaRecords(result),
    TXT: (result) => parseTxtRecords(result),
} as const;

/**
 * Parses the resolver output for a DNS record type.
 *
 * @remarks
 * This is intentionally tolerant of unexpected result shapes because DNS
 * resolvers can vary across Node versions and record types.
 */
export function parseDnsResolutionResult(
    result: unknown,
    recordType: string
): ParsedDnsRecords {
    const recordTypeUpper = recordType.toUpperCase();
    const parser = DNS_RECORD_PARSERS[recordTypeUpper];
    return parser
        ? parser(result, recordTypeUpper)
        : parseUnknownRecords(recordType);
}
