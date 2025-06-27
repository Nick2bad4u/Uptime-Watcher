export function generateUuid(): string {
    return typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `site-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`;
}
