/**
 * Shared timestamp formatting for alert toasts.
 */

export interface ToastTimestamp {
    readonly dateTime: string;
    readonly label: string;
}

export function formatToastTimestamp(epochMs: number): ToastTimestamp {
    const date = new Date(epochMs);
    if (Number.isNaN(date.getTime())) {
        const now = new Date();
        return { dateTime: now.toISOString(), label: "Just now" };
    }

    const label = new Intl.DateTimeFormat(undefined, {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
    }).format(date);

    return { dateTime: date.toISOString(), label };
}
