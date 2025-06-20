import { app } from "electron";

export function isDev(): boolean {
  return process.env.NODE_ENV === "development" || !app.isPackaged;
}
