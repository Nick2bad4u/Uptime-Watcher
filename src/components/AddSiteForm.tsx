import { useState, useEffect } from "react";
import { useStore } from "../store";
import { UI_DELAYS, CHECK_INTERVALS } from "../constants";
import { useTheme } from "../theme/useTheme";
import { ThemedBox, ThemedText, ThemedButton, ThemedInput, ThemedSelect } from "../theme/components";
import logger from "../services/logger";
import type { Monitor } from "../types";

export function AddSiteForm() {
    const { createSite, addMonitorToSite, sites, isLoading, lastError, clearError } = useStore();
    const { isDark } = useTheme();
    // Remove identifier state, use only for monitor input
    const [target, setTarget] = useState(""); // For HTTP URL
    const [host, setHost] = useState("");     // For Port monitor host
    const [port, setPort] = useState("");     // For Port monitor port (string for input)
    const [name, setName] = useState("");
    const [monitorType, setMonitorType] = useState<"http" | "port">("http");
    const [checkInterval, setCheckInterval] = useState(CHECK_INTERVALS[6]?.value || 60000); // Default 1 min
    // UUID state
    const generateUUID = () => (typeof crypto !== "undefined" && crypto.randomUUID)
        ? crypto.randomUUID()
        : `site-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`;
    const [siteId, setSiteId] = useState<string>(generateUUID());

    // New: Add mode toggle
    const [addMode, setAddMode] = useState<"new" | "existing">("new");
    const [selectedExistingSite, setSelectedExistingSite] = useState<string>("");

    // Delayed loading state for button spinner (100ms delay)
    const [showButtonLoading, setShowButtonLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        if (isLoading) {
            // Show button loading after 100ms delay
            timeoutId = setTimeout(() => {
                setShowButtonLoading(true);
            }, UI_DELAYS.LOADING_BUTTON);
        } else {
            // Hide button loading immediately when loading stops
            setShowButtonLoading(false);
        }
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [isLoading]);

    // Reset fields when monitor type changes
    useEffect(() => {
        setFormError(null);
        setTarget("");
        setHost("");
        setPort("");
    }, [monitorType]);

    // Reset name and siteId when switching to new site
    useEffect(() => {
        if (addMode === "new") {
            setName("");
            setSiteId(generateUUID());
        } else {
            setName("");
        }
        setFormError(null);
    }, [addMode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        if (addMode === "new" && !name.trim()) {
            setFormError("Site name is required");
            return;
        }
        if (addMode === "existing" && !selectedExistingSite) {
            setFormError("Please select a site to add the monitor to");
            return;
        }
        if (monitorType === "http") {
            if (!target.trim()) {
                setFormError("Website URL is required for HTTP monitor");
                return;
            }
            if (!/^https?:\/\//i.test(target.trim())) {
                setFormError("HTTP monitor requires a URL starting with http:// or https://");
                return;
            }
        } else if (monitorType === "port") {
            if (!host.trim()) {
                setFormError("Host is required for port monitor");
                return;
            }
            if (!port.trim()) {
                setFormError("Port is required for port monitor");
                return;
            }
            const portNum = Number(port);
            if (!Number.isInteger(portNum) || portNum < 1 || portNum > 65535) {
                setFormError("Port must be a number between 1 and 65535");
                return;
            }
        }
        clearError();
        try {
            const identifier = addMode === "new" ? siteId : selectedExistingSite;
            const monitor: any = {
                type: monitorType,
                status: "pending" as const,
                history: [] as Monitor["history"],
            };
            if (monitorType === "http") {
                monitor.url = target.trim();
            } else if (monitorType === "port") {
                monitor.host = host.trim();
                monitor.port = Number(port);
            }
            monitor.checkInterval = checkInterval;
            if (addMode === "new") {
                const siteData = {
                    identifier,
                    name: name.trim() || undefined,
                    monitors: [monitor],
                };
                await createSite(siteData);
                logger.user.action("Added site", { identifier, name: name.trim(), monitorType });
            } else {
                await addMonitorToSite(identifier, monitor);
                logger.user.action("Added monitor to site", { identifier, monitorType });
            }
            // Reset form on success
            setTarget("");
            setHost("");
            setPort("");
            setName("");
            setMonitorType("http");
            setCheckInterval(CHECK_INTERVALS[6]?.value || 60000);
            setSiteId(generateUUID());
            setAddMode("new");
            setSelectedExistingSite("");
        } catch (error) {
            logger.error("Failed to add site/monitor from form", error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Add mode toggle */}
            <div className="flex gap-4 items-center">
                <label className="flex items-center gap-1">
                    <input
                        type="radio"
                        name="addMode"
                        value="new"
                        checked={addMode === "new"}
                        onChange={() => setAddMode("new")}
                    />
                    <ThemedText size="sm">Create New Site</ThemedText>
                </label>
                <label className="flex items-center gap-1">
                    <input
                        type="radio"
                        name="addMode"
                        value="existing"
                        checked={addMode === "existing"}
                        onChange={() => setAddMode("existing")}
                    />
                    <ThemedText size="sm">Add to Existing Site</ThemedText>
                </label>
            </div>

            {/* Existing site selector */}
            {addMode === "existing" && (
                <div>
                    <ThemedText size="sm" weight="medium" variant="secondary" className="block mb-1">
                        Select Site
                    </ThemedText>
                    <ThemedSelect
                        value={selectedExistingSite}
                        onChange={(e) => setSelectedExistingSite(e.target.value)}
                        aria-label="Select Existing Site"
                        required
                    >
                        <option value="">-- Select a site --</option>
                        {sites.map((site) => (
                            <option key={site.identifier} value={site.identifier}>
                                {site.name || site.identifier}
                            </option>
                        ))}
                    </ThemedSelect>
                </div>
            )}

            {/* Site Name (only for new site) */}
            {addMode === "new" && (
                <div>
                    <ThemedText size="sm" weight="medium" variant="secondary" className="block mb-1">
                        Site Name *
                    </ThemedText>
                    <ThemedInput
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="My Website"
                        aria-label="Site name (required)"
                        required
                    />
                </div>
            )}

            {/* Show generated UUID (for new site) */}
            {addMode === "new" && (
                <div>
                    <ThemedText size="xs" variant="tertiary" className="block select-all">
                        Site Identifier: <span className="font-mono">{siteId}</span>
                    </ThemedText>
                </div>
            )}

            {/* Monitor Type Selector */}
            <div>
                <ThemedText size="sm" weight="medium" variant="secondary" className="block mb-1">
                    Monitor Type
                </ThemedText>
                <ThemedSelect
                    value={monitorType}
                    onChange={(e) => setMonitorType(e.target.value as "http" | "port")}
                    aria-label="Monitor Type"
                >
                    <option value="http">HTTP (Website/API)</option>
                    <option value="port">Port (Host/Port)</option>
                </ThemedSelect>
            </div>

            {/* HTTP Monitor Fields */}
            {monitorType === "http" && (
                <div>
                    <ThemedText size="sm" weight="medium" variant="secondary" className="block mb-1">
                        Website URL *
                    </ThemedText>
                    <ThemedInput
                        type="url"
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        placeholder="https://example.com"
                        required
                        aria-label="Website URL (required)"
                    />
                </div>
            )}

            {/* Port Monitor Fields */}
            {monitorType === "port" && (
                <div className="flex flex-col gap-2">
                    <div>
                        <ThemedText size="sm" weight="medium" variant="secondary" className="block mb-1">
                            Host *
                        </ThemedText>
                        <ThemedInput
                            type="text"
                            value={host}
                            onChange={(e) => setHost(e.target.value)}
                            placeholder="example.com or 192.168.1.1"
                            required
                            aria-label="Host (required)"
                        />
                    </div>
                    <div>
                        <ThemedText size="sm" weight="medium" variant="secondary" className="block mb-1">
                            Port *
                        </ThemedText>
                        <ThemedInput
                            type="number"
                            min={1}
                            max={65535}
                            value={port}
                            onChange={(e) => setPort(e.target.value.replace(/[^0-9]/g, ""))}
                            placeholder="80"
                            required
                            aria-label="Port (required)"
                        />
                    </div>
                </div>
            )}

            <div>
                <ThemedText size="sm" weight="medium" variant="secondary" className="block mb-1">
                    Check Interval
                </ThemedText>
                <ThemedSelect
                    value={checkInterval}
                    onChange={(e) => setCheckInterval(Number(e.target.value))}
                    aria-label="Check Interval"
                >
                    {CHECK_INTERVALS.map((interval) => (
                        <option key={interval.value} value={interval.value}>
                            {interval.label}
                        </option>
                    ))}
                </ThemedSelect>
            </div>

            <ThemedButton
                type="submit"
                variant="primary"
                disabled={
                    (addMode === "new" && !name.trim()) ||
                    (addMode === "existing" && !selectedExistingSite) ||
                    (monitorType === "http" && !target.trim()) ||
                    (monitorType === "port" && (!host.trim() || !port.trim())) ||
                    isLoading
                }
                fullWidth
                loading={showButtonLoading}
            >
                {addMode === "new" ? "Add Site" : "Add Monitor"}
            </ThemedButton>

            {/* Error Message */}
            {(lastError || formError) && (
                <ThemedBox surface="base" padding="md" className={`error-alert ${isDark ? "dark" : ""}`} rounded="md">
                    <div className="flex items-center">
                        <ThemedText size="sm" className={`error-alert__text ${isDark ? "dark" : ""}`}>
                            ❌ {formError || lastError}
                        </ThemedText>
                        <ThemedButton
                            variant="secondary"
                            size="xs"
                            onClick={() => {
                                clearError();
                                setFormError(null);
                            }}
                            className={`error-alert__close ${isDark ? "dark" : ""}`}
                        >
                            ✕
                        </ThemedButton>
                    </div>
                </ThemedBox>
            )}

            <div className="space-y-1">
                <ThemedText size="xs" variant="tertiary">
                    • {addMode === "new" ? "Site name is required" : "Select a site to add the monitor to"}
                </ThemedText>
                {monitorType === "http" && (
                    <ThemedText size="xs" variant="tertiary">
                        • Enter the full URL including http:// or https://
                    </ThemedText>
                )}
                {monitorType === "port" && (
                    <>
                        <ThemedText size="xs" variant="tertiary">
                            • Enter a valid host (domain or IP)
                        </ThemedText>
                        <ThemedText size="xs" variant="tertiary">
                            • Enter a port number (1-65535)
                        </ThemedText>
                    </>
                )}
                <ThemedText size="xs" variant="tertiary">
                    • The monitor will be checked according to your monitoring interval
                </ThemedText>
            </div>
        </form>
    );
}
