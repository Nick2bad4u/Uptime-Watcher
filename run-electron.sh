#!/usr/bin/env sh
# Minimal wrapper to run Electron in Flatpak /app environment.
# This script is intentionally small and checks both /app/bin/electron and
# node_modules/electron/dist/electron to support different packaging setups.

set -e

APP_DIR="/app/dist-electron"
ELECTRON_BIN="/app/bin/electron"

if [ -x "$ELECTRON_BIN" ]; then
    exec "$ELECTRON_BIN" "$APP_DIR/main.js" "$@"
fi

if [ -x "$PWD/node_modules/electron/dist/electron" ]; then
    exec "$PWD/node_modules/electron/dist/electron" "$APP_DIR/main.js" "$@"
fi

echo "Error: Electron binary not found. Expected $ELECTRON_BIN or node_modules/electron/dist/electron"
exit 1
