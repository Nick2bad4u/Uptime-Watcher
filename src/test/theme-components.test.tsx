/**
 * Tests for theme components.
 * Comprehensive coverage for theme UI components.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";

// Mock the theme utilities first
vi.mock("../theme/useTheme", () => ({
    useTheme: () => ({
        getColor: vi.fn().mockReturnValue("#000000"),
        getStatusColor: vi.fn().mockReturnValue("#28a745"),
        getBackgroundClass: vi.fn().mockReturnValue({}),
        getTextClass: vi.fn().mockReturnValue({}),
        getBorderClass: vi.fn().mockReturnValue({}),
        isDark: false,
        currentTheme: {
            colors: {
                primary: "#007bff",
                secondary: "#6c757d",
                background: {
                    primary: "#ffffff",
                    secondary: "#f8f9fa",
                },
                text: {
                    primary: "#000000",
                    secondary: "#6c757d",
                },
                border: "#dee2e6",
                accent: "#007bff",
                success: "#28a745",
                warning: "#ffc107",
                error: "#dc3545",
            },
            typography: {
                fontSize: {
                    xs: "0.75rem",
                    sm: "0.875rem",
                    base: "1rem",
                    lg: "1.125rem",
                    xl: "1.25rem",
                },
                fontWeight: {
                    light: "300",
                    normal: "400",
                    medium: "500",
                    semibold: "600",
                    bold: "700",
                },
            },
            spacing: {
                xs: "0.25rem",
                sm: "0.5rem",
                md: "1rem",
                lg: "1.5rem",
                xl: "2rem",
            },
            borderRadius: {
                sm: "0.25rem",
                md: "0.375rem",
                lg: "0.5rem",
                full: "9999px",
            },
        }
    }),
    useThemeClasses: () => ({
        box: "mock-box-class",
        text: "mock-text-class",
        button: "mock-button-class",
        getBackgroundClass: vi.fn().mockReturnValue({}),
        getTextClass: vi.fn().mockReturnValue({}),
        getBorderClass: vi.fn().mockReturnValue({}),
    })
}));

vi.mock("../utils/status", () => ({
    getStatusIcon: () => "✅"
}));

vi.mock("../utils/time", () => ({
    formatResponseTime: (ms: number) => `${ms}ms`
}));

import {
    ThemeProvider,
    ThemedBox,
    ThemedText,
    ThemedButton,
    ThemedBadge,
    ThemedInput,
    ThemedSelect,
    ThemedCheckbox,
    StatusIndicator,
    ThemedIconButton,
    ThemedCard,
    ThemedProgress,
    ThemedTooltip,
    MiniChartBar
} from "../theme/components";

describe("Theme Components", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("ThemeProvider", () => {
        it("should render children", () => {
            render(
                <ThemeProvider>
                    <div>Test Content</div>
                </ThemeProvider>
            );
            
            expect(screen.getByText("Test Content")).toBeInTheDocument();
        });
    });

    describe("ThemedBox", () => {
        it("should render with default props", () => {
            render(<ThemedBox>Test content</ThemedBox>);
            
            const box = screen.getByText("Test content");
            expect(box).toBeInTheDocument();
        });

        it("should render with variant", () => {
            render(<ThemedBox variant="primary">Primary box</ThemedBox>);
            
            const box = screen.getByText("Primary box");
            expect(box).toBeInTheDocument();
        });

        it("should render with surface", () => {
            render(<ThemedBox surface="elevated">Elevated box</ThemedBox>);
            
            const box = screen.getByText("Elevated box");
            expect(box).toBeInTheDocument();
        });

        it("should render with padding", () => {
            render(<ThemedBox padding="lg">Padded box</ThemedBox>);
            
            const box = screen.getByText("Padded box");
            expect(box).toBeInTheDocument();
        });
    });

    describe("ThemedText", () => {
        it("should render text content", () => {
            render(<ThemedText>Test text</ThemedText>);
            
            const text = screen.getByText("Test text");
            expect(text).toBeInTheDocument();
        });

        it("should render with variant", () => {
            render(<ThemedText variant="primary">Primary text</ThemedText>);
            
            const text = screen.getByText("Primary text");
            expect(text).toBeInTheDocument();
        });

        it("should render with size", () => {
            render(<ThemedText size="lg">Large text</ThemedText>);
            
            const text = screen.getByText("Large text");
            expect(text).toBeInTheDocument();
        });

        it("should render with weight", () => {
            render(<ThemedText weight="bold">Bold text</ThemedText>);
            
            const text = screen.getByText("Bold text");
            expect(text).toBeInTheDocument();
        });
    });

    describe("ThemedButton", () => {
        it("should render button with default props", () => {
            render(<ThemedButton>Click me</ThemedButton>);
            
            const button = screen.getByRole("button", { name: "Click me" });
            expect(button).toBeInTheDocument();
        });

        it("should handle click events", async () => {
            const user = userEvent.setup();
            const handleClick = vi.fn();
            
            render(<ThemedButton onClick={handleClick}>Click me</ThemedButton>);
            
            const button = screen.getByRole("button", { name: "Click me" });
            await user.click(button);
            
            expect(handleClick).toHaveBeenCalledTimes(1);
        });

        it("should render with variant", () => {
            render(<ThemedButton variant="primary">Primary button</ThemedButton>);
            
            const button = screen.getByRole("button", { name: "Primary button" });
            expect(button).toBeInTheDocument();
        });

        it("should render with size", () => {
            render(<ThemedButton size="lg">Large button</ThemedButton>);
            
            const button = screen.getByRole("button", { name: "Large button" });
            expect(button).toBeInTheDocument();
        });

        it("should be disabled when disabled prop is true", () => {
            render(<ThemedButton disabled>Disabled button</ThemedButton>);
            
            const button = screen.getByRole("button", { name: "Disabled button" });
            expect(button).toBeDisabled();
        });
    });

    describe("ThemedBadge", () => {
        it("should render badge content", () => {
            render(<ThemedBadge>Badge text</ThemedBadge>);
            
            const badge = screen.getByText("Badge text");
            expect(badge).toBeInTheDocument();
        });

        it("should render with variant", () => {
            render(<ThemedBadge variant="success">Success badge</ThemedBadge>);
            
            const badge = screen.getByText("Success badge");
            expect(badge).toBeInTheDocument();
        });

        it("should render with size", () => {
            render(<ThemedBadge size="lg">Large badge</ThemedBadge>);
            
            const badge = screen.getByText("Large badge");
            expect(badge).toBeInTheDocument();
        });
    });

    describe("ThemedInput", () => {
        it("should render input field", () => {
            render(<ThemedInput placeholder="Enter text" />);
            
            const input = screen.getByPlaceholderText("Enter text");
            expect(input).toBeInTheDocument();
        });

        it("should handle value changes", async () => {
            const user = userEvent.setup();
            const handleChange = vi.fn();
            
            render(<ThemedInput placeholder="Enter text" onChange={handleChange} />);
            
            const input = screen.getByPlaceholderText("Enter text");
            await user.type(input, "test");
            
            expect(handleChange).toHaveBeenCalled();
        });

        it("should render with type", () => {
            render(<ThemedInput type="email" placeholder="Email input" />);
            
            const input = screen.getByPlaceholderText("Email input");
            expect(input).toBeInTheDocument();
            expect(input).toHaveAttribute("type", "email");
        });

        it("should render disabled", () => {
            render(<ThemedInput disabled placeholder="Disabled input" />);
            
            const input = screen.getByPlaceholderText("Disabled input");
            expect(input).toBeDisabled();
        });
    });

    describe("ThemedSelect", () => {
        it("should render select field", () => {
            render(
                <ThemedSelect>
                    <option value="1">Option 1</option>
                    <option value="2">Option 2</option>
                </ThemedSelect>
            );
            
            const select = screen.getByRole("combobox");
            expect(select).toBeInTheDocument();
        });

        it("should handle value changes", async () => {
            const user = userEvent.setup();
            const handleChange = vi.fn();
            
            render(
                <ThemedSelect onChange={handleChange}>
                    <option value="1">Option 1</option>
                    <option value="2">Option 2</option>
                </ThemedSelect>
            );
            
            const select = screen.getByRole("combobox");
            await user.selectOptions(select, "2");
            
            expect(handleChange).toHaveBeenCalled();
        });

        it("should render with disabled", () => {
            render(
                <ThemedSelect disabled>
                    <option value="1">Option 1</option>
                </ThemedSelect>
            );
            
            const select = screen.getByRole("combobox");
            expect(select).toBeDisabled();
        });

        it("should render with required", () => {
            render(
                <ThemedSelect required>
                    <option value="1">Option 1</option>
                </ThemedSelect>
            );
            
            const select = screen.getByRole("combobox");
            expect(select).toBeRequired();
        });
    });

    describe("ThemedCheckbox", () => {
        it("should render checkbox", () => {
            render(<ThemedCheckbox aria-label="Test checkbox" />);
            
            const checkbox = screen.getByRole("checkbox");
            expect(checkbox).toBeInTheDocument();
        });

        it("should handle check/uncheck", async () => {
            const user = userEvent.setup();
            const handleChange = vi.fn();
            
            render(<ThemedCheckbox onChange={handleChange} aria-label="Test checkbox" />);
            
            const checkbox = screen.getByRole("checkbox");
            await user.click(checkbox);
            
            expect(handleChange).toHaveBeenCalled();
        });

        it("should render with checked state", () => {
            render(<ThemedCheckbox checked={true} aria-label="Checked checkbox" />);
            
            const checkbox = screen.getByRole("checkbox");
            expect(checkbox).toBeChecked();
        });

        it("should render with disabled state", () => {
            render(<ThemedCheckbox disabled={true} aria-label="Disabled checkbox" />);
            
            const checkbox = screen.getByRole("checkbox");
            expect(checkbox).toBeDisabled();
        });

        it("should render with required", () => {
            render(<ThemedCheckbox required aria-label="Required checkbox" />);
            
            const checkbox = screen.getByRole("checkbox");
            expect(checkbox).toBeRequired();
        });
    });

    describe("StatusIndicator", () => {
        it("should render with up status", () => {
            render(<StatusIndicator status="up" />);
            
            const indicator = document.querySelector('.themed-status-indicator');
            expect(indicator).toBeInTheDocument();
            
            const dot = document.querySelector('.themed-status-indicator__dot');
            expect(dot).toBeInTheDocument();
        });

        it("should render with down status", () => {
            render(<StatusIndicator status="down" />);
            
            const indicator = document.querySelector('.themed-status-indicator');
            expect(indicator).toBeInTheDocument();
            
            const dot = document.querySelector('.themed-status-indicator__dot');
            expect(dot).toBeInTheDocument();
        });

        it("should render with showText", () => {
            render(<StatusIndicator status="up" showText />);
            
            const indicator = screen.getByText("✅"); // This works when showText is true
            expect(indicator).toBeInTheDocument();
        });

        it("should render with size", () => {
            render(<StatusIndicator status="up" size="lg" />);
            
            const indicator = document.querySelector('.themed-status-indicator');
            expect(indicator).toBeInTheDocument();
            
            const dot = document.querySelector('.themed-status-indicator__dot');
            expect(dot).toBeInTheDocument();
        });
    });

    describe("ThemedIconButton", () => {
        it("should render icon button", () => {
            render(<ThemedIconButton icon="★" />);
            
            const icon = screen.getByText("★");
            expect(icon).toBeInTheDocument();
            // Check that it's inside a button element
            expect(icon.closest('button')).toBeInTheDocument();
        });

        it("should handle click events", async () => {
            const user = userEvent.setup();
            const handleClick = vi.fn();
            
            render(<ThemedIconButton icon="★" onClick={handleClick} />);
            
            const button = screen.getByText("★").closest('button');
            await user.click(button!);
            
            expect(handleClick).toHaveBeenCalledTimes(1);
        });

        it("should render with variant", () => {
            render(<ThemedIconButton icon="★" variant="primary" />);
            
            const icon = screen.getByText("★");
            expect(icon).toBeInTheDocument();
            expect(icon.closest('button')).toBeInTheDocument();
        });

        it("should render with size", () => {
            render(<ThemedIconButton icon="★" size="lg" />);
            
            const icon = screen.getByText("★");
            expect(icon).toBeInTheDocument();
            expect(icon.closest('button')).toBeInTheDocument();
        });
    });

    describe("ThemedCard", () => {
        it("should render card content", () => {
            render(<ThemedCard>Card content</ThemedCard>);
            
            const card = screen.getByText("Card content");
            expect(card).toBeInTheDocument();
        });

        it("should render with variant", () => {
            render(<ThemedCard variant="primary">Primary card</ThemedCard>);
            
            const card = screen.getByText("Primary card");
            expect(card).toBeInTheDocument();
        });

        it("should render with padding", () => {
            render(<ThemedCard padding="lg">Padded card</ThemedCard>);
            
            const card = screen.getByText("Padded card");
            expect(card).toBeInTheDocument();
        });
    });

    describe("ThemedProgress", () => {
        it("should render progress bar", () => {
            render(<ThemedProgress value={50} max={100} />);
            
            const progress = document.querySelector('.themed-progress');
            expect(progress).toBeInTheDocument();
        });

        it("should render with variant", () => {
            render(<ThemedProgress value={50} max={100} variant="success" />);
            
            const progress = document.querySelector('.themed-progress');
            expect(progress).toBeInTheDocument();
        });

        it("should render with size", () => {
            render(<ThemedProgress value={50} max={100} size="lg" />);
            
            const progress = document.querySelector('.themed-progress');
            expect(progress).toBeInTheDocument();
        });
    });

    describe("ThemedTooltip", () => {
        it("should render tooltip content", () => {
            render(
                <ThemedTooltip content="Tooltip text">
                    <button>Hover me</button>
                </ThemedTooltip>
            );
            
            const button = screen.getByRole("button", { name: "Hover me" });
            expect(button).toBeInTheDocument();
        });
    });

    describe("MiniChartBar", () => {
        it("should render mini chart bar", () => {
            render(<MiniChartBar responseTime={150} status="up" timestamp={Date.now()} />);
            
            // The component renders a div with title attribute, check if it's in the document
            const chartBar = document.querySelector('.themed-mini-chart-bar');
            expect(chartBar).toBeInTheDocument();
            expect(chartBar).toHaveAttribute('title', expect.stringContaining('150ms'));
        });

        it("should render with different status", () => {
            render(<MiniChartBar responseTime={500} status="down" timestamp={Date.now()} />);
            
            const chartBar = document.querySelector('.themed-mini-chart-bar');
            expect(chartBar).toBeInTheDocument();
            expect(chartBar).toHaveAttribute('title', expect.stringContaining('500ms'));
        });
    });
});
