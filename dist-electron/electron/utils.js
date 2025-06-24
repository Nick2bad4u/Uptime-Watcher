import { app } from "electron";
export function isDev() {
    return process.env.NODE_ENV === "development" || !app.isPackaged;
}
