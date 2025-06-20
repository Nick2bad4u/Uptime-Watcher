import React, { useState } from "react";
import { useStore } from "../store";

export function AddSiteForm() {
  const { addSite } = useStore();
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) return;

    setIsSubmitting(true);

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
      console.error("Failed to add site:", error);
      // You could show an error message to the user here
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="site-name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Site Name (Optional)
        </label>
        <input
          id="site-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Website"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
      </div>

      <div>
        <label
          htmlFor="site-url"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Website URL *
        </label>
        <input
          id="site-url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
      </div>

      <button
        type="submit"
        disabled={!url.trim() || isSubmitting}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? "Adding..." : "Add Site"}
      </button>

      <div className="text-xs text-gray-500 dark:text-gray-400">
        <p>
          • Make sure to include the full URL with protocol (http:// or
          https://)
        </p>
        <p>• The site will be checked according to your monitoring interval</p>
      </div>
    </form>
  );
}
