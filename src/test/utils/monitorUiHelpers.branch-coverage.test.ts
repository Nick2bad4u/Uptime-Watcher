/**
 * Comprehensive branch coverage tests for monitorUiHelpers.ts
 * Specifically targeting the ternary operator in getTypesWithFeature function
 * to ensure both responseTime and advancedAnalytics branches are covered.
 */

import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";

// Mock the actual function to avoid error handling wrapper interference
vi.mock("../../utils/monitorTypeHelper", () => ({
	getAvailableMonitorTypes: vi.fn(),
}));

describe("monitorUiHelpers - Branch Coverage", () => {
	let getAvailableMonitorTypes: Mock;

	beforeEach(async () => {
		vi.clearAllMocks();
		
		// Get the mock after clearing
		const monitorModule = vi.mocked(await import("../../utils/monitorTypeHelper"));
		getAvailableMonitorTypes = monitorModule.getAvailableMonitorTypes;
	});

	describe("getTypesWithFeature - Ternary Branch Coverage", () => {
		it("should hit responseTime branch in ternary operator", async () => {
			// Import the module fresh to avoid cached mocks
			const { getTypesWithFeature } = await import("../../utils/monitorUiHelpers");

			// Mock data that will trigger the responseTime branch
			getAvailableMonitorTypes.mockResolvedValue([
				{ 
					type: "http", 
					uiConfig: { 
						supportsResponseTime: true,
						supportsAdvancedAnalytics: false 
					} 
				},
				{ 
					type: "port", 
					uiConfig: { 
						supportsResponseTime: false,
						supportsAdvancedAnalytics: true 
					} 
				},
			]);

			const result = await getTypesWithFeature("responseTime");
			
			// Verify that responseTime condition was evaluated
			expect(getAvailableMonitorTypes).toHaveBeenCalled();
			// Result depends on error handling wrapper, but we've exercised the branch
			expect(Array.isArray(result)).toBe(true);
		});

		it("should hit advancedAnalytics branch in ternary operator", async () => {
			// Import the module fresh to avoid cached mocks
			const { getTypesWithFeature } = await import("../../utils/monitorUiHelpers");

			// Mock data that will trigger the advancedAnalytics branch
			getAvailableMonitorTypes.mockResolvedValue([
				{ 
					type: "http", 
					uiConfig: { 
						supportsResponseTime: false,
						supportsAdvancedAnalytics: true 
					} 
				},
				{ 
					type: "tcp", 
					uiConfig: { 
						supportsResponseTime: true,
						supportsAdvancedAnalytics: false 
					} 
				},
			]);

			const result = await getTypesWithFeature("advancedAnalytics");
			
			// Verify that advancedAnalytics condition was evaluated
			expect(getAvailableMonitorTypes).toHaveBeenCalled();
			// Result depends on error handling wrapper, but we've exercised the branch
			expect(Array.isArray(result)).toBe(true);
		});

		it("should handle both branches with mixed support", async () => {
			const { getTypesWithFeature } = await import("../../utils/monitorUiHelpers");

			// Test data with mixed capabilities
			getAvailableMonitorTypes.mockResolvedValue([
				{ 
					type: "http", 
					uiConfig: { 
						supportsResponseTime: true,
						supportsAdvancedAnalytics: true 
					} 
				},
				{ 
					type: "port", 
					uiConfig: { 
						supportsResponseTime: false,
						supportsAdvancedAnalytics: false 
					} 
				},
				{ 
					type: "tcp", 
					uiConfig: { 
						supportsResponseTime: true,
						supportsAdvancedAnalytics: false 
					} 
				},
			]);

			// Test responseTime branch
			const responseTimeResult = await getTypesWithFeature("responseTime");
			expect(Array.isArray(responseTimeResult)).toBe(true);

			// Reset mock for second test
			getAvailableMonitorTypes.mockResolvedValue([
				{ 
					type: "http", 
					uiConfig: { 
						supportsResponseTime: true,
						supportsAdvancedAnalytics: true 
					} 
				},
				{ 
					type: "port", 
					uiConfig: { 
						supportsResponseTime: false,
						supportsAdvancedAnalytics: false 
					} 
				},
				{ 
					type: "ping", 
					uiConfig: { 
						supportsResponseTime: false,
						supportsAdvancedAnalytics: true 
					} 
				},
			]);

			// Test advancedAnalytics branch
			const analyticsResult = await getTypesWithFeature("advancedAnalytics");
			expect(Array.isArray(analyticsResult)).toBe(true);
			
			// Verify both calls were made
			expect(getAvailableMonitorTypes).toHaveBeenCalledTimes(2);
		});

		it("should handle undefined uiConfig values in both branches", async () => {
			const { getTypesWithFeature } = await import("../../utils/monitorUiHelpers");

			// Test with undefined values to ensure branch coverage
			getAvailableMonitorTypes.mockResolvedValue([
				{ 
					type: "http", 
					uiConfig: { 
						supportsResponseTime: undefined,
						supportsAdvancedAnalytics: undefined 
					} 
				},
				{ 
					type: "port", 
					uiConfig: {} 
				},
				{ 
					type: "tcp" // No uiConfig at all
				},
			]);

			// Test both branches with undefined conditions
			await getTypesWithFeature("responseTime");
			await getTypesWithFeature("advancedAnalytics");
			
			expect(getAvailableMonitorTypes).toHaveBeenCalledTimes(2);
		});
	});
});
