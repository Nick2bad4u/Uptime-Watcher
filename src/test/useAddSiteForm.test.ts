/**
 * Tests for useAddSiteForm hook.
 * Validates form state management, validation, and user interactions.
 */

import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

import { useAddSiteForm } from "../components/AddSiteForm/useAddSiteForm";
import type { FormMode, MonitorType } from "../components/AddSiteForm/useAddSiteForm";

// Mock generateUuid
vi.mock("../utils/data/generateUuid", () => ({
    generateUuid: vi.fn(),
}));

// Mock constants
vi.mock("../constants", () => ({
    DEFAULT_CHECK_INTERVAL: 300000,
}));

// Import mocked module for type safety
import { generateUuid } from "../utils/data/generateUuid";

describe("useAddSiteForm Hook", () => {
    const mockGenerateUuid = vi.mocked(generateUuid);

    beforeEach(() => {
        vi.clearAllMocks();
        mockGenerateUuid.mockReturnValue("mock-uuid-123");
    });

    describe("Initial State", () => {
        it("should initialize with default values", () => {
            const { result } = renderHook(() => useAddSiteForm());

            expect(result.current.url).toBe("");
            expect(result.current.host).toBe("");
            expect(result.current.port).toBe("");
            expect(result.current.name).toBe("");
            expect(result.current.monitorType).toBe("http");
            expect(result.current.checkInterval).toBe(300000);
            expect(result.current.siteId).toBe("mock-uuid-123");
            expect(result.current.addMode).toBe("new");
            expect(result.current.selectedExistingSite).toBe("");
            expect(result.current.formError).toBe(undefined);
            expect(result.current.isFormValid).toBe(false);
        });

        it("should generate a UUID for siteId on initialization", () => {
            renderHook(() => useAddSiteForm());

            expect(mockGenerateUuid).toHaveBeenCalledTimes(2); // Once for initial state, once for effect
        });
    });

    describe("Form Field Updates", () => {
        it("should update URL field", () => {
            const { result } = renderHook(() => useAddSiteForm());

            act(() => {
                result.current.setUrl("https://example.com");
            });

            expect(result.current.url).toBe("https://example.com");
        });

        it("should update host field", () => {
            const { result } = renderHook(() => useAddSiteForm());

            act(() => {
                result.current.setHost("example.com");
            });

            expect(result.current.host).toBe("example.com");
        });

        it("should update port field", () => {
            const { result } = renderHook(() => useAddSiteForm());

            act(() => {
                result.current.setPort("8080");
            });

            expect(result.current.port).toBe("8080");
        });

        it("should update name field", () => {
            const { result } = renderHook(() => useAddSiteForm());

            act(() => {
                result.current.setName("Test Site");
            });

            expect(result.current.name).toBe("Test Site");
        });

        it("should update monitor type", () => {
            const { result } = renderHook(() => useAddSiteForm());

            act(() => {
                result.current.setMonitorType("port");
            });

            expect(result.current.monitorType).toBe("port");
        });

        it("should update check interval", () => {
            const { result } = renderHook(() => useAddSiteForm());

            act(() => {
                result.current.setCheckInterval(60000);
            });

            expect(result.current.checkInterval).toBe(60000);
        });

        it("should update site ID", () => {
            const { result } = renderHook(() => useAddSiteForm());

            act(() => {
                result.current.setSiteId("custom-id");
            });

            expect(result.current.siteId).toBe("custom-id");
        });

        it("should update add mode", () => {
            const { result } = renderHook(() => useAddSiteForm());

            act(() => {
                result.current.setAddMode("existing" as FormMode);
            });

            expect(result.current.addMode).toBe("existing");
        });

        it("should update selected existing site", () => {
            const { result } = renderHook(() => useAddSiteForm());

            act(() => {
                result.current.setSelectedExistingSite("existing-site-id");
            });

            expect(result.current.selectedExistingSite).toBe("existing-site-id");
        });

        it("should update form error", () => {
            const { result } = renderHook(() => useAddSiteForm());

            act(() => {
                result.current.setFormError("Test error message");
            });

            expect(result.current.formError).toBe("Test error message");
        });

        it("should clear form error when set to undefined", () => {
            const { result } = renderHook(() => useAddSiteForm());

            act(() => {
                result.current.setFormError("Test error");
                result.current.setFormError(undefined);
            });

            expect(result.current.formError).toBe(undefined);
        });
    });

    describe("Monitor Type Effects", () => {
        it("should clear fields when monitor type changes", () => {
            const { result } = renderHook(() => useAddSiteForm());

            // Set some values
            act(() => {
                result.current.setUrl("https://example.com");
                result.current.setHost("example.com");
                result.current.setPort("8080");
                result.current.setFormError("Some error");
            });

            // Change monitor type
            act(() => {
                result.current.setMonitorType("port" as MonitorType);
            });

            expect(result.current.url).toBe("");
            expect(result.current.host).toBe("");
            expect(result.current.port).toBe("");
            expect(result.current.formError).toBe(undefined);
        });

        it("should clear fields when switching back to http monitor", () => {
            const { result } = renderHook(() => useAddSiteForm());

            // Set port type first
            act(() => {
                result.current.setMonitorType("port" as MonitorType);
                result.current.setHost("example.com");
                result.current.setPort("8080");
            });

            // Switch back to http
            act(() => {
                result.current.setMonitorType("http" as MonitorType);
            });

            expect(result.current.url).toBe("");
            expect(result.current.host).toBe("");
            expect(result.current.port).toBe("");
        });
    });

    describe("Add Mode Effects", () => {
        it("should generate new UUID when switching to new mode", () => {
            const { result } = renderHook(() => useAddSiteForm());

            // First verify the initial state
            expect(result.current.siteId).toBe("mock-uuid-123");

            // Get the initial call count
            const initialCallCount = mockGenerateUuid.mock.calls.length;

            act(() => {
                result.current.setAddMode("existing" as FormMode);
                result.current.setAddMode("new" as FormMode);
            });

            // Should have been called one more time when switching to "new" mode
            expect(mockGenerateUuid).toHaveBeenCalledTimes(initialCallCount + 1);
            // The siteId should still be the mock value since we can't easily change mock return values mid-test
            expect(result.current.siteId).toBe("mock-uuid-123");
        });

        it("should clear name when switching modes", () => {
            const { result } = renderHook(() => useAddSiteForm());

            act(() => {
                result.current.setName("Test Site");
                result.current.setAddMode("existing" as FormMode);
            });

            expect(result.current.name).toBe("");
        });

        it("should clear form error when switching modes", () => {
            const { result } = renderHook(() => useAddSiteForm());

            act(() => {
                result.current.setFormError("Test error");
                result.current.setAddMode("existing" as FormMode);
            });

            expect(result.current.formError).toBe(undefined);
        });

        it("should clear name when switching to existing mode", () => {
            const { result } = renderHook(() => useAddSiteForm());

            act(() => {
                result.current.setName("Test Site");
                result.current.setAddMode("existing" as FormMode);
            });

            expect(result.current.name).toBe("");
        });
    });

    describe("Form Validation", () => {
        it("should be invalid when new mode has no name", () => {
            const { result } = renderHook(() => useAddSiteForm());

            act(() => {
                result.current.setAddMode("new" as FormMode);
                result.current.setUrl("https://example.com");
                // name is empty
            });

            expect(result.current.isFormValid).toBe(false);
        });

        it("should be valid when new mode has name and http url", () => {
            const { result } = renderHook(() => useAddSiteForm());

            act(() => {
                result.current.setAddMode("new" as FormMode);
                result.current.setName("Test Site");
                result.current.setUrl("https://example.com");
            });

            expect(result.current.isFormValid).toBe(true);
        });

        it("should be invalid when existing mode has no site selected", () => {
            const { result } = renderHook(() => useAddSiteForm());

            act(() => {
                result.current.setAddMode("existing" as FormMode);
                result.current.setUrl("https://example.com");
                // selectedExistingSite is empty
            });

            expect(result.current.isFormValid).toBe(false);
        });

        it("should be valid when existing mode has site selected and http url", () => {
            const { result } = renderHook(() => useAddSiteForm());

            act(() => {
                result.current.setAddMode("existing" as FormMode);
                result.current.setSelectedExistingSite("existing-site-id");
                result.current.setUrl("https://example.com");
            });

            expect(result.current.isFormValid).toBe(true);
        });

        it("should be invalid when http monitor has no url", () => {
            const { result } = renderHook(() => useAddSiteForm());

            act(() => {
                result.current.setAddMode("new" as FormMode);
                result.current.setName("Test Site");
                result.current.setMonitorType("http" as MonitorType);
                // url is empty
            });

            expect(result.current.isFormValid).toBe(false);
        });

        it("should be invalid when http monitor has only whitespace url", () => {
            const { result } = renderHook(() => useAddSiteForm());

            act(() => {
                result.current.setAddMode("new" as FormMode);
                result.current.setName("Test Site");
                result.current.setMonitorType("http" as MonitorType);
                result.current.setUrl("   ");
            });

            expect(result.current.isFormValid).toBe(false);
        });

        it("should be invalid when port monitor has no host", () => {
            const { result } = renderHook(() => useAddSiteForm());

            act(() => {
                result.current.setAddMode("new" as FormMode);
                result.current.setName("Test Site");
                result.current.setMonitorType("port" as MonitorType);
                result.current.setPort("8080");
                // host is empty
            });

            expect(result.current.isFormValid).toBe(false);
        });

        it("should be invalid when port monitor has no port", () => {
            const { result } = renderHook(() => useAddSiteForm());

            act(() => {
                result.current.setAddMode("new" as FormMode);
                result.current.setName("Test Site");
                result.current.setMonitorType("port" as MonitorType);
                result.current.setHost("example.com");
                // port is empty
            });

            expect(result.current.isFormValid).toBe(false);
        });

        it("should be invalid when port monitor has whitespace-only host", () => {
            const { result } = renderHook(() => useAddSiteForm());

            act(() => {
                result.current.setAddMode("new" as FormMode);
                result.current.setName("Test Site");
                result.current.setMonitorType("port" as MonitorType);
                result.current.setHost("   ");
                result.current.setPort("8080");
            });

            expect(result.current.isFormValid).toBe(false);
        });

        it("should be invalid when port monitor has whitespace-only port", () => {
            const { result } = renderHook(() => useAddSiteForm());

            act(() => {
                result.current.setAddMode("new" as FormMode);
                result.current.setName("Test Site");
                result.current.setMonitorType("port" as MonitorType);
                result.current.setHost("example.com");
                result.current.setPort("   ");
            });

            expect(result.current.isFormValid).toBe(false);
        });

        it("should be valid when port monitor has both host and port", () => {
            const { result } = renderHook(() => useAddSiteForm());

            act(() => {
                result.current.setAddMode("new" as FormMode);
                result.current.setName("Test Site");
                result.current.setMonitorType("port" as MonitorType);
            });

            // Set host and port after monitor type change to avoid clearing
            act(() => {
                result.current.setHost("example.com");
                result.current.setPort("8080");
            });

            expect(result.current.isFormValid).toBe(true);
        });

        it("should trim whitespace when validating name", () => {
            const { result } = renderHook(() => useAddSiteForm());

            act(() => {
                result.current.setAddMode("new" as FormMode);
                result.current.setName("   Test Site   ");
                result.current.setUrl("https://example.com");
            });

            expect(result.current.isFormValid).toBe(true);
        });
    });

    describe("Reset Form", () => {
        it("should reset all fields to initial state", () => {
            const { result } = renderHook(() => useAddSiteForm());

            mockGenerateUuid.mockReturnValue("reset-uuid-789");

            // Set some values
            act(() => {
                result.current.setUrl("https://example.com");
                result.current.setHost("example.com");
                result.current.setPort("8080");
                result.current.setName("Test Site");
                result.current.setMonitorType("port" as MonitorType);
                result.current.setCheckInterval(60000);
                result.current.setSiteId("custom-id");
                result.current.setAddMode("existing" as FormMode);
                result.current.setSelectedExistingSite("existing-site");
                result.current.setFormError("Test error");
            });

            // Reset form
            act(() => {
                result.current.resetForm();
            });

            expect(result.current.url).toBe("");
            expect(result.current.host).toBe("");
            expect(result.current.port).toBe("");
            expect(result.current.name).toBe("");
            expect(result.current.monitorType).toBe("http");
            expect(result.current.checkInterval).toBe(300000);
            expect(result.current.siteId).toBe("reset-uuid-789");
            expect(result.current.addMode).toBe("new");
            expect(result.current.selectedExistingSite).toBe("");
            expect(result.current.formError).toBe(undefined);
            expect(result.current.isFormValid).toBe(false);
        });

        it("should generate new UUID when reset", () => {
            const { result } = renderHook(() => useAddSiteForm());

            act(() => {
                result.current.resetForm();
            });

            // Should have been called: initial (2 calls) + reset (1 call) = 3 calls total
            expect(mockGenerateUuid).toHaveBeenCalledTimes(3);
        });
    });

    describe("Complex Scenarios", () => {
        it("should handle switching between monitor types while maintaining validation", () => {
            const { result } = renderHook(() => useAddSiteForm());

            // Start with HTTP monitor
            act(() => {
                result.current.setAddMode("new" as FormMode);
                result.current.setName("Test Site");
                result.current.setUrl("https://example.com");
            });
            expect(result.current.isFormValid).toBe(true);

            // Switch to port monitor
            act(() => {
                result.current.setMonitorType("port" as MonitorType);
            });
            expect(result.current.isFormValid).toBe(false); // Now invalid because no host/port

            // Fill port monitor fields
            act(() => {
                result.current.setHost("example.com");
                result.current.setPort("8080");
            });
            expect(result.current.isFormValid).toBe(true);

            // Switch back to HTTP
            act(() => {
                result.current.setMonitorType("http" as MonitorType);
            });
            expect(result.current.isFormValid).toBe(false); // Now invalid because no URL

            // Fill URL
            act(() => {
                result.current.setUrl("https://test.com");
            });
            expect(result.current.isFormValid).toBe(true);
        });

        it("should handle switching between add modes while maintaining validation", () => {
            const { result } = renderHook(() => useAddSiteForm());

            // Start with new mode
            act(() => {
                result.current.setAddMode("new" as FormMode);
                result.current.setName("Test Site");
                result.current.setUrl("https://example.com");
            });
            expect(result.current.isFormValid).toBe(true);

            // Switch to existing mode
            act(() => {
                result.current.setAddMode("existing" as FormMode);
            });
            expect(result.current.isFormValid).toBe(false); // Now invalid because no site selected
            expect(result.current.name).toBe(""); // Name should be cleared

            // Select existing site
            act(() => {
                result.current.setSelectedExistingSite("existing-id");
            });
            expect(result.current.isFormValid).toBe(true);

            // Switch back to new mode
            act(() => {
                result.current.setAddMode("new" as FormMode);
            });
            expect(result.current.isFormValid).toBe(false); // Now invalid because no name
            expect(result.current.name).toBe(""); // Name should still be empty

            // Fill name
            act(() => {
                result.current.setName("New Site");
            });
            expect(result.current.isFormValid).toBe(true);
        });
    });
});
