/**
 * Network monitor schema builders (port/ping/dns/ssl).
 *
 * @remarks
 * This module exports factory functions only. The public constants are defined
 * in `monitorSchemas.ts`.
 */

import type {
    BaseMonitorSchemaType,
    DnsMonitorSchemaType,
    PingMonitorSchemaType,
    PortMonitorSchemaType,
    SslMonitorSchemaType,
} from "@shared/types/schemaTypes";

import * as z from "zod";

import { isValidPort } from "./validatorUtils";

interface NetworkMonitorSchemaBaseArgs {
    readonly baseMonitorSchema: BaseMonitorSchemaType;
    readonly hostValidationSchema: z.ZodString;
}

/** Creates the port monitor schema. */
export function createPortMonitorSchema(
    args: NetworkMonitorSchemaBaseArgs
): PortMonitorSchemaType {
    return args.baseMonitorSchema
        .extend({
            host: args.hostValidationSchema,
            port: z
                .number()
                .refine(isValidPort, "Must be a valid port number (1-65535)"),
            type: z.literal("port"),
        })
        .strict();
}

/** Creates the ping monitor schema. */
export function createPingMonitorSchema(
    args: NetworkMonitorSchemaBaseArgs
): PingMonitorSchemaType {
    return args.baseMonitorSchema
        .extend({
            host: args.hostValidationSchema,
            type: z.literal("ping"),
        })
        .strict();
}

/** Creates the DNS monitor schema. */
export function createDnsMonitorSchema(
    args: NetworkMonitorSchemaBaseArgs
): DnsMonitorSchemaType {
    return args.baseMonitorSchema
        .extend({
            expectedValue: z.string().optional(),
            host: args.hostValidationSchema,
            recordType: z.enum([
                "A",
                "AAAA",
                "ANY",
                "CAA",
                "CNAME",
                "MX",
                "NAPTR",
                "NS",
                "PTR",
                "SOA",
                "SRV",
                "TLSA",
                "TXT",
            ]),
            type: z.literal("dns"),
        })
        .strict();
}

/** Creates the SSL monitor schema. */
export function createSslMonitorSchema(
    args: NetworkMonitorSchemaBaseArgs
): SslMonitorSchemaType {
    return args.baseMonitorSchema
        .extend({
            certificateWarningDays: z
                .number()
                .min(1, "Certificate warning threshold must be at least 1 day")
                .max(
                    365,
                    "Certificate warning threshold cannot exceed 365 days"
                ),
            host: args.hostValidationSchema,
            port: z
                .number()
                .refine(isValidPort, "Must be a valid port number (1-65535)"),
            type: z.literal("ssl"),
        })
        .strict();
}
