import { describe, expect, it } from "vitest";

describe("cloudServiceFsUtils (strict coverage)", () => {
    it("ignoreENOENT resolves when the operation succeeds", async () => {
        const { ignoreENOENT } = await import(
            "../../../../../../electron/services/cloud/internal/cloudServiceFsUtils"
        );

        await expect(ignoreENOENT(async () => undefined)).resolves.toBeUndefined();
    });

    it("ignoreENOENT swallows ENOENT", async () => {
        const { ignoreENOENT } = await import(
            "../../../../../../electron/services/cloud/internal/cloudServiceFsUtils"
        );

        await expect(
            ignoreENOENT(async () => {
                throw Object.assign(new Error("missing"), { code: "ENOENT" });
            })
        ).resolves.toBeUndefined();
    });

    it("ignoreENOENT rethrows non-ENOENT errors", async () => {
        const { ignoreENOENT } = await import(
            "../../../../../../electron/services/cloud/internal/cloudServiceFsUtils"
        );

        await expect(
            ignoreENOENT(async () => {
                throw Object.assign(new Error("denied"), { code: "EACCES" });
            })
        ).rejects.toBeInstanceOf(Error);
    });
});
