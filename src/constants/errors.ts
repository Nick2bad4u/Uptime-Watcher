/**
 * Re-export centralized error messages for frontend use.
 *
 * @remarks
 * This file provides backward compatibility by re-exporting the centralized
 * error catalog. New code should import directly from the shared error catalog.
 *
 * @deprecated Import from `shared/utils/errorCatalog` instead
 * @packageDocumentation
 */

// Re-export the error catalog for frontend use
export { ERROR_CATALOG } from "../../shared/utils/errorCatalog";
