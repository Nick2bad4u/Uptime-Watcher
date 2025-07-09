import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAddSiteForm } from "../components/AddSiteForm/useAddSiteForm";
import { DEFAULT_CHECK_INTERVAL } from "../constants";

// Mock generateUuid
vi.mock("../utils/data/generateUuid", () => ({
    generateUuid: vi.fn(() => "mock-uuid-123"),
}));

describe("useAddSiteForm", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Initial State", () => {
        it("should initialize with correct default values", () => {
            const { result } = renderHook(() => useAddSiteForm());

            expect(result.current.url).toBe("");
            expect(result.current.host).toBe("");
            expect(result.current.port).toBe("");
            expect(result.current.name).toBe("");
            expect(result.current.monitorType).toBe("http");
            expect(result.current.checkInterval).toBe(DEFAULT_CHECK_INTERVAL);
            expect(result.current.siteId).toBe("mock-uuid-123");
            expect(result.current.addMode).toBe("new");
            expect(result.current.selectedExistingSite).toBe("");
            expect(result.current.formError).toBeUndefined();
            expect(result.current.isFormValid()).toBe(false); // No name provided initially
        });
    });

    describe("State Setters", () => {
        it("should update URL", () => {
            const { result } = renderHook(() => useAddSiteForm());

            act(() => {
                result.current.setUrl("https://example.com");
            });

            expect(result.current.url).toBe("https://example.com");
        });

        it("should update host", () => {
            const { result } = renderHook(() => useAddSiteForm());

            act(() => {
                result.current.setHost("example.com");
            });

            expect(result.current.host).toBe("example.com");
        });

        it("should update port", () => {
            const { result } = renderHook(() => useAddSiteForm());

            act(() => {
                result.current.setPort("8080");
            });

            expect(result.current.port).toBe("8080");
        });

        it("should update name", () => {
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
                result.current.setAddMode("existing");
            });

            expect(result.current.addMode).toBe("existing");
        });

        it("should update selected existing site", () => {
            const { result } = renderHook(() => useAddSiteForm());

            act(() => {
                result.current.setSelectedExistingSite("site-123");
            });

            expect(result.current.selectedExistingSite).toBe("site-123");
        });

        it("should update form error", () => {
            const { result } = renderHook(() => useAddSiteForm());

            act(() => {
                result.current.setFormError("Test error");
            });

            expect(result.current.formError).toBe("Test error");
        });
    });

    describe("Form Validation", () => {
        it("should be invalid when new site mode has no name", () => {
            const { result } = renderHook(() => useAddSiteForm());

            act(() => {
                result.current.setAddMode("new");
                result.current.setUrl("https://example.com");
            });

            expect(result.current.isFormValid()).toBe(false);
        });

        it("should be valid when new site mode has name and URL for HTTP monitor", () => {
            const { result } = renderHook(() => useAddSiteForm());

            act(() => {
                result.current.setAddMode("new");
                result.current.setName("Test Site");
                result.current.setUrl("https://example.com");
                result.current.setMonitorType("http");
            });

            expect(result.current.isFormValid()).toBe(true);
        });

        it("should be valid when new site mode has name, host, and port for port monitor", () => {
            const { result } = renderHook(() => useAddSiteForm());

            act(() => {
                result.current.setAddMode("new");
                result.current.setName("Test Site");
                result.current.setMonitorType("port");
                result.current.setHost("example.com");
                result.current.setPort("8080");
            });

            expect(result.current.isFormValid()).toBe(true);
        });

        it("should be invalid when existing mode has no selected site", () => {
            const { result } = renderHook(() => useAddSiteForm());

            act(() => {
                result.current.setAddMode("existing");
                result.current.setUrl("https://example.com");
            });

            expect(result.current.isFormValid()).toBe(false);
        });

        it("should be valid when existing mode has selected site and URL", () => {
            const { result } = renderHook(() => useAddSiteForm());

            act(() => {
                result.current.setAddMode("existing");
                result.current.setSelectedExistingSite("site-123");
                result.current.setUrl("https://example.com");
            });

            expect(result.current.isFormValid()).toBe(true);
        });

        it("should be invalid when HTTP monitor has no URL", () => {
            const { result } = renderHook(() => useAddSiteForm());

            act(() => {
                result.current.setName("Test Site");
                result.current.setMonitorType("http");
            });

            expect(result.current.isFormValid()).toBe(false);
        });

        it("should be invalid when port monitor has no host", () => {
            const { result } = renderHook(() => useAddSiteForm());

            act(() => {
                result.current.setName("Test Site");
                result.current.setMonitorType("port");
                result.current.setPort("8080");
            });

            expect(result.current.isFormValid()).toBe(false);
        });

        it("should be invalid when port monitor has no port", () => {
            const { result } = renderHook(() => useAddSiteForm());

            act(() => {
                result.current.setName("Test Site");
                result.current.setMonitorType("port");
                result.current.setHost("example.com");
            });

            expect(result.current.isFormValid()).toBe(false);
        });

        it("should handle whitespace-only values as invalid", () => {
            const { result } = renderHook(() => useAddSiteForm());

            act(() => {
                result.current.setName("   ");
                result.current.setUrl("   ");
                result.current.setHost("   ");
                result.current.setPort("   ");
            });

            expect(result.current.isFormValid()).toBe(false);
        });
    });

    describe("Reset Form", () => {
        it("should reset all fields to initial state", () => {
            const { result } = renderHook(() => useAddSiteForm());

            // Set some values
            act(() => {
                result.current.setUrl("https://example.com");
                result.current.setHost("example.com");
                result.current.setPort("8080");
                result.current.setName("Test Site");
                result.current.setMonitorType("port");
                result.current.setCheckInterval(60000);
                result.current.setSiteId("custom-id");
                result.current.setAddMode("existing");
                result.current.setSelectedExistingSite("site-123");
                result.current.setFormError("Test error");
            });

            // Reset form
            act(() => {
                result.current.resetForm();
            });

            // Check all fields are reset
            expect(result.current.url).toBe("");
            expect(result.current.host).toBe("");
            expect(result.current.port).toBe("");
            expect(result.current.name).toBe("");
            expect(result.current.monitorType).toBe("http");
            expect(result.current.checkInterval).toBe(DEFAULT_CHECK_INTERVAL);
            expect(result.current.siteId).toBe("mock-uuid-123"); // New UUID generated
            expect(result.current.addMode).toBe("new");
            expect(result.current.selectedExistingSite).toBe("");
            expect(result.current.formError).toBeUndefined();
        });
    });

    describe("useEffect - Monitor Type Change", () => {
        it("should clear URL when switching to port monitor", () => {
            const { result } = renderHook(() => useAddSiteForm());

            // Set some values including URL
            act(() => {
                result.current.setUrl("https://example.com");
                result.current.setHost("example.com");
                result.current.setPort("8080");
                result.current.setFormError("Test error");
            });

            // Change monitor type to port
            act(() => {
                result.current.setMonitorType("port");
            });

            // URL should be cleared, but host/port should remain
            expect(result.current.url).toBe("");
            expect(result.current.host).toBe("example.com"); // Should remain
            expect(result.current.port).toBe("8080"); // Should remain
            expect(result.current.formError).toBeUndefined();
        });

        it("should clear fields when switching from port to http", () => {
            const { result } = renderHook(() => useAddSiteForm());

            // Set port monitor fields
            act(() => {
                result.current.setMonitorType("port");
                result.current.setHost("example.com");
                result.current.setPort("8080");
                result.current.setFormError("Port error");
            });

            // Switch to HTTP
            act(() => {
                result.current.setMonitorType("http");
            });

            // Fields should be cleared
            expect(result.current.host).toBe("");
            expect(result.current.port).toBe("");
            expect(result.current.formError).toBeUndefined();
        });
    });

    describe("useEffect - Add Mode Change", () => {
        it("should clear name and generate new site ID when switching to new mode", () => {
            const { result } = renderHook(() => useAddSiteForm());

            // Set existing mode values
            act(() => {
                result.current.setAddMode("existing");
                result.current.setName("Existing Site");
                result.current.setFormError("Test error");
            });

            // Switch to new mode
            act(() => {
                result.current.setAddMode("new");
            });

            // Name should be cleared and new UUID generated
            expect(result.current.name).toBe("");
            expect(result.current.siteId).toBe("mock-uuid-123");
            expect(result.current.formError).toBeUndefined();
        });

        it("should clear name when switching to existing mode", () => {
            const { result } = renderHook(() => useAddSiteForm());

            // Set new mode values
            act(() => {
                result.current.setName("New Site");
                result.current.setFormError("Test error");
            });

            // Switch to existing mode
            act(() => {
                result.current.setAddMode("existing");
            });

            // Name should be cleared
            expect(result.current.name).toBe("");
            expect(result.current.formError).toBeUndefined();
        });

        it("should clear form error when mode changes", () => {
            const { result } = renderHook(() => useAddSiteForm());

            // Set error
            act(() => {
                result.current.setFormError("Mode error");
            });

            // Change mode
            act(() => {
                result.current.setAddMode("existing");
            });

            expect(result.current.formError).toBeUndefined();
        });
    });

    describe("Memoization", () => {
        it("should memoize isFormValid calculation", () => {
            const { result, rerender } = renderHook(() => useAddSiteForm());

            const initialValid = result.current.isFormValid;

            // Re-render without changing dependencies
            rerender();

            // Should return same value
            expect(result.current.isFormValid).toBe(initialValid);
        });

        it("should recalculate isFormValid when dependencies change", () => {
            const { result } = renderHook(() => useAddSiteForm());

            const initialValid = result.current.isFormValid;

            // Change a dependency
            act(() => {
                result.current.setName("Test Site");
                result.current.setUrl("https://example.com");
            });

            // Should recalculate
            expect(result.current.isFormValid).not.toBe(initialValid);
            expect(result.current.isFormValid()).toBe(true);
        });

        it("should memoize resetForm function", () => {
            const { result, rerender } = renderHook(() => useAddSiteForm());

            const initialResetForm = result.current.resetForm;

            // Re-render
            rerender();

            // Should be the same function reference
            expect(result.current.resetForm).toBe(initialResetForm);
        });
    });

    describe("Edge Cases", () => {
        it("should handle empty string values in validation", () => {
            const { result } = renderHook(() => useAddSiteForm());

            act(() => {
                result.current.setName("");
                result.current.setUrl("");
                result.current.setHost("");
                result.current.setPort("");
            });

            expect(result.current.isFormValid()).toBe(false);
        });

        it("should handle undefined form error correctly", () => {
            const { result } = renderHook(() => useAddSiteForm());

            act(() => {
                result.current.setFormError(undefined);
            });

            expect(result.current.formError).toBeUndefined();
        });

        it("should maintain state consistency during rapid changes", () => {
            const { result } = renderHook(() => useAddSiteForm());

            // First set port monitor values
            act(() => {
                result.current.setMonitorType("port");
                result.current.setHost("example.com");
                result.current.setPort("8080");
                result.current.setName("Test Site");
            });

            // Then switch to HTTP (this should clear host/port)
            act(() => {
                result.current.setMonitorType("http");
            });

            // Then set URL
            act(() => {
                result.current.setUrl("https://example.com");
            });

            expect(result.current.monitorType).toBe("http");
            expect(result.current.host).toBe(""); // Cleared by monitor type change
            expect(result.current.port).toBe(""); // Cleared by monitor type change
            expect(result.current.url).toBe("https://example.com");
            expect(result.current.name).toBe("Test Site");
        });
    });

    describe("Return Value Structure", () => {
        it("should return all expected properties", () => {
            const { result } = renderHook(() => useAddSiteForm());

            const expectedProperties = [
                "url", "host", "port", "name", "monitorType", "checkInterval",
                "siteId", "addMode", "selectedExistingSite", "formError", "isFormValid",
                "setUrl", "setHost", "setPort", "setName", "setMonitorType",
                "setCheckInterval", "setSiteId", "setAddMode", "setSelectedExistingSite",
                "setFormError", "resetForm"
            ];

            for (const property of expectedProperties) {
                expect(result.current).toHaveProperty(property);
            }
        });

        it("should have correct types for all properties", () => {
            const { result } = renderHook(() => useAddSiteForm());

            // State properties
            expect(typeof result.current.url).toBe("string");
            expect(typeof result.current.host).toBe("string");
            expect(typeof result.current.port).toBe("string");
            expect(typeof result.current.name).toBe("string");
            expect(typeof result.current.monitorType).toBe("string");
            expect(typeof result.current.checkInterval).toBe("number");
            expect(typeof result.current.siteId).toBe("string");
            expect(typeof result.current.addMode).toBe("string");
            expect(typeof result.current.selectedExistingSite).toBe("string");
            expect(typeof result.current.isFormValid()).toBe("boolean");

            // Action properties
            expect(typeof result.current.setUrl).toBe("function");
            expect(typeof result.current.setHost).toBe("function");
            expect(typeof result.current.setPort).toBe("function");
            expect(typeof result.current.setName).toBe("function");
            expect(typeof result.current.setMonitorType).toBe("function");
            expect(typeof result.current.setCheckInterval).toBe("function");
            expect(typeof result.current.setSiteId).toBe("function");
            expect(typeof result.current.setAddMode).toBe("function");
            expect(typeof result.current.setSelectedExistingSite).toBe("function");
            expect(typeof result.current.setFormError).toBe("function");
            expect(typeof result.current.resetForm).toBe("function");
        });
    });
});
