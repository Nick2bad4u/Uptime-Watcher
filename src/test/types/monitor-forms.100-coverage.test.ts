/**
 * @fileoverview Tests to reach 100% coverage for monitor-forms.ts line 166
 * Targeting the satisfies DnsMonitorFields constraint
 */

import { describe, expect, test } from "vitest";
import { getDefaultMonitorFields } from "../../types/monitor-forms";
import type { DnsMonitorFields, HttpMonitorFields, PortMonitorFields, PingMonitorFields } from "../../types/monitor-forms";

describe("Monitor Forms - 100% Coverage Tests", () => {
	describe("Targeting Line 166 (satisfies DnsMonitorFields)", () => {
		test("should return valid DNS monitor fields structure", () => {
			const dnsFields = getDefaultMonitorFields("dns") as DnsMonitorFields;
			
			// Verify all expected DNS fields are present
			expect(dnsFields).toHaveProperty("expectedValue");
			expect(dnsFields).toHaveProperty("host");
			expect(dnsFields).toHaveProperty("recordType");
			expect(dnsFields).toHaveProperty("checkInterval");
			expect(dnsFields).toHaveProperty("retryAttempts");
			expect(dnsFields).toHaveProperty("timeout");
			
			// Verify default values
			expect(dnsFields.expectedValue).toBe("");
			expect(dnsFields.host).toBe("");
			expect(dnsFields.recordType).toBe("A");
			expect(dnsFields.checkInterval).toBe(300_000);
			expect(dnsFields.retryAttempts).toBe(3);
			expect(dnsFields.timeout).toBe(10_000);
		});

		test("should return valid HTTP monitor fields structure", () => {
			const httpFields = getDefaultMonitorFields("http") as HttpMonitorFields;
			
			// Verify HTTP-specific fields
			expect(httpFields).toHaveProperty("url");
			expect(httpFields).toHaveProperty("checkInterval");
			expect(httpFields).toHaveProperty("retryAttempts");
			expect(httpFields).toHaveProperty("timeout");
			expect(httpFields).toHaveProperty("expectedStatusCode");
			expect(httpFields).toHaveProperty("followRedirects");
			expect(httpFields).toHaveProperty("headers");
			expect(httpFields).toHaveProperty("method");
			
			// Verify default values
			expect(httpFields.url).toBe("");
			expect(httpFields.checkInterval).toBe(300_000);
			expect(httpFields.retryAttempts).toBe(3);
			expect(httpFields.timeout).toBe(10_000);
			expect(httpFields.expectedStatusCode).toBe(200);
			expect(httpFields.followRedirects).toBe(true);
			expect(httpFields.method).toBe("GET");
		});

		test("should return valid port monitor fields structure", () => {
			const portFields = getDefaultMonitorFields("port") as PortMonitorFields;
			
			// Verify port-specific fields
			expect(portFields).toHaveProperty("host");
			expect(portFields).toHaveProperty("port");
			expect(portFields).toHaveProperty("checkInterval");
			expect(portFields).toHaveProperty("retryAttempts");
			expect(portFields).toHaveProperty("timeout");
			expect(portFields).toHaveProperty("connectionType");
			
			// Verify default values
			expect(portFields.host).toBe("");
			expect(portFields.port).toBe(80);
			expect(portFields.connectionType).toBe("tcp");
			expect(portFields.checkInterval).toBe(300_000);
			expect(portFields.retryAttempts).toBe(3);
			expect(portFields.timeout).toBe(10_000);
		});

		test("should return valid ping monitor fields structure", () => {
			const pingFields = getDefaultMonitorFields("ping") as PingMonitorFields;
			
			// Verify ping-specific fields
			expect(pingFields).toHaveProperty("host");
			expect(pingFields).toHaveProperty("checkInterval");
			expect(pingFields).toHaveProperty("retryAttempts");
			expect(pingFields).toHaveProperty("timeout");
			
			// Verify default values
			expect(pingFields.host).toBe("");
			expect(pingFields.checkInterval).toBe(300_000);
			expect(pingFields.retryAttempts).toBe(3);
			expect(pingFields.timeout).toBe(10_000);
		});

		test("should handle all monitor types consistently", () => {
			const monitorTypes = ["dns", "http", "port", "ping"] as const;
			
			for (const type of monitorTypes) {
				const fields = getDefaultMonitorFields(type);
				
				// All types should have base fields
				expect(fields).toHaveProperty("checkInterval");
				expect(fields).toHaveProperty("retryAttempts");
				expect(fields).toHaveProperty("timeout");
				
				// Verify types match expected structure
				expect(typeof fields.checkInterval).toBe("number");
				expect(typeof fields.retryAttempts).toBe("number");
				expect(typeof fields.timeout).toBe("number");
			}
		});

		test("should handle unknown monitor type with HTTP fallback", () => {
			const fallbackFields = getDefaultMonitorFields("unknown" as any) as HttpMonitorFields;
			
			// Should fallback to HTTP fields
			expect(fallbackFields).toHaveProperty("url");
			expect(fallbackFields).toHaveProperty("checkInterval");
			expect(fallbackFields).toHaveProperty("retryAttempts");
			expect(fallbackFields).toHaveProperty("timeout");
			expect(fallbackFields.url).toBe("");
		});
	});
});
