import { describe, expect, it } from "vitest";

import {
    getUserFacingErrorDetail,
    normalizeUserFacingErrorDetail,
} from "../../utils/userFacingErrors";

describe(getUserFacingErrorDetail, () => {
    it("redacts secret query params in Error messages", () => {
        const message =
            "OAuth failed: refresh_token=SUPER_SECRET&access_token=ABC123";
        const detail = getUserFacingErrorDetail(new Error(message));

        expect(detail).not.toContain("SUPER_SECRET");
        expect(detail).not.toContain("ABC123");
        expect(detail).toContain("refresh_token=[redacted]");
        expect(detail).toContain("access_token=[redacted]");
    });

    it("redacts secrets in record message fields", () => {
        const detail = getUserFacingErrorDetail({
            message: "Authorization: Bearer SECRET_TOKEN",
        });

        expect(detail).not.toContain("SECRET_TOKEN");
        expect(detail).toContain("[redacted]");
    });

    it("redacts secrets in string errors", () => {
        const detail = getUserFacingErrorDetail(
            "GET https://example.com/callback?token=abc"
        );

        expect(detail).not.toContain("token=abc");
        expect(detail).toContain("token=[redacted]");
    });

    it("compacts control characters and whitespace", () => {
        const detail = getUserFacingErrorDetail(
            new Error("Request failed\n\twith\r\nextra spacing")
        );

        expect(detail).toBe("Request failed with extra spacing");
    });

    it("bounds long details", () => {
        const detail = normalizeUserFacingErrorDetail(
            `denied ${"x".repeat(100)}`,
            {
                maxLength: 20,
            }
        );

        expect(detail).toBe(`denied ${"x".repeat(13)}...`);
    });

    it("falls back for blank string details after normalization", () => {
        expect(getUserFacingErrorDetail("\n\t")).toBe("Unknown error");
    });
});
