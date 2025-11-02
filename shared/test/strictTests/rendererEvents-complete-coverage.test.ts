/**
 * Exhaustively validates the renderer IPC channel catalogue and payload types.
 *
 * @file Prevents drift between the shared IPC contract definitions and the
 *   expectations of renderer subscribers by asserting both runtime values and
 *   compile-time typings through {@link RendererEventPayload} queries.
 */

import { describe, expect, it } from "vitest";

import {
    RENDERER_EVENT_CHANNELS,
    type RendererEventChannel,
    type RendererEventPayloadMap,
} from "@shared/ipc/rendererEvents";

const EXPECTED_CHANNEL_MAP = {
    CACHE_INVALIDATED: "cache:invalidated",
    MONITOR_CHECK_COMPLETED: "monitor:check-completed",
    MONITOR_DOWN: "monitor:down",
    MONITOR_STATUS_CHANGED: "monitor:status-changed",
    MONITOR_UP: "monitor:up",
    MONITORING_STARTED: "monitoring:started",
    MONITORING_STOPPED: "monitoring:stopped",
    SETTINGS_HISTORY_LIMIT_UPDATED: "settings:history-limit-updated",
    SITE_ADDED: "site:added",
    SITE_REMOVED: "site:removed",
    SITE_UPDATED: "site:updated",
    STATE_SYNC: "state-sync-event",
    TEST_EVENT: "test-event",
    UPDATE_STATUS: "update-status",
} as const;

type ExtractedChannelUnion =
    (typeof EXPECTED_CHANNEL_MAP)[keyof typeof EXPECTED_CHANNEL_MAP];
type ChannelUnionMatchesExport =
    RendererEventChannel extends ExtractedChannelUnion ? true : never;
type ChannelUnionCoversExport =
    ExtractedChannelUnion extends RendererEventChannel ? true : never;
type PayloadMapKeysMatchChannels =
    keyof RendererEventPayloadMap extends RendererEventChannel ? true : never;
type PayloadMapChannelsAreCovered =
    RendererEventChannel extends keyof RendererEventPayloadMap ? true : never;

const CHANNEL_UNION_ASSERTION: [
    ChannelUnionMatchesExport,
    ChannelUnionCoversExport,
] = [true, true];
const PAYLOAD_MAP_ASSERTION: [
    PayloadMapKeysMatchChannels,
    PayloadMapChannelsAreCovered,
] = [true, true];

void CHANNEL_UNION_ASSERTION;
void PAYLOAD_MAP_ASSERTION;

describe("RENDERER_EVENT_CHANNELS", () => {
    it("matches the documented channel mapping", () => {
        expect(RENDERER_EVENT_CHANNELS).toStrictEqual(EXPECTED_CHANNEL_MAP);
    });

    it("keeps the channel union synchronised", () => {
        const identifiers = Object.values(RENDERER_EVENT_CHANNELS);

        expect(new Set(identifiers).size).toBe(identifiers.length);
    });

    it("keeps payload map keys aligned with published channel identifiers", () => {
        const canonicalKeys = Object.keys(RENDERER_EVENT_CHANNELS);

        expect(
            canonicalKeys.every((key) => /^[A-Z_]+$/u.test(key))
        ).toBeTruthy();
    });
});
