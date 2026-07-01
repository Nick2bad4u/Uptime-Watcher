import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Test mock
const mockHook = vi.fn(() => ({ value: "mocked" }));

vi.mock(import('../components/SiteDetails/useAddSiteForm'), () => ({
    useAddSiteForm: mockHook,
}));

// Simple test component
function TestComponent() {
    const result = mockHook();
    return <div>{result.value}</div>;
}

describe("Mock Test", () => {
    it("should use mocked version", () => {
        render(<TestComponent />);
        expect(mockHook).toHaveBeenCalledWith();
    });
});
