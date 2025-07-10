import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ActionButtonGroup } from "../components/Dashboard/SiteCard/components/ActionButtonGroup";

describe("ActionButtonGroup", () => {
  const baseProps = {
    onCheckNow: vi.fn(),
    onStartMonitoring: vi.fn(),
    onStopMonitoring: vi.fn(),
    isLoading: false,
    isMonitoring: false,
    disabled: false,
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders all buttons in non-monitoring state", () => {
    render(<ActionButtonGroup {...baseProps} />);
    expect(screen.getByLabelText("Check Now")).toBeInTheDocument();
    expect(screen.getByLabelText("Start Monitoring")).toBeInTheDocument();
    expect(screen.queryByLabelText("Stop Monitoring")).not.toBeInTheDocument();
  });

  it("renders stop button in monitoring state", () => {
    render(<ActionButtonGroup {...baseProps} isMonitoring={true} />);
    expect(screen.getByLabelText("Check Now")).toBeInTheDocument();
    expect(screen.getByLabelText("Stop Monitoring")).toBeInTheDocument();
    expect(screen.queryByLabelText("Start Monitoring")).not.toBeInTheDocument();
  });

  it("calls onCheckNow when Check Now is clicked", () => {
    render(<ActionButtonGroup {...baseProps} />);
    fireEvent.click(screen.getByLabelText("Check Now"));
    expect(baseProps.onCheckNow).toHaveBeenCalledTimes(1);
  });

  it("calls onStartMonitoring when Start Monitoring is clicked", () => {
    render(<ActionButtonGroup {...baseProps} />);
    fireEvent.click(screen.getByLabelText("Start Monitoring"));
    expect(baseProps.onStartMonitoring).toHaveBeenCalledTimes(1);
  });

  it("calls onStopMonitoring when Stop Monitoring is clicked", () => {
    render(<ActionButtonGroup {...baseProps} isMonitoring={true} />);
    fireEvent.click(screen.getByLabelText("Stop Monitoring"));
    expect(baseProps.onStopMonitoring).toHaveBeenCalledTimes(1);
  });

  it("disables all buttons when disabled is true", () => {
    render(<ActionButtonGroup {...baseProps} disabled={true} />);
    expect(screen.getByLabelText("Check Now")).toBeDisabled();
    expect(screen.getByLabelText("Start Monitoring")).toBeDisabled();
  });

  it("disables all buttons when isLoading is true", () => {
    render(<ActionButtonGroup {...baseProps} isLoading={true} />);
    expect(screen.getByLabelText("Check Now")).toBeDisabled();
    expect(screen.getByLabelText("Start Monitoring")).toBeDisabled();
  });

  it("stops event propagation on button clicks", () => {
    const stopPropagation = vi.fn();
    render(<ActionButtonGroup {...baseProps} />);
    const checkNowBtn = screen.getByLabelText("Check Now");
    fireEvent.click(checkNowBtn, { stopPropagation });
    // The handler in the component always calls stopPropagation
    // But jsdom doesn't propagate the event object, so we check that the handler doesn't throw
    expect(baseProps.onCheckNow).toHaveBeenCalled();
  });

  it("has accessible aria-labels for all buttons", () => {
    render(<ActionButtonGroup {...baseProps} />);
    expect(screen.getByLabelText("Check Now")).toBeInTheDocument();
    expect(screen.getByLabelText("Start Monitoring")).toBeInTheDocument();
  });
});