import assert from "node:assert/strict";
import * as fs from "node:fs";
import os from "node:os";
import * as path from "node:path";
import { afterEach, describe, it, vi } from "vitest";

import {
    checkForUpdates,
    synchronizeWasmArtifacts,
} from "../../../scripts/download-sqlite3-wasm.mjs";
import {
    getArtifactPaths,
    verifySqliteWasmArtifacts,
} from "../../../scripts/verify-sqlite3-wasm.mjs";

const temporaryDirectories = new Set();

afterEach(() => {
    vi.restoreAllMocks();
    for (const temporaryDirectory of temporaryDirectories) {
        fs.rmSync(temporaryDirectory, { force: true, recursive: true });
    }
    temporaryDirectories.clear();
});

/**
 * @param {number} fill
 */
function createWasm(fill) {
    const wasm = Buffer.alloc(1024, fill);
    wasm.set([
        0x00,
        0x61,
        0x73,
        0x6d,
    ]);
    return wasm;
}

function createWorkspace() {
    const workspaceRoot = fs.mkdtempSync(
        path.join(os.tmpdir(), "uptime-watcher-sqlite-wasm-")
    );
    temporaryDirectories.add(workspaceRoot);
    const paths = getArtifactPaths(workspaceRoot);
    fs.mkdirSync(path.dirname(paths.sourcePath), { recursive: true });
    fs.mkdirSync(path.dirname(paths.assetPath), { recursive: true });
    fs.mkdirSync(path.dirname(paths.distPath), { recursive: true });
    fs.writeFileSync(
        paths.lockfilePath,
        JSON.stringify({
            packages: {
                "node_modules/node-sqlite3-wasm": {
                    integrity: `sha512-${"A".repeat(86)}==`,
                    resolved:
                        "https://registry.npmjs.org/node-sqlite3-wasm/-/node-sqlite3-wasm-0.8.59.tgz",
                    version: "0.8.59",
                },
            },
        })
    );
    fs.writeFileSync(
        paths.packageJsonPath,
        JSON.stringify({ name: "node-sqlite3-wasm", version: "0.8.59" })
    );
    fs.writeFileSync(paths.sourcePath, createWasm(1));
    fs.writeFileSync(paths.assetPath, createWasm(2));
    fs.writeFileSync(paths.distPath, createWasm(2));
    return { paths, workspaceRoot };
}

function silenceReports() {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
}

describe("SQLite WASM artifact verification", () => {
    it("fails when the asset differs from the package source", () => {
        silenceReports();
        const { workspaceRoot } = createWorkspace();

        assert.equal(verifySqliteWasmArtifacts({ workspaceRoot }), false);
    });

    it("fails when dist differs from matching source and asset copies", () => {
        silenceReports();
        const { paths, workspaceRoot } = createWorkspace();
        fs.copyFileSync(paths.sourcePath, paths.assetPath);

        assert.equal(verifySqliteWasmArtifacts({ workspaceRoot }), false);
    });

    it("fails when the installed package version differs from the lockfile", () => {
        silenceReports();
        const { paths, workspaceRoot } = createWorkspace();
        fs.writeFileSync(
            paths.packageJsonPath,
            JSON.stringify({ name: "node-sqlite3-wasm", version: "0.8.60" })
        );

        assert.equal(verifySqliteWasmArtifacts({ workspaceRoot }), false);
    });

    it("fails when the lockfile package artifact has no integrity", () => {
        silenceReports();
        const { paths, workspaceRoot } = createWorkspace();
        const lockfile = JSON.parse(
            fs.readFileSync(paths.lockfilePath, "utf8")
        );
        delete lockfile.packages["node_modules/node-sqlite3-wasm"].integrity;
        fs.writeFileSync(paths.lockfilePath, JSON.stringify(lockfile));

        assert.equal(verifySqliteWasmArtifacts({ workspaceRoot }), false);
    });
});

describe("SQLite WASM artifact synchronization", () => {
    it("atomically synchronizes both copies from the package source", () => {
        silenceReports();
        const { paths, workspaceRoot } = createWorkspace();

        const result = synchronizeWasmArtifacts({ workspaceRoot });

        assert.equal(result.changed, true);
        assert.deepEqual(
            fs.readFileSync(paths.assetPath),
            fs.readFileSync(paths.sourcePath)
        );
        assert.deepEqual(
            fs.readFileSync(paths.distPath),
            fs.readFileSync(paths.sourcePath)
        );
        assert.equal(verifySqliteWasmArtifacts({ workspaceRoot }), true);
        assert.equal(checkForUpdates(workspaceRoot).hasUpdate, false);
    });

    it("preserves known-good targets when a staged copy is corrupted", () => {
        silenceReports();
        const { paths, workspaceRoot } = createWorkspace();
        const previousAsset = fs.readFileSync(paths.assetPath);
        const previousDist = fs.readFileSync(paths.distPath);

        assert.throws(
            () =>
                synchronizeWasmArtifacts({
                    copyFileSync(sourcePath, targetPath) {
                        fs.copyFileSync(sourcePath, targetPath);
                        fs.writeFileSync(targetPath, Buffer.from("corrupt"));
                    },
                    workspaceRoot,
                }),
            /Staged artifact/u
        );
        assert.deepEqual(fs.readFileSync(paths.assetPath), previousAsset);
        assert.deepEqual(fs.readFileSync(paths.distPath), previousDist);
    });

    it("preserves known-good targets when atomic replacement fails", () => {
        silenceReports();
        const { paths, workspaceRoot } = createWorkspace();
        const previousAsset = fs.readFileSync(paths.assetPath);
        const previousDist = fs.readFileSync(paths.distPath);

        assert.throws(
            () =>
                synchronizeWasmArtifacts({
                    renameSync() {
                        throw new Error("simulated rename failure");
                    },
                    workspaceRoot,
                }),
            /simulated rename failure/u
        );
        assert.deepEqual(fs.readFileSync(paths.assetPath), previousAsset);
        assert.deepEqual(fs.readFileSync(paths.distPath), previousDist);
    });
});

describe("SQLite WASM package scripts", () => {
    it("does not recreate dist after clean and uses a non-destructive resync", () => {
        const packageJson = JSON.parse(
            fs.readFileSync(path.resolve("package.json"), "utf8")
        );
        const viteConfig = fs.readFileSync(
            path.resolve("vite.config.ts"),
            "utf8"
        );

        assert.equal(packageJson.scripts.postclean, undefined);
        assert.match(packageJson.scripts.clean, /\bdist\b/u);
        assert.equal(
            packageJson.scripts["sqlite:reinstall-wasm"],
            "npm run sqlite:download:force"
        );
        assert.match(viteConfig, /npm run sqlite:download/u);
        assert.doesNotMatch(viteConfig, /npm run download:sqlite/u);
    });
});
