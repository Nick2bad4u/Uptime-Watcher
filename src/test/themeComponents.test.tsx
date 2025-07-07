/**
 * Tests for theme components.
 * Comprehensive coverage for theme UI components.
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock the theme utilities first
vi.mock("../theme/useTheme", () => ({
    useTheme: () => ({
        currentTheme: {
            borderRadius: {
                full: "9999px",
                lg: "0.5rem",
                md: "0.375rem",
                sm: "0.25rem",
            },
            colors: {
                accent: "#007bff",
                background: {
                    primary: "#ffffff",
                    secondary: "#f8f9fa",
                },
                border: "#dee2e6",
                error: "#dc3545",
                primary: "#007bff",
                secondary: "#6c757d",
                success: "#28a745",
                text: {
                    primary: "#000000",
                    secondary: "#6c757d",
                },
                warning: "#ffc107",
            },
            spacing: {
                lg: "1.5rem",
                md: "1rem",
                sm: "0.5rem",
                xl: "2rem",
                xs: "0.25rem",
            },
            typography: {
                fontSize: {
                    base: "1rem",
                    lg: "1.125rem",
                    sm: "0.875rem",
                    xl: "1.25rem",
                    xs: "0.75rem",
                },
                fontWeight: {
                    bold: "700",
                    light: "300",
                    medium: "500",
                    normal: "400",
                    semibold: "600",
                },
            },
        },
        getBackgroundClass: vi.fn().mockReturnValue({}),
        getBorderClass: vi.fn().mockReturnValue({}),
        getColor: vi.fn().mockReturnValue("#000000"),
        getStatusColor: vi.fn().mockReturnValue("#28a745"),
        getTextClass: vi.fn().mockReturnValue({}),
        isDark: false,
    }),
    useThemeClasses: () => ({
        box: "mock-box-class",
        button: "mock-button-class",
        getBackgroundClass: vi.fn().mockReturnValue({}),
        getBorderClass: vi.fn().mockReturnValue({}),
        getTextClass: vi.fn().mockReturnValue({}),
        text: "mock-text-class",
    }),
}));

vi.mock("../utils/status", () => ({
    getStatusIcon: () => "✅",
}));

vi.mock("../utils/time", () => ({
    formatResponseTime: (ms: number) => `${ms}ms`,
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
    MiniChartBar,
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

        it("should render with secondary variant", () => {
            render(<ThemedBox variant="secondary">Secondary box</ThemedBox>);

            const box = screen.getByText("Secondary box");
            expect(box).toBeInTheDocument();
        });

        it("should render with tertiary variant", () => {
            render(<ThemedBox variant="tertiary">Tertiary box</ThemedBox>);

            const box = screen.getByText("Tertiary box");
            expect(box).toBeInTheDocument();
        });

        it("should render with base surface", () => {
            render(<ThemedBox surface="base">Base surface</ThemedBox>);

            const box = screen.getByText("Base surface");
            expect(box).toBeInTheDocument();
        });

        it("should render with overlay surface", () => {
            render(<ThemedBox surface="overlay">Overlay surface</ThemedBox>);

            const box = screen.getByText("Overlay surface");
            expect(box).toBeInTheDocument();
        });

        it("should render with different padding sizes", () => {
            render(<ThemedBox padding="xs">XS Padding</ThemedBox>);

            const box = screen.getByText("XS Padding");
            expect(box).toBeInTheDocument();
        });

        it("should render with border", () => {
            render(<ThemedBox border>Bordered box</ThemedBox>);

            const box = screen.getByText("Bordered box");
            expect(box).toBeInTheDocument();
        });

        it("should render with shadow", () => {
            render(<ThemedBox shadow="lg">Shadow box</ThemedBox>);

            const box = screen.getByText("Shadow box");
            expect(box).toBeInTheDocument();
        });

        it("should render with rounded corners", () => {
            render(<ThemedBox rounded="xl">Rounded box</ThemedBox>);

            const box = screen.getByText("Rounded box");
            expect(box).toBeInTheDocument();
        });

        it("should handle click events for interactive div", async () => {
            const user = userEvent.setup();
            const handleClick = vi.fn();

            render(
                <ThemedBox onClick={handleClick} aria-label="Clickable box">
                    Clickable content
                </ThemedBox>
            );

            const box = screen.getByText("Clickable content");
            await user.click(box);

            expect(handleClick).toHaveBeenCalledTimes(1);
        });

        it("should handle keyboard events for interactive div", async () => {
            const user = userEvent.setup();
            const handleClick = vi.fn();

            render(
                <ThemedBox onClick={handleClick} aria-label="Keyboard box">
                    Keyboard content
                </ThemedBox>
            );

            const box = screen.getByText("Keyboard content");
            box.focus();
            await user.keyboard("{Enter}");

            expect(handleClick).toHaveBeenCalledTimes(1);
        });

        it("should handle space key for interactive div", async () => {
            const user = userEvent.setup();
            const handleClick = vi.fn();

            render(
                <ThemedBox onClick={handleClick} aria-label="Space box">
                    Space content
                </ThemedBox>
            );

            const box = screen.getByText("Space content");
            box.focus();
            await user.keyboard(" ");

            expect(handleClick).toHaveBeenCalledTimes(1);
        });

        it("should render as button element when specified", () => {
            render(
                <ThemedBox as="button" onClick={vi.fn()}>
                    Button box
                </ThemedBox>
            );

            const button = screen.getByRole("button", { name: "Button box" });
            expect(button).toBeInTheDocument();
        });

        it("should render as section element", () => {
            render(<ThemedBox as="section">Section content</ThemedBox>);

            const box = screen.getByText("Section content");
            expect(box.tagName).toBe("SECTION");
        });

        it("should handle mouse events", async () => {
            const user = userEvent.setup();
            const handleMouseEnter = vi.fn();
            const handleMouseLeave = vi.fn();

            render(
                <ThemedBox onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                    Hover content
                </ThemedBox>
            );

            const box = screen.getByText("Hover content");
            await user.hover(box);
            expect(handleMouseEnter).toHaveBeenCalledTimes(1);

            await user.unhover(box);
            expect(handleMouseLeave).toHaveBeenCalledTimes(1);
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

        it("should render in loading state", () => {
            render(<ThemedButton loading>Loading Button</ThemedButton>);

            const button = screen.getByRole("button", { name: "Loading Button" });
            expect(button).toBeDisabled();
            expect(button.querySelector(".themed-button__loading")).toBeInTheDocument();
            expect(button.querySelector(".themed-button__spinner")).toBeInTheDocument();
        });

        it("should render with icon on left", () => {
            render(<ThemedButton icon={<span>🎯</span>}>Button with Icon</ThemedButton>);

            const button = screen.getByRole("button", { name: "🎯 Button with Icon" });
            expect(button).toBeInTheDocument();
            expect(screen.getByText("🎯")).toBeInTheDocument();
        });

        it("should render with icon on right", () => {
            render(
                <ThemedButton icon={<span>📤</span>} iconPosition="right">
                    Send
                </ThemedButton>
            );

            const button = screen.getByRole("button", { name: "Send 📤" });
            expect(button).toBeInTheDocument();
            expect(screen.getByText("📤")).toBeInTheDocument();
        });

        it("should render icon only (no children)", () => {
            render(<ThemedButton icon={<span>❌</span>} aria-label="Close" />);

            const button = screen.getByRole("button", { name: "Close" });
            expect(button).toBeInTheDocument();
            expect(screen.getByText("❌")).toBeInTheDocument();
        });

        it("should render icon with color", () => {
            render(
                <ThemedButton icon={<span>⭐</span>} iconColor="primary">
                    Star
                </ThemedButton>
            );

            const button = screen.getByRole("button", { name: "⭐ Star" });
            expect(button).toBeInTheDocument();
            expect(screen.getByText("⭐")).toBeInTheDocument();
        });

        it("should render icon with custom hex color", () => {
            render(
                <ThemedButton icon={<span>🔥</span>} iconColor="#ff5733">
                    Fire
                </ThemedButton>
            );

            const button = screen.getByRole("button", { name: "🔥 Fire" });
            expect(button).toBeInTheDocument();
            expect(screen.getByText("🔥")).toBeInTheDocument();
        });

        it("should handle multiple icon color mappings", () => {
            const colorMappings = [
                { color: "secondary", icon: "🟢" },
                { color: "success", icon: "✅" },
                { color: "warning", icon: "⚠️" },
                { color: "error", icon: "❌" },
                { color: "danger", icon: "🚨" },
                { color: "info", icon: "ℹ️" },
            ];

            for (const { color, icon } of colorMappings) {
                const { unmount } = render(
                    <ThemedButton icon={<span>{icon}</span>} iconColor={color}>
                        {color} Button
                    </ThemedButton>
                );

                const button = screen.getByRole("button", { name: `${icon} ${color} Button` });
                expect(button).toBeInTheDocument();
                expect(screen.getByText(icon)).toBeInTheDocument();

                unmount();
            }
        });

        it("should render with fullWidth", () => {
            render(<ThemedButton fullWidth>Full Width Button</ThemedButton>);

            const button = screen.getByRole("button", { name: "Full Width Button" });
            expect(button).toBeInTheDocument();
        });

        it("should render with type submit", () => {
            render(<ThemedButton type="submit">Submit</ThemedButton>);

            const button = screen.getByRole("button", { name: "Submit" });
            expect(button).toHaveAttribute("type", "submit");
        });

        it("should render with title attribute", () => {
            render(<ThemedButton title="Button tooltip">Tooltip Button</ThemedButton>);

            const button = screen.getByRole("button", { name: "Tooltip Button" });
            expect(button).toHaveAttribute("title", "Button tooltip");
        });
    });

    describe("ThemedBadge", () => {
        it("should render badge content", () => {
            render(<ThemedBadge>Test Badge</ThemedBadge>);

            const badge = screen.getByText("Test Badge");
            expect(badge).toBeInTheDocument();
        });

        it("should render with variant", () => {
            render(<ThemedBadge variant="primary">Primary Badge</ThemedBadge>);

            const badge = screen.getByText("Primary Badge");
            expect(badge).toBeInTheDocument();
            expect(badge).toHaveClass("themed-badge--primary");
        });

        it("should render with size", () => {
            render(<ThemedBadge size="md">Medium Badge</ThemedBadge>);

            const badge = screen.getByText("Medium Badge");
            expect(badge).toBeInTheDocument();
            expect(badge).toHaveClass("themed-badge--md");
        });

        it("should render with xs size", () => {
            render(<ThemedBadge size="xs">Extra Small Badge</ThemedBadge>);

            const badge = screen.getByText("Extra Small Badge");
            expect(badge).toBeInTheDocument();
            expect(badge).toHaveClass("themed-badge--xs");
        });

        it("should render with lg size", () => {
            render(<ThemedBadge size="lg">Large Badge</ThemedBadge>);

            const badge = screen.getByText("Large Badge");
            expect(badge).toBeInTheDocument();
            expect(badge).toHaveClass("themed-badge--lg");
        });

        it("should render with secondary variant", () => {
            render(<ThemedBadge variant="secondary">Secondary Badge</ThemedBadge>);

            const badge = screen.getByText("Secondary Badge");
            expect(badge).toBeInTheDocument();
            expect(badge).toHaveClass("themed-badge--secondary");
        });

        it("should render with success variant", () => {
            render(<ThemedBadge variant="success">Success Badge</ThemedBadge>);

            const badge = screen.getByText("Success Badge");
            expect(badge).toBeInTheDocument();
            expect(badge).toHaveClass("themed-badge--success");
        });

        it("should render with warning variant", () => {
            render(<ThemedBadge variant="warning">Warning Badge</ThemedBadge>);

            const badge = screen.getByText("Warning Badge");
            expect(badge).toBeInTheDocument();
            expect(badge).toHaveClass("themed-badge--warning");
        });

        it("should render with error variant", () => {
            render(<ThemedBadge variant="error">Error Badge</ThemedBadge>);

            const badge = screen.getByText("Error Badge");
            expect(badge).toBeInTheDocument();
            expect(badge).toHaveClass("themed-badge--error");
        });

        it("should render with info variant", () => {
            render(<ThemedBadge variant="info">Info Badge</ThemedBadge>);

            const badge = screen.getByText("Info Badge");
            expect(badge).toBeInTheDocument();
            expect(badge).toHaveClass("themed-badge--info");
        });

        it("should render with icon", () => {
            render(<ThemedBadge icon={<span>🔔</span>}>Badge with Icon</ThemedBadge>);

            const badge = screen.getByText("Badge with Icon");
            expect(badge).toBeInTheDocument();
            expect(screen.getByText("🔔")).toBeInTheDocument();
        });

        it("should render with icon and custom iconColor", () => {
            render(
                <ThemedBadge icon={<span>⭐</span>} iconColor="primary">
                    Star Badge
                </ThemedBadge>
            );

            const badge = screen.getByText("Star Badge");
            expect(badge).toBeInTheDocument();
            expect(screen.getByText("⭐")).toBeInTheDocument();
        });

        it("should render with icon only (no iconColor)", () => {
            render(<ThemedBadge icon={<span>❤️</span>}>Heart Badge</ThemedBadge>);

            const badge = screen.getByText("Heart Badge");
            expect(badge).toBeInTheDocument();
            expect(screen.getByText("❤️")).toBeInTheDocument();
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
                <ThemedSelect onChange={() => {}}>
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
                <ThemedSelect required onChange={() => {}}>
                    <option value="1">Option 1</option>
                </ThemedSelect>
            );

            const select = screen.getByRole("combobox");
            expect(select).toBeRequired();
        });
    });

    describe("ThemedCheckbox", () => {
        it("should render checkbox", () => {
            render(<ThemedCheckbox aria-label="Test checkbox" onChange={() => {}} />);

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
            render(<ThemedCheckbox checked onChange={() => {}} aria-label="Checked checkbox" />);

            const checkbox = screen.getByRole("checkbox");
            expect(checkbox).toBeChecked();
        });

        it("should render with disabled state", () => {
            render(<ThemedCheckbox disabled aria-label="Disabled checkbox" />);

            const checkbox = screen.getByRole("checkbox");
            expect(checkbox).toBeDisabled();
        });

        it("should render with required", () => {
            render(<ThemedCheckbox required onChange={() => {}} aria-label="Required checkbox" />);

            const checkbox = screen.getByRole("checkbox");
            expect(checkbox).toBeRequired();
        });
    });

    describe("StatusIndicator", () => {
        it("should render with up status", () => {
            render(<StatusIndicator status="up" />);

            const indicator = document.querySelector(".themed-status-indicator");
            expect(indicator).toBeInTheDocument();

            const dot = document.querySelector(".themed-status-indicator__dot");
            expect(dot).toBeInTheDocument();
        });

        it("should render with down status", () => {
            render(<StatusIndicator status="down" />);

            const indicator = document.querySelector(".themed-status-indicator");
            expect(indicator).toBeInTheDocument();

            const dot = document.querySelector(".themed-status-indicator__dot");
            expect(dot).toBeInTheDocument();
        });

        it("should render with showText", () => {
            render(<StatusIndicator status="up" showText />);

            const indicator = screen.getByText("✅"); // This works when showText is true
            expect(indicator).toBeInTheDocument();
        });

        it("should render with size", () => {
            render(<StatusIndicator status="up" size="lg" />);

            const indicator = document.querySelector(".themed-status-indicator");
            expect(indicator).toBeInTheDocument();

            const dot = document.querySelector(".themed-status-indicator__dot");
            expect(dot).toBeInTheDocument();
        });

        it("should render with pending status", () => {
            render(<StatusIndicator status="pending" />);

            const indicator = document.querySelector(".themed-status-indicator");
            expect(indicator).toBeInTheDocument();
        });

        it("should render with unknown status", () => {
            render(<StatusIndicator status="unknown" />);

            const indicator = document.querySelector(".themed-status-indicator");
            expect(indicator).toBeInTheDocument();
        });

        it("should render with small size", () => {
            render(<StatusIndicator status="up" size="sm" />);

            const indicator = document.querySelector(".themed-status-indicator");
            expect(indicator).toBeInTheDocument();
        });

        it("should render with medium size", () => {
            render(<StatusIndicator status="up" size="md" />);

            const indicator = document.querySelector(".themed-status-indicator");
            expect(indicator).toBeInTheDocument();
        });

        it("should render with showText and different statuses", () => {
            const statuses = ["up", "down", "pending", "unknown"] as const;

            for (const status of statuses) {
                const { unmount } = render(<StatusIndicator status={status} showText />);

                const indicator = document.querySelector(".themed-status-indicator");
                expect(indicator).toBeInTheDocument();

                unmount();
            }
        });

        it("should handle default case in getSizeStyles", () => {
            // Create a custom status indicator that would trigger the default case

            render(<StatusIndicator status="up" size={"invalid" as any} />);

            const indicator = document.querySelector(".themed-status-indicator");
            expect(indicator).toBeInTheDocument();
        });
    });

    describe("ThemedIconButton", () => {
        it("should render icon button", () => {
            render(<ThemedIconButton icon="★" />);

            const icon = screen.getByText("★");
            expect(icon).toBeInTheDocument();
            // Check that it's inside a button element
            expect(icon.closest("button")).toBeInTheDocument();
        });

        it("should handle click events", async () => {
            const user = userEvent.setup();
            const handleClick = vi.fn();

            render(<ThemedIconButton icon="★" onClick={handleClick} />);

            const button = screen.getByText("★").closest("button");
            await user.click(button!);

            expect(handleClick).toHaveBeenCalledTimes(1);
        });

        it("should render with variant", () => {
            render(<ThemedIconButton icon="★" variant="primary" />);

            const icon = screen.getByText("★");
            expect(icon).toBeInTheDocument();
            expect(icon.closest("button")).toBeInTheDocument();
        });

        it("should render with size", () => {
            render(<ThemedIconButton icon="★" size="lg" />);

            const icon = screen.getByText("★");
            expect(icon).toBeInTheDocument();
            expect(icon.closest("button")).toBeInTheDocument();
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

        it("should render with title and subtitle", () => {
            render(
                <ThemedCard title="Card Title" subtitle="Card Subtitle">
                    Card content
                </ThemedCard>
            );

            expect(screen.getByText("Card Title")).toBeInTheDocument();
            expect(screen.getByText("Card Subtitle")).toBeInTheDocument();
            expect(screen.getByText("Card content")).toBeInTheDocument();
        });

        it("should render with icon", () => {
            render(
                <ThemedCard icon={<span>🏠</span>} title="Home Card">
                    Home content
                </ThemedCard>
            );

            expect(screen.getByText("🏠")).toBeInTheDocument();
            expect(screen.getByText("Home Card")).toBeInTheDocument();
        });

        it("should render with icon and custom iconColor", () => {
            render(
                <ThemedCard icon={<span>⭐</span>} iconColor="warning" title="Star Card">
                    Star content
                </ThemedCard>
            );

            expect(screen.getByText("⭐")).toBeInTheDocument();
            expect(screen.getByText("Star Card")).toBeInTheDocument();
        });

        it("should handle click when clickable", async () => {
            const user = userEvent.setup();
            const handleClick = vi.fn();

            render(
                <ThemedCard clickable onClick={handleClick}>
                    Clickable card
                </ThemedCard>
            );

            const card = screen.getByText("Clickable card");
            await user.click(card);

            expect(handleClick).toHaveBeenCalledTimes(1);
        });

        it("should handle hover events", async () => {
            const user = userEvent.setup();
            const handleMouseEnter = vi.fn();
            const handleMouseLeave = vi.fn();

            render(
                <ThemedCard hoverable onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                    Hoverable card
                </ThemedCard>
            );

            const card = screen.getByText("Hoverable card");
            await user.hover(card);
            expect(handleMouseEnter).toHaveBeenCalledTimes(1);

            await user.unhover(card);
            expect(handleMouseLeave).toHaveBeenCalledTimes(1);
        });
    });

    describe("ThemedProgress", () => {
        it("should render progress bar", () => {
            render(<ThemedProgress value={50} max={100} />);

            const progress = document.querySelector(".themed-progress");
            expect(progress).toBeInTheDocument();
        });

        it("should render with variant", () => {
            render(<ThemedProgress value={50} max={100} variant="success" />);

            const progress = document.querySelector(".themed-progress");
            expect(progress).toBeInTheDocument();
        });

        it("should render with size", () => {
            render(<ThemedProgress value={50} max={100} size="lg" />);

            const progress = document.querySelector(".themed-progress");
            expect(progress).toBeInTheDocument();
        });

        it("should render with primary variant", () => {
            render(<ThemedProgress value={75} variant="primary" />);

            const progress = document.querySelector(".themed-progress");
            expect(progress).toBeInTheDocument();
        });

        it("should render with warning variant", () => {
            render(<ThemedProgress value={60} variant="warning" />);

            const progress = document.querySelector(".themed-progress");
            expect(progress).toBeInTheDocument();
        });

        it("should render with error variant", () => {
            render(<ThemedProgress value={30} variant="error" />);

            const progress = document.querySelector(".themed-progress");
            expect(progress).toBeInTheDocument();
        });

        it("should render with xs size", () => {
            render(<ThemedProgress value={40} size="xs" />);

            const progress = document.querySelector(".themed-progress");
            expect(progress).toBeInTheDocument();
        });

        it("should render with sm size", () => {
            render(<ThemedProgress value={40} size="sm" />);

            const progress = document.querySelector(".themed-progress");
            expect(progress).toBeInTheDocument();
        });

        it("should render with md size", () => {
            render(<ThemedProgress value={40} size="md" />);

            const progress = document.querySelector(".themed-progress");
            expect(progress).toBeInTheDocument();
        });

        it("should render with showLabel", () => {
            render(<ThemedProgress value={65} showLabel />);

            const progress = document.querySelector(".themed-progress");
            expect(progress).toBeInTheDocument();
            expect(screen.getByText("65.0%")).toBeInTheDocument();
        });

        it("should render with custom label", () => {
            render(<ThemedProgress value={80} label="Upload Progress" />);

            const progress = document.querySelector(".themed-progress");
            expect(progress).toBeInTheDocument();
            expect(screen.getByText("Upload Progress")).toBeInTheDocument();
        });

        it("should render with both label and showLabel", () => {
            render(<ThemedProgress value={90} label="Download" showLabel />);

            const progress = document.querySelector(".themed-progress");
            expect(progress).toBeInTheDocument();
            expect(screen.getByText("Download")).toBeInTheDocument();
            expect(screen.getByText("90.0%")).toBeInTheDocument();
        });

        it("should handle value exceeding max", () => {
            render(<ThemedProgress value={150} max={100} showLabel />);

            const progress = document.querySelector(".themed-progress");
            expect(progress).toBeInTheDocument();
            // Should cap at 100%
            expect(screen.getByText("100.0%")).toBeInTheDocument();
        });

        it("should handle negative values", () => {
            render(<ThemedProgress value={-10} showLabel />);

            const progress = document.querySelector(".themed-progress");
            expect(progress).toBeInTheDocument();
            // Should floor at 0%
            expect(screen.getByText("0.0%")).toBeInTheDocument();
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
            const chartBar = document.querySelector(".themed-mini-chart-bar");
            expect(chartBar).toBeInTheDocument();
            expect(chartBar).toHaveAttribute("title", expect.stringContaining("150ms"));
        });

        it("should render with different status", () => {
            render(<MiniChartBar responseTime={500} status="down" timestamp={Date.now()} />);

            const chartBar = document.querySelector(".themed-mini-chart-bar");
            expect(chartBar).toBeInTheDocument();
            expect(chartBar).toHaveAttribute("title", expect.stringContaining("500ms"));
        });
    });

    describe("Edge cases for 100% coverage", () => {
        it("should handle renderColoredIcon without color", () => {
            render(<ThemedBadge icon={<span>icon</span>}>Test</ThemedBadge>);
            expect(screen.getByText("Test")).toBeInTheDocument();
        });

        it("should handle ThemedButton with icon but no children and iconColor", () => {
            render(<ThemedButton icon={<span data-testid="icon">icon</span>} iconColor="red" />);
            const icon = screen.getByTestId("icon");
            expect(icon).toBeInTheDocument();
            expect(icon.parentElement).toHaveStyle("color: rgb(255, 0, 0)");
        });

        it("should handle ThemedButton with non-ReactElement icon and iconColor", () => {
            render(<ThemedButton icon="text-icon" iconColor="blue" />);
            const icon = screen.getByText("text-icon");
            expect(icon).toBeInTheDocument();
            expect(icon).toHaveStyle("color: rgb(0, 0, 255)");
        });
    });

    describe("Theme Components Default Cases", () => {
        it("should handle ThemedIconButton default size case", () => {
            // Create an invalid size that would trigger default case
            const mockSize = "invalid" as "xs" | "sm" | "md" | "lg";
            render(<ThemedIconButton icon="🔧" size={mockSize} aria-label="test button" />);
            const button = screen.getByRole("button");
            expect(button).toBeInTheDocument();
            // Should default to 40px size
            expect(button).toHaveStyle("width: 40px");
            expect(button).toHaveStyle("height: 40px");
        });

        it("should handle icon rendering without color prop", () => {
            render(<ThemedButton icon="🔧" />);
            const icon = screen.getByText("🔧");
            expect(icon).toBeInTheDocument();
            // Should just return the icon without any styling when no color is provided
        });

        it("should handle ThemedProgress default size case", () => {
            // Test default case in getHeight function
            const mockSize = "invalid" as "xs" | "sm" | "md" | "lg";
            render(<ThemedProgress value={50} max={100} size={mockSize} />);
            const progressBar = screen.getByRole("progressbar");
            expect(progressBar).toBeInTheDocument();

            // Check the visual progress container (the div with height styling)
            const progressContainer = screen
                .getByRole("progressbar")
                .parentElement?.querySelector('div[aria-hidden="true"]');
            expect(progressContainer).toBeInTheDocument();
            expect(progressContainer).toHaveStyle("height: 8px");
        });

        it("should handle ThemedProgress default color case", () => {
            // Test default case in getColor function - no variant specified
            render(<ThemedProgress value={50} max={100} />);
            const progressBar = screen.getByRole("progressbar");
            expect(progressBar).toBeInTheDocument();
        });

        it("should handle StatusIndicator default size case", () => {
            // Create component that would trigger default case in getSizeStyles
            const mockSize = "invalid" as "sm" | "md" | "lg";
            const { container } = render(<StatusIndicator status="up" size={mockSize} />);
            const indicator = container.querySelector(".themed-status-indicator");
            expect(indicator).toBeInTheDocument();
            // Should default to medium size styles - test the dot element
            const dot = indicator?.querySelector(".themed-status-indicator__dot");
            expect(dot).toBeInTheDocument();
        });

        it("should handle StatusIndicator without variant prop", () => {
            // Test component without variant to trigger default path
            const { container } = render(<StatusIndicator status="up" />);
            const indicator = container.querySelector(".themed-status-indicator");
            expect(indicator).toBeInTheDocument();
            // Should work without variant since it's not part of the interface
        });
    });
});
