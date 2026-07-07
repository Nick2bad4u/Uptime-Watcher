/**
 * Shared telemetry payload types for sites-store helpers.
 *
 * @packageDocumentation
 */

import type { UnknownRecord } from "type-fest";

/**
 * Typed telemetry payload for the sites store.
 *
 * @remarks
 * This is intentionally _flexible_ (values are `unknown`) because telemetry
 * often includes domain objects (e.g. `Partial<Site>`, monitors, sync deltas)
 * whose types may contain unions/optionals that are awkward to model as strict
 * JSON values.
 *
 * The consistency win here is centralizing the payload type and standardizing
 * stage keys (`status`, `success`, `error`) via
 * {@link SitesTelemetryStagePayload}.
 */
export type SitesTelemetryPayload = Readonly<UnknownRecord>;

/**
 * Telemetry stage discriminator used by the sites store.
 *
 * @public
 */
export type SitesTelemetryStage =
    | "failure"
    | "pending"
    | "success";

/**
 * Discriminated union describing the canonical keys emitted by the sites store
 * operation telemetry pipeline.
 *
 * @remarks
 * The stage-specific keys (`status`, `success`, `error`) are standardized to
 * make logs easy to query, while still allowing additional metadata via
 * {@link SitesTelemetryPayload}.
 *
 * @public
 */
export type SitesTelemetryStagePayload =
    | (SitesTelemetryPayload & {
        readonly error: string;
        readonly status: "failure";
        readonly success: false;
    })
    | (SitesTelemetryPayload & { readonly status: "pending" })
    | (SitesTelemetryPayload & {
        readonly status: "success";
        readonly success: true;
    });

export type MutableSitesTelemetryPayload = UnknownRecord;
