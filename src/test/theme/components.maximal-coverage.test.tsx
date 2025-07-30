/**
 * Comprehensive tests for Theme components to achieve 98%+ coverage.
 * Tests all theme component variants, props, and edge cases.
 */

import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, expect, it, vi } from "vitest";

import {
    ThemedBox,
    ThemedButton,
    ThemedInput,
    ThemedText,
    ThemedCheckbox,
    ThemedSelect,
    ThemedCard,
    ThemedBadge,
    StatusIndicator,
    MiniChartBar,
} from "../../theme/components";

// Mock functions for testing
const mockOnClick = vi.fn();
const mockOnChange = vi.fn();

describe("Theme Components - Complete Coverage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("ThemedBox Component", () => {
        it("should render with default props", () => {
            render(<ThemedBox data-testid="themed-box">Content</ThemedBox>);
            
            const box = screen.getByTestId("themed-box");
            expect(box).toBeInTheDocument();
            expect(box).toHaveTextContent("Content");
        });

        it("should apply all surface variants", () => {
            const surfaces = ["base", "elevated", "overlay"] as const;
            
            surfaces.forEach((surface) => {
                render(
                    <ThemedBox surface={surface} data-testid={`box-${surface}`}>
                        {surface}
                    </ThemedBox>
                );
                
                const box = screen.getByTestId(`box-${surface}`);
                expect(box).toBeInTheDocument();
            });
        });

        it("should apply all padding variants", () => {
            const paddings = ["xs", "sm", "md", "lg", "xl"] as const;
            
            paddings.forEach((padding) => {
                render(
                    <ThemedBox padding={padding} data-testid={`box-padding-${padding}`}>
                        Padding {padding}
                    </ThemedBox>
                );
                
                const box = screen.getByTestId(`box-padding-${padding}`);
                expect(box).toBeInTheDocument();
            });
        });

        it("should handle click events", () => {
            render(
                <ThemedBox 
                    onClick={mockOnClick}
                    data-testid="clickable-box"
                >
                    Clickable box
                </ThemedBox>
            );
            
            const box = screen.getByTestId("clickable-box");
            fireEvent.click(box);
            expect(mockOnClick).toHaveBeenCalledTimes(1);
        });

        it("should handle different element types", () => {
            const elements = ["div", "section", "article", "aside"] as const;
            
            elements.forEach((as) => {
                render(
                    <ThemedBox as={as} data-testid={`box-${as}`}>
                        Element {as}
                    </ThemedBox>
                );
                
                const box = screen.getByTestId(`box-${as}`);
                expect(box).toBeInTheDocument();
            });
        });

        it("should handle variant prop", () => {
            const variants = ["primary", "secondary", "tertiary"] as const;
            
            variants.forEach((variant) => {
                render(
                    <ThemedBox variant={variant} data-testid={`box-${variant}`}>
                        Variant {variant}
                    </ThemedBox>
                );
                
                const box = screen.getByTestId(`box-${variant}`);
                expect(box).toBeInTheDocument();
            });
        });

        it("should handle rounded prop", () => {
            const roundedOptions = ["none", "sm", "md", "lg", "full"] as const;
            
            roundedOptions.forEach((rounded) => {
                render(
                    <ThemedBox rounded={rounded} data-testid={`box-rounded-${rounded}`}>
                        Rounded {rounded}
                    </ThemedBox>
                );
                
                const box = screen.getByTestId(`box-rounded-${rounded}`);
                expect(box).toBeInTheDocument();
            });
        });

        it("should handle shadow prop", () => {
            const shadowOptions = ["sm", "md", "lg", "xl", "inner"] as const;
            
            shadowOptions.forEach((shadow) => {
                render(
                    <ThemedBox shadow={shadow} data-testid={`box-shadow-${shadow}`}>
                        Shadow {shadow}
                    </ThemedBox>
                );
                
                const box = screen.getByTestId(`box-shadow-${shadow}`);
                expect(box).toBeInTheDocument();
            });
        });

        it("should handle border prop", () => {
            render(
                <ThemedBox border data-testid="bordered-box">
                    Bordered box
                </ThemedBox>
            );
            
            const box = screen.getByTestId("bordered-box");
            expect(box).toBeInTheDocument();
        });

        it("should handle mouse events", () => {
            const mockMouseEnter = vi.fn();
            const mockMouseLeave = vi.fn();
            
            render(
                <ThemedBox 
                    onMouseEnter={mockMouseEnter}
                    onMouseLeave={mockMouseLeave}
                    data-testid="mouse-box"
                >
                    Mouse events
                </ThemedBox>
            );
            
            const box = screen.getByTestId("mouse-box");
            fireEvent.mouseEnter(box);
            expect(mockMouseEnter).toHaveBeenCalledTimes(1);
            
            fireEvent.mouseLeave(box);
            expect(mockMouseLeave).toHaveBeenCalledTimes(1);
        });
    });

    describe("ThemedButton Component", () => {
        it("should render with default props", () => {
            render(
                <ThemedButton onClick={mockOnClick}>
                    Default Button
                </ThemedButton>
            );
            
            const button = screen.getByRole("button", { name: "Default Button" });
            expect(button).toBeInTheDocument();
        });

        it("should apply all variant styles", () => {
            const variants = ["primary", "secondary", "error", "ghost", "outline", "success", "warning", "tertiary"] as const;
            
            variants.forEach((variant) => {
                render(
                    <ThemedButton variant={variant} onClick={mockOnClick}>
                        {variant} Button
                    </ThemedButton>
                );
                
                const button = screen.getByRole("button", { name: `${variant} Button` });
                expect(button).toBeInTheDocument();
            });
        });

        it("should apply all size variants", () => {
            const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
            
            sizes.forEach((size) => {
                render(
                    <ThemedButton size={size} onClick={mockOnClick}>
                        {size} Button
                    </ThemedButton>
                );
                
                const button = screen.getByRole("button", { name: `${size} Button` });
                expect(button).toBeInTheDocument();
            });
        });

        it("should handle disabled state", () => {
            render(
                <ThemedButton disabled onClick={mockOnClick}>
                    Disabled Button
                </ThemedButton>
            );
            
            const button = screen.getByRole("button", { name: "Disabled Button" });
            expect(button).toBeDisabled();
        });

        it("should handle loading state", () => {
            render(
                <ThemedButton loading onClick={mockOnClick}>
                    Loading Button
                </ThemedButton>
            );
            
            const button = screen.getByRole("button", { name: "Loading Button" });
            expect(button).toBeDisabled();
        });

        it("should handle fullWidth prop", () => {
            render(
                <ThemedButton fullWidth onClick={mockOnClick}>
                    Full Width Button
                </ThemedButton>
            );
            
            const button = screen.getByRole("button", { name: "Full Width Button" });
            expect(button).toBeInTheDocument();
        });

        it("should handle icon prop", () => {
            render(
                <ThemedButton icon={<span>🚀</span>} onClick={mockOnClick}>
                    Icon Button
                </ThemedButton>
            );
            
            const button = screen.getByRole("button", { name: "Icon Button" });
            expect(button).toBeInTheDocument();
            expect(screen.getByText("🚀")).toBeInTheDocument();
        });

        it("should handle iconPosition prop", () => {
            render(
                <ThemedButton 
                    icon={<span>🚀</span>} 
                    iconPosition="right"
                    onClick={mockOnClick}
                >
                    Icon Right
                </ThemedButton>
            );
            
            const button = screen.getByRole("button", { name: "Icon Right" });
            expect(button).toBeInTheDocument();
        });

        it("should handle iconColor prop", () => {
            render(
                <ThemedButton 
                    icon={<span>🚀</span>} 
                    iconColor="red"
                    onClick={mockOnClick}
                >
                    Colored Icon
                </ThemedButton>
            );
            
            const button = screen.getByRole("button", { name: "Colored Icon" });
            expect(button).toBeInTheDocument();
        });

        it("should handle different button types", () => {
            const types = ["button", "submit", "reset"] as const;
            
            types.forEach((type) => {
                render(
                    <ThemedButton type={type} onClick={mockOnClick}>
                        {type} Button
                    </ThemedButton>
                );
                
                const button = screen.getByRole("button", { name: `${type} Button` });
                expect(button).toHaveAttribute("type", type);
            });
        });
    });

    describe("ThemedInput Component", () => {
        it("should render with default props", () => {
            render(<ThemedInput data-testid="themed-input" />);
            
            const input = screen.getByTestId("themed-input");
            expect(input).toBeInTheDocument();
            expect(input).toHaveAttribute("type", "text");
        });

        it("should handle different input types", () => {
            const types = ["text", "email", "password", "number", "url"] as const;
            
            types.forEach((type) => {
                render(<ThemedInput type={type} data-testid={`input-${type}`} />);
                
                const input = screen.getByTestId(`input-${type}`);
                expect(input).toHaveAttribute("type", type);
            });
        });

        it("should handle disabled state", () => {
            render(<ThemedInput disabled data-testid="disabled-input" />);
            
            const input = screen.getByTestId("disabled-input");
            expect(input).toBeDisabled();
        });

        it("should handle value and onChange", () => {
            render(
                <ThemedInput 
                    value="test value"
                    onChange={mockOnChange}
                    data-testid="controlled-input"
                />
            );
            
            const input = screen.getByTestId("controlled-input") as HTMLInputElement;
            expect(input.value).toBe("test value");
            
            fireEvent.change(input, { target: { value: "new value" } });
            expect(mockOnChange).toHaveBeenCalledTimes(1);
        });

        it("should handle placeholder and required", () => {
            render(
                <ThemedInput 
                    placeholder="Enter text"
                    required
                    data-testid="attr-input"
                />
            );
            
            const input = screen.getByTestId("attr-input");
            expect(input).toHaveAttribute("placeholder", "Enter text");
            expect(input).toHaveAttribute("required");
        });

        it("should handle min/max for number inputs", () => {
            render(
                <ThemedInput 
                    type="number"
                    min={1}
                    max={100}
                    step={0.1}
                    data-testid="number-input"
                />
            );
            
            const input = screen.getByTestId("number-input");
            expect(input).toHaveAttribute("min", "1");
            expect(input).toHaveAttribute("max", "100");
            expect(input).toHaveAttribute("step", "0.1");
        });

        it("should handle aria attributes", () => {
            render(
                <ThemedInput 
                    aria-label="Search"
                    aria-describedby="search-help"
                    data-testid="aria-input"
                />
            );
            
            const input = screen.getByTestId("aria-input");
            expect(input).toHaveAttribute("aria-label", "Search");
            expect(input).toHaveAttribute("aria-describedby", "search-help");
        });
    });

    describe("ThemedText Component", () => {
        it("should render with default props", () => {
            render(<ThemedText>Default text</ThemedText>);
            
            const text = screen.getByText("Default text");
            expect(text).toBeInTheDocument();
        });

        it("should apply all size variants", () => {
            const sizes = ["xs", "sm", "base", "md", "lg", "xl", "2xl", "3xl", "4xl"] as const;
            
            sizes.forEach((size) => {
                render(<ThemedText size={size}>Size {size}</ThemedText>);
                
                const text = screen.getByText(`Size ${size}`);
                expect(text).toBeInTheDocument();
            });
        });

        it("should apply all weight variants", () => {
            const weights = ["normal", "medium", "semibold", "bold"] as const;
            
            weights.forEach((weight) => {
                render(<ThemedText weight={weight}>Weight {weight}</ThemedText>);
                
                const text = screen.getByText(`Weight ${weight}`);
                expect(text).toBeInTheDocument();
            });
        });

        it("should apply all variant colors", () => {
            const variants = ["primary", "secondary", "danger", "success", "warning", "error", "info", "inverse", "tertiary"] as const;
            
            variants.forEach((variant) => {
                render(<ThemedText variant={variant}>Variant {variant}</ThemedText>);
                
                const text = screen.getByText(`Variant ${variant}`);
                expect(text).toBeInTheDocument();
            });
        });

        it("should apply all text alignment", () => {
            const alignments = ["left", "center", "right", "justify"] as const;
            
            alignments.forEach((align) => {
                render(<ThemedText align={align}>Align {align}</ThemedText>);
                
                const text = screen.getByText(`Align ${align}`);
                expect(text).toBeInTheDocument();
            });
        });

        it("should handle style prop", () => {
            render(
                <ThemedText style={{ color: "red", fontSize: "20px" }}>
                    Styled text
                </ThemedText>
            );
            
            const text = screen.getByText("Styled text");
            expect(text).toHaveStyle("color: red");
            expect(text).toHaveStyle("font-size: 20px");
        });
    });

    describe("ThemedCheckbox Component", () => {
        it("should render with default props", () => {
            render(<ThemedCheckbox data-testid="themed-checkbox" onChange={mockOnChange} />);
            
            const checkbox = screen.getByTestId("themed-checkbox");
            expect(checkbox).toBeInTheDocument();
            expect(checkbox).toHaveAttribute("type", "checkbox");
        });

        it("should handle checked state", () => {
            render(<ThemedCheckbox checked onChange={mockOnChange} data-testid="checked-box" />);
            
            const checkbox = screen.getByTestId("checked-box") as HTMLInputElement;
            expect(checkbox.checked).toBe(true);
        });

        it("should handle disabled state", () => {
            render(<ThemedCheckbox disabled onChange={mockOnChange} data-testid="disabled-box" />);
            
            const checkbox = screen.getByTestId("disabled-box");
            expect(checkbox).toBeDisabled();
        });

        it("should handle required prop", () => {
            render(<ThemedCheckbox required onChange={mockOnChange} data-testid="required-box" />);
            
            const checkbox = screen.getByTestId("required-box");
            expect(checkbox).toHaveAttribute("required");
        });

        it("should apply accessibility props", () => {
            render(
                <ThemedCheckbox 
                    onChange={mockOnChange}
                    aria-label="Accept terms"
                    data-testid="a11y-box"
                />
            );
            
            const checkbox = screen.getByTestId("a11y-box");
            expect(checkbox).toHaveAttribute("aria-label", "Accept terms");
        });

        it("should handle change events", () => {
            render(<ThemedCheckbox onChange={mockOnChange} data-testid="change-box" />);
            
            const checkbox = screen.getByTestId("change-box");
            fireEvent.click(checkbox);
            
            expect(mockOnChange).toHaveBeenCalledTimes(1);
        });
    });

    describe("ThemedSelect Component", () => {
        it("should render with children", () => {
            render(
                <ThemedSelect data-testid="themed-select" onChange={mockOnChange}>
                    <option value="option1">Option 1</option>
                    <option value="option2">Option 2</option>
                    <option value="option3">Option 3</option>
                </ThemedSelect>
            );
            
            const select = screen.getByTestId("themed-select");
            expect(select).toBeInTheDocument();
            
            const options = select.querySelectorAll("option");
            expect(options).toHaveLength(3);
        });

        it("should handle disabled state", () => {
            render(
                <ThemedSelect disabled onChange={mockOnChange} data-testid="disabled-select">
                    <option value="test">Test</option>
                </ThemedSelect>
            );
            
            const select = screen.getByTestId("disabled-select");
            expect(select).toBeDisabled();
        });

        it("should handle value and onChange", () => {
            render(
                <ThemedSelect 
                    value="option2"
                    onChange={mockOnChange}
                    data-testid="controlled-select"
                >
                    <option value="option1">Option 1</option>
                    <option value="option2">Option 2</option>
                    <option value="option3">Option 3</option>
                </ThemedSelect>
            );
            
            const select = screen.getByTestId("controlled-select") as HTMLSelectElement;
            expect(select.value).toBe("option2");
            
            fireEvent.change(select, { target: { value: "option3" } });
            expect(mockOnChange).toHaveBeenCalledTimes(1);
        });

        it("should handle required prop", () => {
            render(
                <ThemedSelect required onChange={mockOnChange} data-testid="required-select">
                    <option value="test">Test</option>
                </ThemedSelect>
            );
            
            const select = screen.getByTestId("required-select");
            expect(select).toHaveAttribute("required");
        });

        it("should handle click and mouse events", () => {
            const mockClick = vi.fn();
            const mockMouseDown = vi.fn();
            
            render(
                <ThemedSelect 
                    onClick={mockClick}
                    onMouseDown={mockMouseDown}
                    onChange={mockOnChange}
                    data-testid="event-select"
                >
                    <option value="test">Test</option>
                </ThemedSelect>
            );
            
            const select = screen.getByTestId("event-select");
            fireEvent.click(select);
            fireEvent.mouseDown(select);
            
            expect(mockClick).toHaveBeenCalledTimes(1);
            expect(mockMouseDown).toHaveBeenCalledTimes(1);
        });

        it("should handle aria attributes", () => {
            render(
                <ThemedSelect 
                    aria-label="Choose option"
                    aria-describedby="select-help"
                    onChange={mockOnChange}
                    data-testid="aria-select"
                >
                    <option value="test">Test</option>
                </ThemedSelect>
            );
            
            const select = screen.getByTestId("aria-select");
            expect(select).toHaveAttribute("aria-label", "Choose option");
            expect(select).toHaveAttribute("aria-describedby", "select-help");
        });
    });

    describe("ThemedCard Component", () => {
        it("should render with default props", () => {
            render(
                <ThemedCard data-testid="themed-card">
                    Card content
                </ThemedCard>
            );
            
            const card = screen.getByTestId("themed-card");
            expect(card).toBeInTheDocument();
            expect(card).toHaveTextContent("Card content");
        });

        it("should handle title and subtitle", () => {
            render(
                <ThemedCard 
                    title="Card Title"
                    subtitle="Card Subtitle"
                    data-testid="titled-card"
                >
                    Card content
                </ThemedCard>
            );
            
            const card = screen.getByTestId("titled-card");
            expect(card).toBeInTheDocument();
        });

        it("should handle clickable state", () => {
            render(
                <ThemedCard 
                    clickable
                    onClick={mockOnClick}
                    data-testid="clickable-card"
                >
                    Clickable card
                </ThemedCard>
            );
            
            const card = screen.getByTestId("clickable-card");
            fireEvent.click(card);
            expect(mockOnClick).toHaveBeenCalledTimes(1);
        });

        it("should handle hoverable state", () => {
            render(
                <ThemedCard 
                    hoverable
                    data-testid="hoverable-card"
                >
                    Hoverable card
                </ThemedCard>
            );
            
            const card = screen.getByTestId("hoverable-card");
            expect(card).toBeInTheDocument();
        });

        it("should handle icon prop", () => {
            render(
                <ThemedCard 
                    icon={<span>📦</span>}
                    iconColor="blue"
                    data-testid="icon-card"
                >
                    Card with icon
                </ThemedCard>
            );
            
            const card = screen.getByTestId("icon-card");
            expect(card).toBeInTheDocument();
            expect(screen.getByText("📦")).toBeInTheDocument();
        });

        it("should handle all variants", () => {
            const variants = ["primary", "secondary", "tertiary"] as const;
            
            variants.forEach((variant) => {
                render(
                    <ThemedCard variant={variant} data-testid={`card-${variant}`}>
                        Variant {variant}
                    </ThemedCard>
                );
                
                const card = screen.getByTestId(`card-${variant}`);
                expect(card).toBeInTheDocument();
            });
        });

        it("should handle mouse events", () => {
            const mockMouseEnter = vi.fn();
            const mockMouseLeave = vi.fn();
            
            render(
                <ThemedCard 
                    onMouseEnter={mockMouseEnter}
                    onMouseLeave={mockMouseLeave}
                    data-testid="mouse-card"
                >
                    Mouse events card
                </ThemedCard>
            );
            
            const card = screen.getByTestId("mouse-card");
            fireEvent.mouseEnter(card);
            fireEvent.mouseLeave(card);
            
            expect(mockMouseEnter).toHaveBeenCalledTimes(1);
            expect(mockMouseLeave).toHaveBeenCalledTimes(1);
        });
    });

    describe("ThemedBadge Component", () => {
        it("should render with default props", () => {
            render(
                <ThemedBadge>
                    Default Badge
                </ThemedBadge>
            );
            
            const badge = screen.getByText("Default Badge");
            expect(badge).toBeInTheDocument();
        });

        it("should apply all variant styles", () => {
            const variants = ["primary", "secondary", "success", "warning", "error", "info"] as const;
            
            variants.forEach((variant) => {
                render(
                    <ThemedBadge variant={variant}>
                        {variant} Badge
                    </ThemedBadge>
                );
                
                const badge = screen.getByText(`${variant} Badge`);
                expect(badge).toBeInTheDocument();
            });
        });

        it("should apply all size variants", () => {
            const sizes = ["xs", "sm", "md", "lg"] as const;
            
            sizes.forEach((size) => {
                render(
                    <ThemedBadge size={size}>
                        {size} Badge
                    </ThemedBadge>
                );
                
                const badge = screen.getByText(`${size} Badge`);
                expect(badge).toBeInTheDocument();
            });
        });

        it("should handle icon prop", () => {
            render(
                <ThemedBadge 
                    icon={<span>⭐</span>}
                    iconColor="gold"
                >
                    Badge with icon
                </ThemedBadge>
            );
            
            const badge = screen.getByText("Badge with icon");
            expect(badge).toBeInTheDocument();
            expect(screen.getByText("⭐")).toBeInTheDocument();
        });
    });

    describe("StatusIndicator Component", () => {
        it("should render with status", () => {
            render(
                <StatusIndicator 
                    status="up"
                    data-testid="status-indicator"
                />
            );
            
            const indicator = screen.getByTestId("status-indicator");
            expect(indicator).toBeInTheDocument();
        });

        it("should handle different sizes", () => {
            const sizes = ["sm", "md", "lg"] as const;
            
            sizes.forEach((size) => {
                render(
                    <StatusIndicator 
                        status="up"
                        size={size}
                        data-testid={`status-${size}`}
                    />
                );
                
                const indicator = screen.getByTestId(`status-${size}`);
                expect(indicator).toBeInTheDocument();
            });
        });

        it("should handle showText prop", () => {
            render(
                <StatusIndicator 
                    status="up"
                    showText
                    data-testid="status-with-text"
                />
            );
            
            const indicator = screen.getByTestId("status-with-text");
            expect(indicator).toBeInTheDocument();
        });

        it("should handle different status values", () => {
            const statuses = ["up", "down", "unknown"] as const;
            
            statuses.forEach((status) => {
                render(
                    <StatusIndicator 
                        status={status}
                        data-testid={`status-${status}`}
                    />
                );
                
                const indicator = screen.getByTestId(`status-${status}`);
                expect(indicator).toBeInTheDocument();
            });
        });
    });

    describe("MiniChartBar Component", () => {
        it("should render with status and timestamp", () => {
            render(
                <MiniChartBar 
                    status="up"
                    timestamp={new Date()}
                    data-testid="mini-chart-bar"
                />
            );
            
            const bar = screen.getByTestId("mini-chart-bar");
            expect(bar).toBeInTheDocument();
        });

        it("should handle responseTime prop", () => {
            render(
                <MiniChartBar 
                    status="up"
                    timestamp={new Date()}
                    responseTime={150}
                    data-testid="mini-chart-with-time"
                />
            );
            
            const bar = screen.getByTestId("mini-chart-with-time");
            expect(bar).toBeInTheDocument();
        });

        it("should handle different status values", () => {
            const statuses = ["up", "down", "unknown"] as const;
            
            statuses.forEach((status) => {
                render(
                    <MiniChartBar 
                        status={status}
                        timestamp={new Date()}
                        data-testid={`chart-${status}`}
                    />
                );
                
                const bar = screen.getByTestId(`chart-${status}`);
                expect(bar).toBeInTheDocument();
            });
        });

        it("should handle string timestamp", () => {
            render(
                <MiniChartBar 
                    status="up"
                    timestamp="2024-01-01T00:00:00Z"
                    data-testid="chart-string-timestamp"
                />
            );
            
            const bar = screen.getByTestId("chart-string-timestamp");
            expect(bar).toBeInTheDocument();
        });

        it("should handle number timestamp", () => {
            render(
                <MiniChartBar 
                    status="up"
                    timestamp={Date.now()}
                    data-testid="chart-number-timestamp"
                />
            );
            
            const bar = screen.getByTestId("chart-number-timestamp");
            expect(bar).toBeInTheDocument();
        });
    });

    describe("Edge Cases and Integration", () => {
        it("should handle all components together", () => {
            render(
                <ThemedBox surface="elevated" padding="lg">
                    <ThemedText size="lg" weight="bold">
                        Form Components
                    </ThemedText>
                    <ThemedInput placeholder="Name" />
                    <ThemedSelect onChange={mockOnChange}>
                        <option value="test">Test</option>
                    </ThemedSelect>
                    <ThemedCheckbox onChange={mockOnChange} />
                    <ThemedButton onClick={mockOnClick}>
                        Submit
                    </ThemedButton>
                    <ThemedBadge variant="success">Success</ThemedBadge>
                    <StatusIndicator status="up" />
                    <MiniChartBar status="up" timestamp={new Date()} />
                </ThemedBox>
            );
            
            expect(screen.getByText("Form Components")).toBeInTheDocument();
            expect(screen.getByPlaceholderText("Name")).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
            expect(screen.getByText("Success")).toBeInTheDocument();
        });

        it("should handle components with custom className", () => {
            render(
                <div>
                    <ThemedBox className="custom-box">Box</ThemedBox>
                    <ThemedButton className="custom-btn" onClick={mockOnClick}>
                        Button
                    </ThemedButton>
                    <ThemedInput className="custom-input" />
                    <ThemedText className="custom-text">Text</ThemedText>
                    <ThemedCard className="custom-card">Card</ThemedCard>
                    <ThemedBadge className="custom-badge">Badge</ThemedBadge>
                </div>
            );
            
            expect(screen.getByText("Box")).toHaveClass("custom-box");
            expect(screen.getByRole("button")).toHaveClass("custom-btn");
            expect(screen.getByRole("textbox")).toHaveClass("custom-input");
            expect(screen.getByText("Text")).toHaveClass("custom-text");
            expect(screen.getByText("Card")).toHaveClass("custom-card");
            expect(screen.getByText("Badge")).toHaveClass("custom-badge");
        });
    });
});
