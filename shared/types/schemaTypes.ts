/**
 * Zod schema type definitions for validation schemas.
 *
 * @remarks
 * These interfaces define the explicit types for Zod schemas used in
 * validation. They provide clean type annotations for isolated declarations
 * while keeping the schema definitions readable.
 *
 * @packageDocumentation
 */

import type * as z from "zod";

/**
 * Type definition for base monitor schema.
 *
 * @public
 */
export type BaseMonitorSchemaType = z.ZodObject<{
    checkInterval: z.ZodNumber;
    id: z.ZodString;
    lastChecked: z.ZodOptional<z.ZodDate>;
    monitoring: z.ZodBoolean;
    responseTime: z.ZodNumber;
    retryAttempts: z.ZodNumber;
    status: z.ZodEnum<{
        down: "down";
        paused: "paused";
        pending: "pending";
        up: "up";
    }>;
    timeout: z.ZodNumber;
    type: z.ZodEnum<{
        dns: "dns";
        http: "http";
        ping: "ping";
        port: "port";
    }>;
}>;

/**
 * Type definition for HTTP monitor schema.
 *
 * @public
 */
export type HttpMonitorSchemaType = z.ZodObject<{
    checkInterval: z.ZodNumber;
    id: z.ZodString;
    lastChecked: z.ZodOptional<z.ZodDate>;
    monitoring: z.ZodBoolean;
    responseTime: z.ZodNumber;
    retryAttempts: z.ZodNumber;
    status: z.ZodEnum<{
        down: "down";
        paused: "paused";
        pending: "pending";
        up: "up";
    }>;
    timeout: z.ZodNumber;
    type: z.ZodLiteral<"http">;
    url: z.ZodString;
}>;

/**
 * Type definition for monitor discriminated union schema.
 *
 * @public
 */
export type MonitorSchemaType = z.ZodDiscriminatedUnion<
    [
        z.ZodObject<{
            checkInterval: z.ZodNumber;
            id: z.ZodString;
            lastChecked: z.ZodOptional<z.ZodDate>;
            monitoring: z.ZodBoolean;
            responseTime: z.ZodNumber;
            retryAttempts: z.ZodNumber;
            status: z.ZodEnum<{
                down: "down";
                paused: "paused";
                pending: "pending";
                up: "up";
            }>;
            timeout: z.ZodNumber;
            type: z.ZodLiteral<"http">;
            url: z.ZodString;
        }>,
        z.ZodObject<{
            checkInterval: z.ZodNumber;
            host: z.ZodString;
            id: z.ZodString;
            lastChecked: z.ZodOptional<z.ZodDate>;
            monitoring: z.ZodBoolean;
            port: z.ZodNumber;
            responseTime: z.ZodNumber;
            retryAttempts: z.ZodNumber;
            status: z.ZodEnum<{
                down: "down";
                paused: "paused";
                pending: "pending";
                up: "up";
            }>;
            timeout: z.ZodNumber;
            type: z.ZodLiteral<"port">;
        }>,
        z.ZodObject<{
            checkInterval: z.ZodNumber;
            host: z.ZodString;
            id: z.ZodString;
            lastChecked: z.ZodOptional<z.ZodDate>;
            monitoring: z.ZodBoolean;
            responseTime: z.ZodNumber;
            retryAttempts: z.ZodNumber;
            status: z.ZodEnum<{
                down: "down";
                paused: "paused";
                pending: "pending";
                up: "up";
            }>;
            timeout: z.ZodNumber;
            type: z.ZodLiteral<"ping">;
        }>,
        z.ZodObject<{
            checkInterval: z.ZodNumber;
            expectedValue: z.ZodOptional<z.ZodString>;
            host: z.ZodString;
            id: z.ZodString;
            lastChecked: z.ZodOptional<z.ZodDate>;
            monitoring: z.ZodBoolean;
            recordType: z.ZodEnum<{
                A: "A";
                AAAA: "AAAA";
                ANY: "ANY";
                CAA: "CAA";
                CNAME: "CNAME";
                MX: "MX";
                NAPTR: "NAPTR";
                NS: "NS";
                PTR: "PTR";
                SOA: "SOA";
                SRV: "SRV";
                TLSA: "TLSA";
                TXT: "TXT";
            }>;
            responseTime: z.ZodNumber;
            retryAttempts: z.ZodNumber;
            status: z.ZodEnum<{
                down: "down";
                paused: "paused";
                pending: "pending";
                up: "up";
            }>;
            timeout: z.ZodNumber;
            type: z.ZodLiteral<"dns">;
        }>,
    ]
>;

/**
 * Type definition for ping monitor schema.
 *
 * @public
 */
export type PingMonitorSchemaType = z.ZodObject<{
    checkInterval: z.ZodNumber;
    host: z.ZodString;
    id: z.ZodString;
    lastChecked: z.ZodOptional<z.ZodDate>;
    monitoring: z.ZodBoolean;
    responseTime: z.ZodNumber;
    retryAttempts: z.ZodNumber;
    status: z.ZodEnum<{
        down: "down";
        paused: "paused";
        pending: "pending";
        up: "up";
    }>;
    timeout: z.ZodNumber;
    type: z.ZodLiteral<"ping">;
}>;

/**
 * Type definition for DNS monitor schema.
 *
 * @public
 */
export type DnsMonitorSchemaType = z.ZodObject<{
    checkInterval: z.ZodNumber;
    expectedValue: z.ZodOptional<z.ZodString>;
    host: z.ZodString;
    id: z.ZodString;
    lastChecked: z.ZodOptional<z.ZodDate>;
    monitoring: z.ZodBoolean;
    recordType: z.ZodEnum<{
        A: "A";
        AAAA: "AAAA";
        ANY: "ANY";
        CAA: "CAA";
        CNAME: "CNAME";
        MX: "MX";
        NAPTR: "NAPTR";
        NS: "NS";
        PTR: "PTR";
        SOA: "SOA";
        SRV: "SRV";
        TLSA: "TLSA";
        TXT: "TXT";
    }>;
    responseTime: z.ZodNumber;
    retryAttempts: z.ZodNumber;
    status: z.ZodEnum<{
        down: "down";
        paused: "paused";
        pending: "pending";
        up: "up";
    }>;
    timeout: z.ZodNumber;
    type: z.ZodLiteral<"dns">;
}>;

/**
 * Type definition for port monitor schema.
 *
 * @public
 */
export type PortMonitorSchemaType = z.ZodObject<{
    checkInterval: z.ZodNumber;
    host: z.ZodString;
    id: z.ZodString;
    lastChecked: z.ZodOptional<z.ZodDate>;
    monitoring: z.ZodBoolean;
    port: z.ZodNumber;
    responseTime: z.ZodNumber;
    retryAttempts: z.ZodNumber;
    status: z.ZodEnum<{
        down: "down";
        paused: "paused";
        pending: "pending";
        up: "up";
    }>;
    timeout: z.ZodNumber;
    type: z.ZodLiteral<"port">;
}>;

/**
 * Type definition for site schema.
 *
 * @public
 */
export type SiteSchemaType = z.ZodObject<{
    identifier: z.ZodString;
    monitoring: z.ZodBoolean;
    monitors: z.ZodArray<
        z.ZodDiscriminatedUnion<
            [
                z.ZodObject<{
                    checkInterval: z.ZodNumber;
                    id: z.ZodString;
                    lastChecked: z.ZodOptional<z.ZodDate>;
                    monitoring: z.ZodBoolean;
                    responseTime: z.ZodNumber;
                    retryAttempts: z.ZodNumber;
                    status: z.ZodEnum<{
                        down: "down";
                        paused: "paused";
                        pending: "pending";
                        up: "up";
                    }>;
                    timeout: z.ZodNumber;
                    type: z.ZodLiteral<"http">;
                    url: z.ZodString;
                }>,
                z.ZodObject<{
                    checkInterval: z.ZodNumber;
                    host: z.ZodString;
                    id: z.ZodString;
                    lastChecked: z.ZodOptional<z.ZodDate>;
                    monitoring: z.ZodBoolean;
                    port: z.ZodNumber;
                    responseTime: z.ZodNumber;
                    retryAttempts: z.ZodNumber;
                    status: z.ZodEnum<{
                        down: "down";
                        paused: "paused";
                        pending: "pending";
                        up: "up";
                    }>;
                    timeout: z.ZodNumber;
                    type: z.ZodLiteral<"port">;
                }>,
                z.ZodObject<{
                    checkInterval: z.ZodNumber;
                    host: z.ZodString;
                    id: z.ZodString;
                    lastChecked: z.ZodOptional<z.ZodDate>;
                    monitoring: z.ZodBoolean;
                    responseTime: z.ZodNumber;
                    retryAttempts: z.ZodNumber;
                    status: z.ZodEnum<{
                        down: "down";
                        paused: "paused";
                        pending: "pending";
                        up: "up";
                    }>;
                    timeout: z.ZodNumber;
                    type: z.ZodLiteral<"ping">;
                }>,
                z.ZodObject<{
                    checkInterval: z.ZodNumber;
                    expectedValue: z.ZodOptional<z.ZodString>;
                    host: z.ZodString;
                    id: z.ZodString;
                    lastChecked: z.ZodOptional<z.ZodDate>;
                    monitoring: z.ZodBoolean;
                    recordType: z.ZodEnum<{
                        A: "A";
                        AAAA: "AAAA";
                        ANY: "ANY";
                        CAA: "CAA";
                        CNAME: "CNAME";
                        MX: "MX";
                        NAPTR: "NAPTR";
                        NS: "NS";
                        PTR: "PTR";
                        SOA: "SOA";
                        SRV: "SRV";
                        TLSA: "TLSA";
                        TXT: "TXT";
                    }>;
                    responseTime: z.ZodNumber;
                    retryAttempts: z.ZodNumber;
                    status: z.ZodEnum<{
                        down: "down";
                        paused: "paused";
                        pending: "pending";
                        up: "up";
                    }>;
                    timeout: z.ZodNumber;
                    type: z.ZodLiteral<"dns">;
                }>,
            ]
        >
    >;
    name: z.ZodString;
}>;
