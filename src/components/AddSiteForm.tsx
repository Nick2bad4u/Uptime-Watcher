import { useState } from "react";
import { useStore } from "../store";
import { ThemedBox, ThemedText, ThemedButton, ThemedInput } from "../theme/components";

export function AddSiteForm() {
  const { addSite, setError, setLoading, isLoading, lastError, clearError } = useStore();
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");

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
        loading={isLoading}
      >
        Add Site
      </ThemedButton>

      {/* Error Message */}
      {lastError && (
        <ThemedBox 
          surface="base" 
          padding="md" 
          className="border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700"
          rounded="md"
        >
          <div className="flex items-center">
            <ThemedText size="sm" className="text-red-800 dark:text-red-200">
              ❌ {lastError}
            </ThemedText>
            <ThemedButton
              variant="secondary"
              size="xs"
              onClick={clearError}
              className="ml-auto text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
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
