import { useState, useEffect } from "react";
import { useStore } from "../store";
import { useTheme } from "../theme/useTheme";
import { ThemedBox, ThemedText, ThemedButton, ThemedInput } from "../theme/components";

export function AddSiteForm() {
    const { addSite, setError, setLoading, isLoading, lastError, clearError } = useStore();
    const { isDark } = useTheme();
    const [url, setUrl] = useState("");
    const [name, setName] = useState("");

    // Delayed loading state for button spinner (100ms delay)
    const [showButtonLoading, setShowButtonLoading] = useState(false);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        if (isLoading) {
            // Show button loading after 100ms delay
            timeoutId = setTimeout(() => {
                setShowButtonLoading(true);
            }, 100);
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

        if (!url.trim()) return;

        setLoading(true);
        clearError();

        try {
            const siteData = {
                url: url.trim(),
                name: name.trim() || undefined,
            };

            const newSite = await window.electronAPI.addSite(siteData);
            addSite(newSite);

            // The site is automatically saved by the backend when added
            // The store persistence will also save it to the frontend store

            // Reset form
            setUrl("");
            setName("");
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to add site";
            console.error("Failed to add site:", error);
            setError(errorMessage);
        } finally {
            setLoading(false);
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
            {lastError && (
                <ThemedBox surface="base" padding="md" className={`error-alert ${isDark ? "dark" : ""}`} rounded="md">
                    <div className="flex items-center">
                        <ThemedText size="sm" className={`error-alert__text ${isDark ? "dark" : ""}`}>
                            ❌ {lastError}
                        </ThemedText>
                        <ThemedButton
                            variant="secondary"
                            size="xs"
                            onClick={clearError}
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
