import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MonitorSelector } from "../components/Dashboard/SiteCard/components/MonitorSelector";
import type { Monitor } from "../types";

const monitors: Monitor[] = [
    {
        id: "1",
        type: "http",
        status: "up",
        url: "https://example.com",
        host: undefined,
        port: undefined,
        responseTime: undefined,
        lastChecked: undefined,
        history: [],
        monitoring: true,
        checkInterval: undefined,
        timeout: undefined,
        retryAttempts: undefined,
    },
    {
        id: "2",
        type: "port",
        status: "down",
        url: undefined,
        host: undefined,
        port: 8080,
        responseTime: undefined,
        lastChecked: undefined,
        history: [],
        monitoring: true,
        checkInterval: undefined,
        timeout: undefined,
        retryAttempts: undefined,
    },
    {
        id: "3",
        type: "http",
        status: "paused",
        url: undefined,
        host: undefined,
        port: undefined,
        responseTime: undefined,
        lastChecked: undefined,
        history: [],
        monitoring: false,
        checkInterval: undefined,
        timeout: undefined,
        retryAttempts: undefined,
    },
];

describe("MonitorSelector", () => {
    it("renders all monitor options with correct labels", () => {
        render(<MonitorSelector monitors={monitors} selectedMonitorId="1" onChange={() => {}} />);
        // HTTP with url
        expect(screen.getByRole("option", { name: "HTTP: https://example.com" })).toBeInTheDocument();
        // PORT with port
        expect(screen.getByRole("option", { name: "PORT:8080" })).toBeInTheDocument();
        // HTTP with no url/port
        expect(screen.getByRole("option", { name: "HTTP" })).toBeInTheDocument();
    });

    it("sets the correct option as selected", () => {
        render(<MonitorSelector monitors={monitors} selectedMonitorId="2" onChange={() => {}} />);
        const select = screen.getByRole("combobox");
        expect(select).toHaveValue("2");
    });

    it("calls onChange when a different monitor is selected", () => {
        const handleChange = vi.fn();
        render(<MonitorSelector monitors={monitors} selectedMonitorId="1" onChange={handleChange} />);
        const select = screen.getByRole("combobox");
        fireEvent.change(select, { target: { value: "2" } });
        expect(handleChange).toHaveBeenCalled();
    });

    it("applies custom className", () => {
        render(
            <MonitorSelector monitors={monitors} selectedMonitorId="1" onChange={() => {}} className="custom-class" />
        );
        const select = screen.getByRole("combobox");
        expect(select).toHaveClass("custom-class");
    });

    it("stops propagation on click and mouse down", () => {
        const stopPropagation = vi.fn();
        render(<MonitorSelector monitors={monitors} selectedMonitorId="1" onChange={() => {}} />);
        const select = screen.getByRole("combobox");
        // Manually create and dispatch events with stopPropagation
        const clickEvent = new Event("click", { bubbles: true });
        clickEvent.stopPropagation = stopPropagation;
        select.dispatchEvent(clickEvent);
        const mouseDownEvent = new Event("mousedown", { bubbles: true });
        mouseDownEvent.stopPropagation = stopPropagation;
        select.dispatchEvent(mouseDownEvent);
        // The component calls stopPropagation on the event
        expect(stopPropagation).toHaveBeenCalledTimes(2);
    });

    it("renders empty when monitors array is empty", () => {
        render(<MonitorSelector monitors={[]} selectedMonitorId="" onChange={() => {}} />);
        expect(screen.queryAllByRole("option")).toHaveLength(0);
    });
});
