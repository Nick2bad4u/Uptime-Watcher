import { describe, expect, it } from "vitest";

import { getUserFacingErrorDetail } from "../../utils/userFacingErrors";

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
});
