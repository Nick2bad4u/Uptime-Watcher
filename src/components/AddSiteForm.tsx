import { useState, useEffect } from "react";
import { useStore } from "../store";
import { UI_DELAYS, CHECK_INTERVALS } from "../constants";
import { useTheme } from "../theme/useTheme";
import { ThemedBox, ThemedText, ThemedButton, ThemedInput, ThemedSelect } from "../theme/components";
import logger from "../services/logger";
import type { Monitor } from "../types";

export function AddSiteForm() {
    const { createSite, isLoading, lastError, clearError } = useStore();
    const { isDark } = useTheme();
    const [url, setUrl] = useState("");
    const [name, setName] = useState("");
    const [monitorType, setMonitorType] = useState<"http" | "port">("http");
    const [checkInterval, setCheckInterval] = useState(CHECK_INTERVALS[6]?.value || 60000); // Default 1 min

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setFormError(null);
        if (!url.trim()) return;

        // Only allow http/https URLs for HTTP monitor
        if (monitorType === "http" && !/^https?:\/\//i.test(url.trim())) {
            setFormError("HTTP monitor requires a URL starting with http:// or https://");
            return;
        }

        clearError();

        try {
            const siteData = {
                url: url.trim(),
                name: name.trim() || undefined,
                monitors: [
                    {
                        type: monitorType,
                        status: "pending" as const,
                        history: [] as Monitor["history"],
                    },
                ],
                checkInterval,
            };

            await createSite(siteData);

            // Reset form on success
            setUrl("");
            setName("");
            setMonitorType("http");
            setCheckInterval(CHECK_INTERVALS[6]?.value || 60000);
            logger.user.action("Added site", { url: url.trim(), name: name.trim(), monitorType });
        } catch (error) {
            // Error is already handled by the store action
            logger.error("Failed to add site from form", error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <ThemedText size="sm" weight="medium" variant="secondary" className="block mb-1">
                    Site Name (Optional)
                </ThemedText>
                <ThemedInput
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="My Website"
                    aria-label="Site name (optional)"
                />
            </div>

            <div>
                <ThemedText size="sm" weight="medium" variant="secondary" className="block mb-1">
                    Website URL *
                </ThemedText>
                <ThemedInput
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    required
                    aria-label="Website URL (required)"
                />
            </div>

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
                    <option value="port" disabled>
                        Port (Coming Soon)
                    </option>
                </ThemedSelect>
            </div>

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
                disabled={!url.trim() || isLoading}
                fullWidth
                loading={showButtonLoading}
            >
                Add Site
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
                    • Enter the full URL including http:// or https://
                </ThemedText>
                <ThemedText size="xs" variant="tertiary">
                    • The site will be checked according to your monitoring interval
                </ThemedText>
            </div>
        </form>
    );
}
