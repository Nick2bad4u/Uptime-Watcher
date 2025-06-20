import React from "react";
import { Site } from "../types";
import { SiteCard } from "./SiteCard";

interface SiteListProps {
  sites: Site[];
}

export function SiteList({ sites }: SiteListProps) {
  if (sites.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">🌐</div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No sites to monitor
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Add your first website to start monitoring its uptime.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {sites.map((site) => (
        <SiteCard key={site.id} site={site} />
      ))}
    </div>
  );
}
