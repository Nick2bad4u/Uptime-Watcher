#!/usr/bin/env sh
# Minimal wrapper to run Electron in Flatpak /app environment.
# This script is intentionally small and checks both /app/bin/electron and
# node_modules/electron/dist/electron to support different packaging setups.

set -eu

# Resolve the script directory so we can find the repo root when this script is
# invoked from an arbitrary working directory.
SCRIPT_DIR_OVERRIDE=${SCRIPT_DIR_OVERRIDE-}
if [ -n "${SCRIPT_DIR_OVERRIDE}" ]; then
    SCRIPT_DIR=${SCRIPT_DIR_OVERRIDE}
else
    SCRIPT_PATH=$0
    case ${SCRIPT_PATH} in
        */*) ;;
        *)
            # If invoked via PATH, $0 may not be a path; resolve it.
            SCRIPT_PATH=$(command -v "${SCRIPT_PATH}" 2> /dev/null || printf '%s' "${SCRIPT_PATH}")
            ;;
    esac

    SCRIPT_DIR=$(
        unset CDPATH
        cd "$(dirname "${SCRIPT_PATH}")" && pwd
    )
fi

# Prefer the Flatpak build output directory when running inside the sandbox.
if [ -d "/app/dist" ]; then
    APP_DIR="/app/dist"
else
    APP_DIR="${SCRIPT_DIR}/dist"
fi

APP_ENTRY="${APP_DIR}/main.js"

if [ ! -f "${APP_ENTRY}" ]; then
    printf '%s\n' "Error: App entrypoint not found: ${APP_ENTRY}" >&2
    exit 1
fi

ELECTRON_BIN="/app/bin/electron"

for BIN in \
    "${ELECTRON_BIN}" \
    "${SCRIPT_DIR}/node_modules/electron/dist/electron" \
    "${SCRIPT_DIR}/../node_modules/electron/dist/electron" \
    "/app/node_modules/electron/dist/electron"; do
    if [ -x "${BIN}" ]; then
        exec "${BIN}" "${APP_ENTRY}" "$@"
    fi
done

printf '%s\n' "Error: Electron binary not found. Tried:" >&2
printf '%s\n' "  - ${ELECTRON_BIN}" >&2
printf '%s\n' "  - ${SCRIPT_DIR}/node_modules/electron/dist/electron" >&2
printf '%s\n' "  - ${SCRIPT_DIR}/../node_modules/electron/dist/electron" >&2
printf '%s\n' "  - /app/node_modules/electron/dist/electron" >&2
exit 1
