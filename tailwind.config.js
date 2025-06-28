/**
 * Tailwind CSS configuration for the Uptime Watcher application.
 *
 * Defines custom colors for status indicators, extended animations,
 * and responsive design settings.
 */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    darkMode: "class",
    plugins: [],
    theme: {
        extend: {
            animation: {
                "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            },
            colors: {
                "status-down": "#ef4444",
                "status-pending": "#f59e0b",
                "status-up": "#10b981",
            },
        },
    },
};
