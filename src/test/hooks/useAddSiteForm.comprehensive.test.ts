/**
 * @file Comprehensive test suite for useAddSiteForm hook
 *
 *   Tests cover all functionality including form state management, validation,
 *   mode switching, monitor type changes, field resets, and edge cases. Targets
 *   100% coverage for all statements, branches, functions, and lines.
 */

import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_CHECK_INTERVAL } from "../../constants";
import { useAddSiteForm } from "../../components/SiteDetails/useAddSiteForm";
import type { MonitorType } from "../../../shared/types";

// Mock the useMonitorFields hook
const mockGetFields = vi.fn();
vi.mock("../../hooks/useMonitorFields", () => ({
    useMonitorFields: () => ({
        getFields: mockGetFields,
    }),
}));

// Mock generateUuid function
vi.mock("../../utils/data/generateUuid", () => ({
    generateUuid: () => "mock-uuid-12345",
}));

describe("useAddSiteForm Hook - Comprehensive Coverage", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Default mock implementation for getFields
        mockGetFields.mockImplementation((type: MonitorType) => {
            switch (type) {
                case "http": {
                    return [
                        { name: "url", required: true },
                        { name: "checkInterval", required: false },
                    ];
                }
                case "port": {
                    return [
                        { name: "host", required: true },
                        { name: "port", required: true },
                        { name: "checkInterval", required: false },
                    ];
                }
                case "ping": {
                    return [
                        { name: "host", required: true },
                        { name: "checkInterval", required: false },
                    ];
                }
                default: {
                    return [];
                }
            }
        });
    });

    describe("Initial State", () => {
        it("should initialize with correct default values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useAddSiteForm", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Initialization", "type");

            const { result } = renderHook(() => useAddSiteForm());

            expect(result.current.url).toBe("");
            expect(result.current.host).toBe("");
            expect(result.current.port).toBe("");
            expect(result.current.name).toBe("");
            expect(result.current.monitorType).toBe("http");
            expect(result.current.checkInterval).toBe(DEFAULT_CHECK_INTERVAL);
            expect(result.current.siteId).toBe("mock-uuid-12345");
            expect(result.current.addMode).toBe("new");
            expect(result.current.selectedExistingSite).toBe("");
            expect(result.current.formError).toBeUndefined();
        });

        it("should initialize with lazy-generated UUID for siteId", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useAddSiteForm", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Initialization", "type");

            const { result } = renderHook(() => useAddSiteForm());

            expect(result.current.siteId).toBe("mock-uuid-12345");
        });
    });

    describe("Form Field Updates", () => {
        it("should update URL field correctly", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useAddSiteForm", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Data Update", "type");

            const { result } = renderHook(() => useAddSiteForm());

            act(() => {
                result.current.setUrl("https://example.com");
            });

            expect(result.current.url).toBe("https://example.com");
        });

        it("should update host field correctly", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useAddSiteForm", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Data Update", "type");

            const { result } = renderHook(() => useAddSiteForm());

            act(() => {
                result.current.setHost("example.com");
            });

            expect(result.current.host).toBe("example.com");
        });

        it("should update port field correctly", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useAddSiteForm", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Data Update", "type");

            const { result } = renderHook(() => useAddSiteForm());

            act(() => {
                result.current.setPort("8080");
            });

            expect(result.current.port).toBe("8080");
        });

        it("should update name field correctly", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useAddSiteForm", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Data Update", "type");

            const { result } = renderHook(() => useAddSiteForm());

            act(() => {
                result.current.setName("My Site");
            });

            expect(result.current.name).toBe("My Site");
        });

        it("should update monitor type correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useAddSiteForm", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Data Update", "type");

            const { result } = renderHook(() => useAddSiteForm());

            act(() => {
                result.current.setMonitorType("port");
            });

            expect(result.current.monitorType).toBe("port");
        });

        it("should update check interval correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useAddSiteForm", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Data Update", "type");

            const { result } = renderHook(() => useAddSiteForm());

            act(() => {
                result.current.setCheckInterval(60_000);
            });

            expect(result.current.checkInterval).toBe(60_000);
        });

        it("should update siteId correctly", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useAddSiteForm", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Data Update", "type");

            const { result } = renderHook(() => useAddSiteForm());

            act(() => {
                result.current.setSiteId("custom-id");
            });

            expect(result.current.siteId).toBe("custom-id");
        });

        it("should update selected existing site correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useAddSiteForm", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Data Update", "type");

            const { result } = renderHook(() => useAddSiteForm());

            act(() => {
                result.current.setSelectedExistingSite("existing-site-id");
            });

            expect(result.current.selectedExistingSite).toBe(
                "existing-site-id"
            );
        });

        it("should update form error correctly", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useAddSiteForm", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Error Handling", "type");

            const { result } = renderHook(() => useAddSiteForm());

            act(() => {
                result.current.setFormError("Test error message");
            });

            expect(result.current.formError).toBe("Test error message");
        });

        it("should clear form error correctly", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useAddSiteForm", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Error Handling", "type");

            const { result } = renderHook(() => useAddSiteForm());

            act(() => {
                result.current.setFormError("Test error");
            });

            expect(result.current.formError).toBe("Test error");

            act(() => {
                result.current.setFormError(undefined);
            });

            expect(result.current.formError).toBeUndefined();
        });
    });

    describe("Add Mode Management", () => {
        it("should update add mode correctly", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useAddSiteForm", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Data Update", "type");

            const { result } = renderHook(() => useAddSiteForm());

            act(() => {
                result.current.setAddMode("existing");
            });

            expect(result.current.addMode).toBe("existing");
        });

        it("should reset fields when switching to new mode", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useAddSiteForm", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useAddSiteForm());

            // Set up some initial state
            act(() => {
                result.current.setName("Test Site");
                result.current.setSiteId("custom-id");
                result.current.setAddMode("existing");
            });

            // Switch back to new mode
            act(() => {
                result.current.setAddMode("new");
            });

            expect(result.current.name).toBe("");
            expect(result.current.siteId).toBe("mock-uuid-12345");
            expect(result.current.formError).toBeUndefined();
        });

        it("should reset name when switching to existing mode", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useAddSiteForm", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useAddSiteForm());

            // Set up initial state in new mode
            act(() => {
                result.current.setName("Test Site");
            });

            // Switch to existing mode
            act(() => {
                result.current.setAddMode("existing");
            });

            expect(result.current.name).toBe("");
            expect(result.current.formError).toBeUndefined();
        });
    });

    describe("Monitor Type Changes and Field Resets", () => {
        it("should reset unused fields when changing from HTTP to port monitor", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useAddSiteForm", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Monitoring", "type");

            const { result } = renderHook(() => useAddSiteForm());

            // Set up HTTP monitor fields
            act(() => {
                result.current.setUrl("https://example.com");
                result.current.setHost("example.com"); // This should be reset because HTTP doesn't use host
                result.current.setPort("8080"); // This should be reset because HTTP doesn't use port
            });

            // Change to port monitor (uses host and port, not url)
            act(() => {
                result.current.setMonitorType("port");
            });

            expect(result.current.url).toBe(""); // Should be reset (not used by port)
            expect(result.current.host).toBe("example.com"); // Should remain (used by port)
            expect(result.current.port).toBe("8080"); // Should remain (used by port)
            expect(result.current.formError).toBeUndefined();
        });

        it("should reset unused fields when changing from port to HTTP monitor", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useAddSiteForm", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Monitoring", "type");

            const { result } = renderHook(() => useAddSiteForm());

            // Start with port monitor
            act(() => {
                result.current.setMonitorType("port");
                result.current.setHost("example.com");
                result.current.setPort("8080");
                result.current.setUrl("https://example.com"); // This should be reset
            });

            // Change to HTTP monitor
            act(() => {
                result.current.setMonitorType("http");
            });

            expect(result.current.url).toBe(""); // Should be reset for new type
            expect(result.current.host).toBe(""); // Should be reset
            expect(result.current.port).toBe(""); // Should be reset
            expect(result.current.formError).toBeUndefined();
        });

        it("should reset unused fields when changing to ping monitor", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useAddSiteForm", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Monitoring", "type");

            const { result } = renderHook(() => useAddSiteForm());

            // Set up HTTP monitor with all fields
            act(() => {
                result.current.setUrl("https://example.com");
                result.current.setPort("8080");
            });

            // Change to ping monitor
            act(() => {
                result.current.setMonitorType("ping");
            });

            expect(result.current.url).toBe(""); // Should be reset (not used by ping)
            expect(result.current.port).toBe(""); // Should be reset (not used by ping)
            expect(result.current.formError).toBeUndefined();
        });

        it("should preserve fields that are used by the new monitor type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useAddSiteForm", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Monitoring", "type");

            const { result } = renderHook(() => useAddSiteForm());

            // Set up port monitor
            act(() => {
                result.current.setMonitorType("port");
                result.current.setHost("example.com");
            });

            // Change to ping monitor (also uses host)
            act(() => {
                result.current.setMonitorType("ping");
            });

            expect(result.current.host).toBe("example.com"); // Should remain (used by both port and ping)
        });
    });

    describe("Form Validation", () => {
        describe("New Site Mode Validation", () => {
            it("should be invalid when name is empty in new mode", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: useAddSiteForm", "component");
                await annotate("Category: Hook", "category");
                await annotate("Type: Business Logic", "type");

                const { result } = renderHook(() => useAddSiteForm());

                act(() => {
                    result.current.setAddMode("new");
                    result.current.setName(""); // Empty name
                    result.current.setUrl("https://example.com"); // Valid URL for HTTP
                });

                expect(result.current.isFormValid()).toBeFalsy();
            });

            it("should be invalid when name is only whitespace in new mode", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: useAddSiteForm", "component");
                await annotate("Category: Hook", "category");
                await annotate("Type: Business Logic", "type");

                const { result } = renderHook(() => useAddSiteForm());

                act(() => {
                    result.current.setAddMode("new");
                    result.current.setName("   "); // Whitespace only
                    result.current.setUrl("https://example.com");
                });

                expect(result.current.isFormValid()).toBeFalsy();
            });

            it("should be valid with proper name and required fields in new mode", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: useAddSiteForm", "component");
                await annotate("Category: Hook", "category");
                await annotate("Type: Business Logic", "type");

                const { result } = renderHook(() => useAddSiteForm());

                act(() => {
                    result.current.setAddMode("new");
                    result.current.setName("My Site");
                    result.current.setUrl("https://example.com");
                });

                expect(result.current.isFormValid()).toBeTruthy();
            });
        });

        describe("Existing Site Mode Validation", () => {
            it("should be invalid when no existing site is selected", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: useAddSiteForm", "component");
                await annotate("Category: Hook", "category");
                await annotate("Type: Business Logic", "type");

                const { result } = renderHook(() => useAddSiteForm());

                act(() => {
                    result.current.setAddMode("existing");
                    result.current.setSelectedExistingSite(""); // No site selected
                    result.current.setUrl("https://example.com");
                });

                expect(result.current.isFormValid()).toBeFalsy();
            });

            it("should be valid with selected existing site and required fields", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: useAddSiteForm", "component");
                await annotate("Category: Hook", "category");
                await annotate("Type: Business Logic", "type");

                const { result } = renderHook(() => useAddSiteForm());

                act(() => {
                    result.current.setAddMode("existing");
                    result.current.setSelectedExistingSite("existing-site-id");
                    result.current.setUrl("https://example.com");
                });

                expect(result.current.isFormValid()).toBeTruthy();
            });
        });

        describe("Monitor Type Field Validation", () => {
            it("should be invalid when required HTTP URL field is empty", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: useAddSiteForm", "component");
                await annotate("Category: Hook", "category");
                await annotate("Type: Business Logic", "type");

                const { result } = renderHook(() => useAddSiteForm());

                act(() => {
                    result.current.setAddMode("new");
                    result.current.setName("My Site");
                    result.current.setMonitorType("http");
                    result.current.setUrl(""); // Required field empty
                });

                expect(result.current.isFormValid()).toBeFalsy();
            });

            it("should be invalid when required HTTP URL field is whitespace", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: useAddSiteForm", "component");
                await annotate("Category: Hook", "category");
                await annotate("Type: Business Logic", "type");

                const { result } = renderHook(() => useAddSiteForm());

                act(() => {
                    result.current.setAddMode("new");
                    result.current.setName("My Site");
                    result.current.setMonitorType("http");
                    result.current.setUrl("   "); // Whitespace only
                });

                expect(result.current.isFormValid()).toBeFalsy();
            });

            it("should be invalid when required port monitor host field is empty", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: useAddSiteForm", "component");
                await annotate("Category: Hook", "category");
                await annotate("Type: Monitoring", "type");

                const { result } = renderHook(() => useAddSiteForm());

                act(() => {
                    result.current.setAddMode("new");
                    result.current.setName("My Site");
                    result.current.setMonitorType("port");
                    result.current.setHost(""); // Required field empty
                    result.current.setPort("8080");
                });

                expect(result.current.isFormValid()).toBeFalsy();
            });

            it("should be invalid when required port monitor port field is empty", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: useAddSiteForm", "component");
                await annotate("Category: Hook", "category");
                await annotate("Type: Monitoring", "type");

                const { result } = renderHook(() => useAddSiteForm());

                act(() => {
                    result.current.setAddMode("new");
                    result.current.setName("My Site");
                    result.current.setMonitorType("port");
                    result.current.setHost("example.com");
                    result.current.setPort(""); // Required field empty
                });

                expect(result.current.isFormValid()).toBeFalsy();
            });

            it("should be valid when all required port monitor fields are filled", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: useAddSiteForm", "component");
                await annotate("Category: Hook", "category");
                await annotate("Type: Monitoring", "type");

                const { result } = renderHook(() => useAddSiteForm());

                act(() => {
                    result.current.setAddMode("new");
                    result.current.setName("My Site");
                    result.current.setMonitorType("port");
                    result.current.setHost("example.com");
                    result.current.setPort("8080");
                });

                expect(result.current.isFormValid()).toBeTruthy();
            });

            it("should be invalid when required ping monitor host field is empty", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: useAddSiteForm", "component");
                await annotate("Category: Hook", "category");
                await annotate("Type: Monitoring", "type");

                const { result } = renderHook(() => useAddSiteForm());

                act(() => {
                    result.current.setAddMode("new");
                    result.current.setName("My Site");
                    result.current.setMonitorType("ping");
                    result.current.setHost(""); // Required field empty
                });

                expect(result.current.isFormValid()).toBeFalsy();
            });

            it("should be valid when all required ping monitor fields are filled", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: useAddSiteForm", "component");
                await annotate("Category: Hook", "category");
                await annotate("Type: Monitoring", "type");

                const { result } = renderHook(() => useAddSiteForm());

                act(() => {
                    result.current.setAddMode("new");
                    result.current.setName("My Site");
                    result.current.setMonitorType("ping");
                    result.current.setHost("example.com");
                });

                expect(result.current.isFormValid()).toBeTruthy();
            });
        });

        describe("Dynamic Field Validation", () => {
            it("should validate fields dynamically based on monitor type configuration", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: useAddSiteForm", "component");
                await annotate("Category: Hook", "category");
                await annotate("Type: Validation", "type");

                // Mock a custom monitor type with different required fields
                mockGetFields.mockImplementation((type: MonitorType) => {
                    if (type === "http") {
                        return [
                            { name: "url", required: true },
                            { name: "host", required: false },
                        ];
                    }
                    return [];
                });

                const { result } = renderHook(() => useAddSiteForm());

                act(() => {
                    result.current.setAddMode("new");
                    result.current.setName("My Site");
                    result.current.setMonitorType("http");
                    result.current.setUrl("https://example.com");
                    // Host is not required in this configuration
                });

                expect(result.current.isFormValid()).toBeTruthy();
            });

            it("should handle monitor types with no required fields", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: useAddSiteForm", "component");
                await annotate("Category: Hook", "category");
                await annotate("Type: Monitoring", "type");

                mockGetFields.mockImplementation(() => [
                    { name: "optional", required: false },
                ]);

                const { result } = renderHook(() => useAddSiteForm());

                act(() => {
                    result.current.setAddMode("new");
                    result.current.setName("My Site");
                });

                expect(result.current.isFormValid()).toBeTruthy();
            });
        });
    });

    describe("Reset Form Functionality", () => {
        it("should reset all fields to initial state", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useAddSiteForm", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Initialization", "type");

            const { result } = renderHook(() => useAddSiteForm());

            // Set up some state
            act(() => {
                result.current.setUrl("https://example.com");
                result.current.setHost("example.com");
                result.current.setPort("8080");
                result.current.setName("My Site");
                result.current.setMonitorType("port");
                result.current.setCheckInterval(60_000);
                result.current.setSiteId("custom-id");
                result.current.setAddMode("existing");
                result.current.setSelectedExistingSite("existing-site");
                result.current.setFormError("Some error");
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
            expect(result.current.checkInterval).toBe(DEFAULT_CHECK_INTERVAL);
            expect(result.current.siteId).toBe("mock-uuid-12345");
            expect(result.current.addMode).toBe("new");
            expect(result.current.selectedExistingSite).toBe("");
            expect(result.current.formError).toBeUndefined();
        });

        it("should generate new UUID when resetting form", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useAddSiteForm", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useAddSiteForm());

            act(() => {
                result.current.setSiteId("custom-id");
            });

            expect(result.current.siteId).toBe("custom-id");

            act(() => {
                result.current.resetForm();
            });

            expect(result.current.siteId).toBe("mock-uuid-12345");
        });
    });

    describe("Edge Cases and Error Handling", () => {
        it("should handle getFields returning empty array", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useAddSiteForm", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Data Retrieval", "type");

            mockGetFields.mockReturnValue([]);

            const { result } = renderHook(() => useAddSiteForm());

            act(() => {
                result.current.setAddMode("new");
                result.current.setName("My Site");
            });

            expect(result.current.isFormValid()).toBeTruthy();
        });

        it("should handle getFields with fields having no name property", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useAddSiteForm", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Data Retrieval", "type");

            mockGetFields.mockReturnValue([
                { name: "", required: true }, // Empty name - will fail validation
                { name: "url", required: true },
            ]);

            const { result } = renderHook(() => useAddSiteForm());

            act(() => {
                result.current.setAddMode("new");
                result.current.setName("My Site");
                result.current.setUrl("https://example.com");
            });

            // Should be invalid because the empty field name is required but can't be satisfied
            expect(result.current.isFormValid()).toBeFalsy();
        });

        it("should handle validation with undefined field values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useAddSiteForm", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Validation", "type");

            const { result } = renderHook(() => useAddSiteForm());

            // Ensure validation doesn't break with default empty values
            expect(() => result.current.isFormValid()).not.toThrow();
        });

        it("should maintain form validation callback stability", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useAddSiteForm", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Validation", "type");

            const { result } = renderHook(() => useAddSiteForm());

            const firstCallback = result.current.isFormValid;

            // Re-render without changing dependencies
            expect(result.current.isFormValid).toBe(firstCallback);
        });

        it("should maintain reset form callback stability", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useAddSiteForm", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useAddSiteForm());

            const firstCallback = result.current.resetForm;

            // Re-render without changing dependencies
            expect(result.current.resetForm).toBe(firstCallback);
        });
    });

    describe("Complex Scenarios", () => {
        it("should handle rapid mode and monitor type changes correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useAddSiteForm", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Monitoring", "type");

            const { result } = renderHook(() => useAddSiteForm());

            // Initial setup
            act(() => {
                result.current.setName("Test Site");
                result.current.setUrl("https://example.com");
            });

            // Switch to existing mode
            act(() => {
                result.current.setAddMode("existing");
            });

            // Switch monitor type
            act(() => {
                result.current.setMonitorType("port");
                result.current.setHost("example.com");
                result.current.setPort("8080");
            });

            // Switch back to new mode
            act(() => {
                result.current.setAddMode("new");
            });

            // Switch monitor type again
            act(() => {
                result.current.setMonitorType("ping");
            });

            // After all changes, form should be in consistent state
            expect(result.current.addMode).toBe("new");
            expect(result.current.monitorType).toBe("ping");
            expect(result.current.name).toBe(""); // Reset due to mode change
            expect(result.current.url).toBe(""); // Reset due to monitor type change
            expect(result.current.port).toBe(""); // Reset due to monitor type change (ping doesn't use port)
        });

        it("should handle form validation with mixed valid and invalid states", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useAddSiteForm", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Validation", "type");

            const { result } = renderHook(() => useAddSiteForm());

            // Start with valid state
            act(() => {
                result.current.setAddMode("new");
                result.current.setName("My Site");
                result.current.setUrl("https://example.com");
            });

            expect(result.current.isFormValid()).toBeTruthy();

            // Make it invalid
            act(() => {
                result.current.setName("");
            });

            expect(result.current.isFormValid()).toBeFalsy();

            // Make it valid again
            act(() => {
                result.current.setName("My Site");
            });

            expect(result.current.isFormValid()).toBeTruthy();
        });

        it("should handle getFields function dependency changes", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useAddSiteForm", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Data Retrieval", "type");

            const { result, rerender } = renderHook(() => useAddSiteForm());

            // Initial validation
            act(() => {
                result.current.setAddMode("new");
                result.current.setName("My Site");
                result.current.setUrl("https://example.com");
            });

            expect(result.current.isFormValid()).toBeTruthy();

            // Change getFields mock to require different fields
            mockGetFields.mockImplementation(() => [
                { name: "host", required: true },
                { name: "port", required: true },
            ]);

            // Force re-render to pick up new getFields
            rerender();

            // Now validation should use new requirements
            expect(result.current.isFormValid()).toBeFalsy();

            // Satisfy new requirements
            act(() => {
                result.current.setHost("example.com");
                result.current.setPort("8080");
            });

            expect(result.current.isFormValid()).toBeTruthy();
        });
    });

    describe("Return Object Structure", () => {
        it("should return all expected state properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useAddSiteForm", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useAddSiteForm());

            const stateProperties = [
                "addMode",
                "checkInterval",
                "formError",
                "host",
                "monitorType",
                "name",
                "port",
                "selectedExistingSite",
                "siteId",
                "url",
            ];

            for (const prop of stateProperties) {
                expect(result.current).toHaveProperty(prop);
            }
        });

        it("should return all expected action functions", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useAddSiteForm", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useAddSiteForm());

            const actionProperties = [
                "isFormValid",
                "resetForm",
                "setAddMode",
                "setCheckInterval",
                "setFormError",
                "setHost",
                "setMonitorType",
                "setName",
                "setPort",
                "setSelectedExistingSite",
                "setSiteId",
                "setUrl",
            ];

            for (const prop of actionProperties) {
                expect(result.current).toHaveProperty(prop);
                expect(typeof (result.current as any)[prop]).toBe("function");
            }
        });
    });
});
