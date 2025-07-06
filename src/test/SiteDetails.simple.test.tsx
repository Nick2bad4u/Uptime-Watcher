import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { SiteDetailsHeader } from "../components/SiteDetails/SiteDetailsHeader";
import { Site } from "../types";

// Global browser API mocks
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Clean setup and teardown
beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});

// Mock theme
vi.mock("../theme/useTheme", () => ({
  useTheme: vi.fn(() => ({
    currentTheme: {
      colors: {
        primary: "#0066cc",
        secondary: "#6c757d",
        background: "#ffffff",
        text: "#333333",
      },
    },
    setTheme: vi.fn(),
  })),
  useAvailabilityColors: vi.fn(() => ({
    getAvailabilityColor: vi.fn(() => "#00ff00"),
    getAvailabilityVariant: vi.fn((percentage: number) => {
      if (percentage >= 99) return "success";
      if (percentage >= 95) return "warning";
      return "danger";
    }),
  })),
}));

// Mock logger
vi.mock("../services/logger", () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    user: {
      action: vi.fn(),
    },
  },
}));

// Mock theme components with safe props filtering
vi.mock("../theme/components", () => ({
  ThemedBox: ({ children, ...safeProps }: React.PropsWithChildren<Record<string, unknown>>) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { showLabel, iconColor, hoverable, showText, loading, variant, size, ...props } = safeProps;
    return <div {...props}>{children}</div>;
  },
  ThemedText: ({ children, ...safeProps }: React.PropsWithChildren<Record<string, unknown>>) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { showLabel, iconColor, hoverable, showText, loading, variant, size, ...props } = safeProps;
    return <span {...props}>{children}</span>;
  },
  StatusIndicator: ({ children, ...safeProps }: React.PropsWithChildren<Record<string, unknown>>) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { showLabel, iconColor, hoverable, showText, loading, variant, size, ...props } = safeProps;
    return <span {...props}>{children}</span>;
  },
  ThemedBadge: ({ children, ...safeProps }: React.PropsWithChildren<Record<string, unknown>>) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { showLabel, iconColor, hoverable, showText, loading, variant, size, ...props } = safeProps;
    return <span {...props}>{children}</span>;
  },
}));

const mockSite: Site = {
  identifier: "test-site-1",
  name: "Test Site",
  monitors: [
    {
      id: "monitor-1",
      type: "http",
      status: "up",
      url: "https://example.com",
      port: 443,
      responseTime: 250,
      lastChecked: new Date("2024-01-01T00:00:00Z"),
      history: [
        {
          timestamp: Date.now(),
          status: "up",
          responseTime: 250,
        },
      ],
      monitoring: true,
      checkInterval: 300,
      timeout: 5000,
      retryAttempts: 3,
    },
  ],
};

describe("SiteDetails Simple Tests", () => {
  describe("SiteDetailsHeader", () => {
    it("should render with valid site", { timeout: 1000 }, () => {
      render(<SiteDetailsHeader site={mockSite} />);
      expect(screen.getByText("Test Site")).toBeInTheDocument();
    });
  });
});
