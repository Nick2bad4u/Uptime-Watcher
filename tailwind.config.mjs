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
                "scale-in": "scale-in 0.3s ease-out forwards",
            },
            colors: {
                "status-down": "#ef4444",
                "status-paused": "#6b7280",
                "status-pending": "#f59e0b",
                "status-up": "#10b981",
            },
            keyframes: {
                "scale-in": {
                    "0%": { opacity: "0", transform: "scale(0.95)" },
                    "100%": { opacity: "1", transform: "scale(1)" },
                },
            },
        },
    },
};
