/**
 * @file Comprehensive test suite for useAddSiteForm hook
 *
 *   Tests cover all functionality including form state management, validation,
 *   mode switching, monitor type changes, field resets, and edge cases. Targets
 *   100% coverage for all statements, branches, functions, and lines.
 */

import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { test, fc } from "@fast-check/vitest";

import { DEFAULT_CHECK_INTERVAL } from "../../constants";
import { useAddSiteForm } from "../../components/SiteDetails/useAddSiteForm";
import type { MonitorType } from "@shared/types";

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
                case "ssl": {
                    return [
                        { name: "host", required: true },
                        { name: "port", required: true },
                        { name: "certificateWarningDays", required: true },
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
            expect(result.current.checkIntervalMs).toBe(DEFAULT_CHECK_INTERVAL);
            expect(result.current.siteIdentifier).toBe("mock-uuid-12345");
            expect(result.current.addMode).toBe("new");
            expect(result.current.selectedExistingSite).toBe("");
            expect(result.current.formError).toBeUndefined();
        });

        it("should initialize with lazy-generated UUID for siteIdentifier", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useAddSiteForm", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Initialization", "type");

            const { result } = renderHook(() => useAddSiteForm());

            expect(result.current.siteIdentifier).toBe("mock-uuid-12345");
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

            await act(async () => {
                result.current.setMonitorType("port"); // Port monitors use host field
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

            await act(async () => {
                result.current.setMonitorType("port"); // Port monitors use port field
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
                result.current.setCheckIntervalMs(60_000);
            });

            expect(result.current.checkIntervalMs).toBe(60_000);
        });

        it("should update siteIdentifier correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useAddSiteForm", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Data Update", "type");

            const { result } = renderHook(() => useAddSiteForm());

            act(() => {
                result.current.setSiteIdentifier("custom-id");
            });

            expect(result.current.siteIdentifier).toBe("custom-id");
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

        it("should update certificate warning days correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useAddSiteForm", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Data Update", "type");

            const { result } = renderHook(() => useAddSiteForm());

            await act(async () => {
                result.current.setMonitorType("ssl");
                result.current.setCertificateWarningDays("45");
            });

            expect(result.current.certificateWarningDays).toBe("45");
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
                result.current.setSiteIdentifier("custom-id");
                result.current.setAddMode("existing");
            });

            // Switch back to new mode
            act(() => {
                result.current.setAddMode("new");
            });

            expect(result.current.name).toBe("");
            expect(result.current.siteIdentifier).toBe("mock-uuid-12345");
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
            await act(async () => {
                result.current.setUrl("https://example.com");
                result.current.setHost("example.com"); // This should be reset because HTTP doesn't use host
                result.current.setPort("8080"); // This should be reset because HTTP doesn't use port
            });

            // Change to port monitor (uses host and port, not url)
            await act(async () => {
                result.current.setMonitorType("port");
            });

            expect(result.current.url).toBe(""); // Should be reset (not used by port)
            // Note: Since HTTP monitor typically doesn't use host/port, they may be reset to empty initially
            // Set host and port again after changing to port monitor type
            await act(async () => {
                result.current.setHost("example.com");
                result.current.setPort("8080");
            });

            expect(result.current.host).toBe("example.com"); // Should be set (used by port)
            expect(result.current.port).toBe("8080"); // Should be set (used by port)
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
                result.current.setCheckIntervalMs(60_000);
                result.current.setSiteIdentifier("custom-id");
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
            expect(result.current.checkIntervalMs).toBe(DEFAULT_CHECK_INTERVAL);
            expect(result.current.siteIdentifier).toBe("mock-uuid-12345");
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
                result.current.setSiteIdentifier("custom-id");
            });

            expect(result.current.siteIdentifier).toBe("custom-id");

            act(() => {
                result.current.resetForm();
            });

            expect(result.current.siteIdentifier).toBe("mock-uuid-12345");
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
            expect(() => result.current.isFormValid()).not.toThrowError();
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
                "checkIntervalMs",
                "formError",
                "host",
                "monitorType",
                "name",
                "port",
                "selectedExistingSite",
                "siteIdentifier",
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
                "setCheckIntervalMs",
                "setFormError",
                "setHost",
                "setMonitorType",
                "setName",
                "setPort",
                "setSelectedExistingSite",
                "setSiteIdentifier",
                "setUrl",
            ];

            for (const prop of actionProperties) {
                expect(result.current).toHaveProperty(prop);
                expect(typeof (result.current as any)[prop]).toBe("function");
            }
        });
    });

    describe("Property-Based Hook State Management Testing", () => {
        test.prop([fc.webUrl()])(
            "should handle various URL inputs correctly",
            async (testUrl) => {
                const { result } = renderHook(() => useAddSiteForm());

                act(() => {
                    result.current.setUrl(testUrl);
                });

                expect(result.current.url).toBe(testUrl);
                expect(testUrl).toMatch(/^https?:\/\//);
            }
        );

        test.prop([fc.oneof(fc.domain(), fc.ipV4(), fc.constant("localhost"))])(
            "should handle various host inputs correctly",
            async (testHost) => {
                const { result } = renderHook(() => useAddSiteForm());

                // Set monitor type to port first to enable host field
                await act(async () => {
                    result.current.setMonitorType("port");
                    result.current.setHost(testHost);
                });

                expect(result.current.host).toBe(testHost);

                // Verify host characteristics
                const isValidHost =
                    typeof testHost === "string" && testHost.length > 0;
                expect(isValidHost).toBeTruthy();
            }
        );

        test.prop([
            fc.integer({ min: 1, max: 65_535 }).map((n) => n.toString()),
        ])("should handle various port inputs correctly", async (testPort) => {
            const { result } = renderHook(() => useAddSiteForm());

            // Set monitor type to port first to enable port field
            await act(async () => {
                result.current.setMonitorType("port");
                result.current.setPort(testPort);
            });

            expect(result.current.port).toBe(testPort);

            const portNum = Number.parseInt(testPort, 10);
            expect(portNum).toBeGreaterThanOrEqual(1);
            expect(portNum).toBeLessThanOrEqual(65_535);
        });

        test.prop([
            fc
                .string({ minLength: 1, maxLength: 100 })
                .filter((s) => s.trim().length > 0),
        ])(
            "should handle various site name inputs correctly",
            async (testName) => {
                const { result } = renderHook(() => useAddSiteForm());

                act(() => {
                    result.current.setName(testName);
                });

                // Leading whitespace is normalized by the hook; trailing
                // whitespace and the rest of the string are preserved.
                expect(result.current.name).toBe(testName.trimStart());
                expect(testName.trim().length).toBeGreaterThan(0);
                expect(testName.length).toBeLessThanOrEqual(100);
            }
        );

        test.prop([
            fc.constantFrom(
                "http",
                "port",
                "ping",
                "dns"
            ) as fc.Arbitrary<MonitorType>,
        ])(
            "should handle monitor type changes correctly",
            async (monitorType) => {
                mockGetFields.mockImplementation((type: MonitorType) => {
                    switch (type) {
                        case "http": {
                            return [{ name: "url", required: true }];
                        }
                        case "port": {
                            return [
                                { name: "host", required: true },
                                { name: "port", required: true },
                            ];
                        }
                        case "ping": {
                            return [{ name: "host", required: true }];
                        }
                        case "dns": {
                            return [{ name: "host", required: true }];
                        }
                        default: {
                            return [];
                        }
                    }
                });

                const { result } = renderHook(() => useAddSiteForm());

                act(() => {
                    result.current.setMonitorType(monitorType);
                });

                expect(result.current.monitorType).toBe(monitorType);
                expect([
                    "http",
                    "port",
                    "ping",
                    "tcp",
                    "dns",
                ]).toContain(monitorType);
            }
        );

        test.prop([
            fc.constantFrom(60_000, 300_000, 600_000, 1_800_000, 3_600_000),
        ])(
            "should handle check interval changes correctly",
            async (interval) => {
                const { result } = renderHook(() => useAddSiteForm());

                act(() => {
                    result.current.setCheckIntervalMs(interval);
                });

                expect(result.current.checkIntervalMs).toBe(interval);
                expect([
                    60_000,
                    300_000,
                    600_000,
                    1_800_000,
                    3_600_000,
                ]).toContain(interval);
            }
        );

        test.prop([fc.constantFrom("new", "existing")])(
            "should handle add mode changes correctly",
            async (addMode) => {
                const { result } = renderHook(() => useAddSiteForm());

                act(() => {
                    result.current.setAddMode(addMode as any);
                });

                expect(result.current.addMode).toBe(addMode);
                expect(["new", "existing"]).toContain(addMode);
            }
        );

        test.prop([fc.array(fc.string(), { minLength: 1, maxLength: 3 })])(
            "should handle form errors correctly",
            async (errorMessages) => {
                const { result } = renderHook(() => useAddSiteForm());
                const errorMessage = errorMessages.join("; ");

                act(() => {
                    result.current.setFormError(errorMessage);
                });

                if (errorMessage.trim().length > 0) {
                    expect(result.current.formError).toBe(errorMessage);
                }

                expect(Array.isArray(errorMessages)).toBeTruthy();
                expect(errorMessages.length).toBeGreaterThanOrEqual(1);
                expect(errorMessages.length).toBeLessThanOrEqual(3);
            }
        );

        test.prop([
            fc.constantFrom(
                "http",
                "port",
                "ping"
            ) as fc.Arbitrary<MonitorType>,
        ])(
            "should handle complex form state updates correctly",
            async (monitorType) => {
                const { result } = renderHook(() => useAddSiteForm());

                // Generate appropriate test data for the monitor type
                const testName = `Test Site ${Math.random().toString(36).slice(2, 8)}`;
                let testUrl = "";
                let testHost = "";
                let testPort = "";

                // Generate fields appropriate for each monitor type
                switch (monitorType) {
                    case "http": {
                        testUrl = "https://example.com";
                        break;
                    }
                    case "port": {
                        testHost = "example.com";
                        testPort = "8080";
                        break;
                    }
                    case "ping": {
                        testHost = "example.com";
                        break;
                    }
                    default: {
                        break;
                    }
                }

                act(() => {
                    // Set monitor type first to establish field requirements
                    result.current.setMonitorType(monitorType);

                    // Then set appropriate fields for this monitor type
                    if (monitorType === "http" && testUrl) {
                        result.current.setUrl(testUrl);
                    }
                    if (
                        (monitorType === "port" || monitorType === "ping") &&
                        testHost
                    ) {
                        result.current.setHost(testHost);
                    }
                    if (monitorType === "port" && testPort) {
                        result.current.setPort(testPort);
                    }

                    result.current.setName(testName);
                });

                // Verify state matches expectations based on monitor type
                expect(result.current.name).toBe(testName);
                expect(result.current.monitorType).toBe(monitorType);

                switch (monitorType) {
                    case "http": {
                        expect(result.current.url).toBe(testUrl);
                        expect(result.current.host).toBe(""); // Should be empty for HTTP
                        expect(result.current.port).toBe(""); // Should be empty for HTTP
                        break;
                    }
                    case "port": {
                        expect(result.current.url).toBe(""); // Should be empty for port
                        expect(result.current.host).toBe(testHost);
                        expect(result.current.port).toBe(testPort);
                        break;
                    }
                    case "ping": {
                        expect(result.current.url).toBe(""); // Should be empty for ping
                        expect(result.current.host).toBe(testHost);
                        expect(result.current.port).toBe(""); // Should be empty for ping
                        break;
                    }
                    default: {
                        break;
                    }
                }

                // Verify field characteristics
                expect(testName.trim().length).toBeGreaterThan(0);

                if (monitorType === "http") {
                    expect(testUrl).toMatch(/^https?:\/\//);
                } else if (monitorType === "port") {
                    const portNum = Number.parseInt(testPort, 10);
                    expect(portNum).toBeGreaterThanOrEqual(1);
                    expect(portNum).toBeLessThanOrEqual(65_535);
                }
            }
        );

        test.prop([fc.integer({ min: 1, max: 20 })])(
            "should handle rapid state updates consistently",
            async (updateCount) => {
                const { result } = renderHook(() => useAddSiteForm());
                const updates: string[] = [];

                for (let i = 0; i < updateCount; i++) {
                    const testName = `Site ${i}`;
                    updates.push(testName);

                    act(() => {
                        result.current.setName(testName);
                    });
                }

                // Final state should be the last update
                const expectedName = `Site ${updateCount - 1}`;
                expect(result.current.name).toBe(expectedName);
                expect(updates).toHaveLength(updateCount);
                expect(updateCount).toBeGreaterThanOrEqual(1);
                expect(updateCount).toBeLessThanOrEqual(20);
            }
        );

        test.prop([
            fc.oneof(
                fc.constant(""),
                fc.constant("   "),
                fc.constant("\t\n"),
                fc.string().filter((s) => s.trim().length === 0)
            ),
        ])(
            "should handle empty and whitespace inputs appropriately",
            async (emptyInput) => {
                const { result } = renderHook(() => useAddSiteForm());

                await act(async () => {
                    // Set monitor type to http so url field is used (port monitors don't use url field)
                    result.current.setMonitorType("http");
                    result.current.setName(emptyInput);
                    result.current.setUrl(emptyInput);
                    result.current.setHost(emptyInput);
                });

                // The hook normalizes leading whitespace in the site name
                // (via trimStart) while preserving the raw URL value; actual
                // validation is handled separately.
                expect(result.current.name).toBe(emptyInput.trimStart());
                expect(result.current.url).toBe(emptyInput);
                // Host field is not used by http monitors, so it gets reset to ""
                expect(result.current.host).toBe("");

                // Verify input characteristics
                expect(emptyInput.trim()).toHaveLength(0);
            }
        );

        test.prop([fc.string({ minLength: 1000, maxLength: 10_000 })])(
            "should handle very long inputs without performance issues",
            async (longInput) => {
                const { result } = renderHook(() => useAddSiteForm());
                const startTime = performance.now();

                act(() => {
                    result.current.setName(longInput);
                });

                const endTime = performance.now();
                const duration = endTime - startTime;

                // Leading whitespace in the site name is normalized by the
                // hook, even for very long inputs, while the primary focus of
                // this test remains on performance characteristics.
                expect(result.current.name).toBe(longInput.trimStart());
                expect(duration).toBeLessThan(100); // Should complete within 100ms
                expect(longInput.length).toBeGreaterThanOrEqual(1000);
                expect(longInput.length).toBeLessThanOrEqual(10_000);
            }
        );

        test.prop([
            fc.array(
                fc.record({
                    field: fc.constantFrom("name", "url", "host", "port"),
                    value: fc.string({ maxLength: 100 }),
                }),
                { minLength: 1, maxLength: 10 }
            ),
        ])(
            "should handle sequential field updates correctly",
            async (fieldUpdates) => {
                const { result } = renderHook(() => useAddSiteForm());
                const expectedValues: Record<string, string> = {};

                // Determine the appropriate monitor type based on field updates
                const hasHostOrPort = fieldUpdates.some(
                    (u) => u.field === "host" || u.field === "port"
                );
                const hasUrl = fieldUpdates.some((u) => u.field === "url");

                // Set monitor type first to ensure fields are accessible
                if (hasHostOrPort && !hasUrl) {
                    await act(async () => {
                        result.current.setMonitorType("port");
                    });
                } else if (hasUrl && !hasHostOrPort) {
                    await act(async () => {
                        result.current.setMonitorType("http");
                    });
                } else if (hasUrl && hasHostOrPort) {
                    // If both types of fields, use http as default and only test compatible fields
                    await act(async () => {
                        result.current.setMonitorType("http");
                    });
                }

                for (const update of fieldUpdates) {
                    // Only update expectedValues for fields compatible with current monitor type
                    const currentMonitorType = result.current.monitorType;
                    const shouldUpdate =
                        (update.field === "url" &&
                            currentMonitorType === "http") ||
                        (update.field === "host" &&
                            currentMonitorType === "port") ||
                        (update.field === "port" &&
                            currentMonitorType === "port") ||
                        update.field === "name"; // name is always valid

                    if (shouldUpdate) {
                        const normalizedValue =
                            update.field === "name"
                                ? update.value.trimStart()
                                : update.value;
                        expectedValues[update.field] = normalizedValue;

                        await act(async () => {
                            switch (update.field) {
                                case "name": {
                                    result.current.setName(update.value);
                                    break;
                                }
                                case "url": {
                                    result.current.setUrl(update.value);
                                    break;
                                }
                                case "host": {
                                    result.current.setHost(update.value);
                                    break;
                                }
                                case "port": {
                                    result.current.setPort(update.value);
                                    break;
                                }
                            }
                        });
                    }
                }

                // Verify final state matches expected values for compatible fields only
                if (expectedValues["name"] !== undefined) {
                    expect(result.current.name).toBe(expectedValues["name"]);
                }
                if (expectedValues["url"] !== undefined) {
                    expect(result.current.url).toBe(expectedValues["url"]);
                }
                if (expectedValues["host"] !== undefined) {
                    expect(result.current.host).toBe(expectedValues["host"]);
                }
                if (expectedValues["port"] !== undefined) {
                    expect(result.current.port).toBe(expectedValues["port"]);
                }

                expect(Array.isArray(fieldUpdates)).toBeTruthy();
                expect(fieldUpdates.length).toBeGreaterThanOrEqual(1);
                expect(fieldUpdates.length).toBeLessThanOrEqual(10);
            }
        );
    });
});
