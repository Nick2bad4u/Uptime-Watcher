"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDev = isDev;
const electron_1 = require("electron");
function isDev() {
    return process.env.NODE_ENV === "development" || !electron_1.app.isPackaged;
}
