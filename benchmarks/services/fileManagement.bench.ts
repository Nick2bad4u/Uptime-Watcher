/**
 * File Management Service Performance Benchmarks
 *
 * @file Performance benchmarks for file operations, storage, and data
 *   persistence.
 *
 * @author GitHub Copilot
 *
 * @since 2025-08-19
 *
 * @category Performance
 *
 * @benchmark Services-FileManagement
 *
 * @tags ["performance", "services", "file-management", "storage", "persistence"]
 */

import { bench, describe } from "vitest";

interface FileMetadata {
    name: string;
    path: string;
    size: number;
    mimeType: string;
    createdAt: Date;
    modifiedAt: Date;
    checksum: string;
    permissions: FilePermissions;
    tags: string[];
    metadata: Record<string, any>;
}

interface FilePermissions {
    read: boolean;
    write: boolean;
    execute: boolean;
    owner: string;
    group: string;
}

interface FileContent {
    data: Buffer | string;
    encoding: "utf8" | "base64" | "binary";
    compressed: boolean;
}

interface StorageStats {
    totalFiles: number;
    totalSize: number;
    availableSpace: number;
    usedSpace: number;
    folders: number;
    compressionRatio: number;
}

interface BackupInfo {
    id: string;
    timestamp: Date;
    fileCount: number;
    totalSize: number;
    compressed: boolean;
    metadata: Record<string, any>;
}

interface FileSearchOptions {
    pattern?: string;
    mimeType?: string;
    sizeRange?: { min: number; max: number };
    dateRange?: { start: Date; end: Date };
    tags?: string[];
    recursive?: boolean;
    limit?: number;
}

class MockFileSystem {
    private files = new Map<
        string,
        { metadata: FileMetadata; content: FileContent }
    >();
    private directories = new Set<string>();

    async writeFile(
        path: string,
        content: Buffer | string,
        options?: {
            encoding?: "utf8" | "base64" | "binary";
            compress?: boolean;
            permissions?: Partial<FilePermissions>;
            tags?: string[];
            metadata?: Record<string, any>;
        }
    ): Promise<FileMetadata> {
        const opts = { encoding: "utf8" as const, compress: false, ...options };

        // Create directory structure
        const dirPath = this.getDirPath(path);
        this.ensureDirectory(dirPath);

        // Calculate checksum
        const checksum = this.calculateChecksum(content);

        // Compress if needed
        const fileContent: FileContent = {
            data: opts.compress ? this.compress(content) : content,
            encoding: opts.encoding,
            compressed: opts.compress,
        };

        const metadata: FileMetadata = {
            name: this.getFileName(path),
            path,
            size: Buffer.isBuffer(content)
                ? content.length
                : Buffer.byteLength(content, opts.encoding),
            mimeType: this.getMimeType(path),
            createdAt: new Date(),
            modifiedAt: new Date(),
            checksum,
            permissions: {
                read: true,
                write: true,
                execute: false,
                owner: "system",
                group: "users",
                ...opts.permissions,
            },
            tags: opts.tags || [],
            metadata: opts.metadata || {},
        };

        this.files.set(path, { metadata, content: fileContent });
        return { ...metadata };
    }

    async readFile(
        path: string
    ): Promise<{ metadata: FileMetadata; content: Buffer | string }> {
        const file = this.files.get(path);
        if (!file) {
            throw new Error(`File not found: ${path}`);
        }

        let content = file.content.data;
        if (file.content.compressed) {
            content = this.decompress(content);
        }

        return {
            metadata: { ...file.metadata },
            content,
        };
    }

    async deleteFile(path: string): Promise<boolean> {
        return this.files.delete(path);
    }

    async exists(path: string): Promise<boolean> {
        return this.files.has(path) || this.directories.has(path);
    }

    async listFiles(
        directory: string,
        recursive: boolean = false
    ): Promise<FileMetadata[]> {
        const files: FileMetadata[] = [];
        const normalizedDir = this.normalizePath(directory);

        for (const [filePath, file] of this.files) {
            const fileDir = this.getDirPath(filePath);

            if (recursive) {
                if (fileDir.startsWith(normalizedDir)) {
                    files.push({ ...file.metadata });
                }
            } else if (fileDir === normalizedDir) {
                files.push({ ...file.metadata });
            }
        }

        return files.toSorted((a, b) => a.name.localeCompare(b.name));
    }

    async searchFiles(options: FileSearchOptions): Promise<FileMetadata[]> {
        let results = Array.from(this.files.values(), (f) => ({
            ...f.metadata,
        }));

        if (options.pattern) {
            const regex = new RegExp(options.pattern, "i");
            results = results.filter(
                (file) => regex.test(file.name) || regex.test(file.path)
            );
        }

        if (options.mimeType) {
            results = results.filter(
                (file) => file.mimeType === options.mimeType
            );
        }

        if (options.sizeRange) {
            results = results.filter(
                (file) =>
                    file.size >= options.sizeRange!.min &&
                    file.size <= options.sizeRange!.max
            );
        }

        if (options.dateRange) {
            results = results.filter(
                (file) =>
                    file.modifiedAt >= options.dateRange!.start &&
                    file.modifiedAt <= options.dateRange!.end
            );
        }

        if (options.tags && options.tags.length > 0) {
            results = results.filter((file) =>
                options.tags!.some((tag) => file.tags.includes(tag))
            );
        }

        if (options.limit) {
            results = results.slice(0, options.limit);
        }

        return results;
    }

    async copyFile(
        sourcePath: string,
        destPath: string
    ): Promise<FileMetadata> {
        const sourceFile = await this.readFile(sourcePath);
        return await this.writeFile(destPath, sourceFile.content, {
            encoding: this.files.get(sourcePath)?.content.encoding,
            compress: this.files.get(sourcePath)?.content.compressed,
            permissions: sourceFile.metadata.permissions,
            tags: sourceFile.metadata.tags,
            metadata: sourceFile.metadata.metadata,
        });
    }

    async moveFile(
        sourcePath: string,
        destPath: string
    ): Promise<FileMetadata> {
        const newMetadata = await this.copyFile(sourcePath, destPath);
        await this.deleteFile(sourcePath);
        return newMetadata;
    }

    async getStats(): Promise<StorageStats> {
        const files = Array.from(this.files.values());
        const totalSize = files.reduce(
            (sum, file) => sum + file.metadata.size,
            0
        );
        const compressedSize = files
            .filter((file) => file.content.compressed)
            .reduce(
                (sum, file) =>
                    sum +
                    (Buffer.isBuffer(file.content.data)
                        ? file.content.data.length
                        : Buffer.byteLength(file.content.data.toString())),
                0
            );

        return {
            totalFiles: files.length,
            totalSize,
            availableSpace: 1_000_000_000, // 1GB mock available space
            usedSpace: totalSize,
            folders: this.directories.size,
            compressionRatio:
                compressedSize > 0 ? totalSize / compressedSize : 1,
        };
    }

    private ensureDirectory(path: string): void {
        const parts = path.split("/").filter(Boolean);
        let currentPath = "";

        for (const part of parts) {
            currentPath += `/${part}`;
            this.directories.add(currentPath);
        }
    }

    private getDirPath(filePath: string): string {
        const parts = filePath.split("/");
        return parts.slice(0, -1).join("/") || "/";
    }

    private getFileName(filePath: string): string {
        return filePath.split("/").pop() || "";
    }

    private normalizePath(path: string): string {
        return path.replaceAll(/\/+/g, "/").replace(/\/$/, "") || "/";
    }

    private getMimeType(path: string): string {
        const ext = path.split(".").pop()?.toLowerCase();
        const mimeTypes: Record<string, string> = {
            txt: "text/plain",
            json: "application/json",
            js: "application/javascript",
            ts: "application/typescript",
            html: "text/html",
            css: "text/css",
            png: "image/png",
            jpg: "image/jpeg",
            jpeg: "image/jpeg",
            pdf: "application/pdf",
            zip: "application/zip",
        };
        return mimeTypes[ext || ""] || "application/octet-stream";
    }

    private calculateChecksum(content: Buffer | string): string {
        // Simple checksum calculation
        let hash = 0;
        const data = Buffer.isBuffer(content) ? content.toString() : content;
        for (let i = 0; i < data.length; i++) {
            const char = data.codePointAt(i) ?? 0;
            // eslint-disable-next-line no-bitwise
            hash = (hash << 5) - hash + char;
            // eslint-disable-next-line no-bitwise
            hash &= hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(16);
    }

    private compress(content: Buffer | string): Buffer {
        // Mock compression - just add prefix
        const data = Buffer.isBuffer(content) ? content : Buffer.from(content);
        return Buffer.concat([Buffer.from("COMPRESSED:"), data]);
    }

    private decompress(content: Buffer | string): Buffer | string {
        // Mock decompression
        const data = Buffer.isBuffer(content) ? content : Buffer.from(content);
        if (data.toString().startsWith("COMPRESSED:")) {
            return data.slice(11); // Remove prefix
        }
        return data;
    }

    clear(): void {
        this.files.clear();
        this.directories.clear();
    }

    getFileCount(): number {
        return this.files.size;
    }
}

class MockBackupService {
    private backups = new Map<string, BackupInfo>();
    private nextId = 1;

    async createBackup(
        files: FileMetadata[],
        options?: {
            compress?: boolean;
            metadata?: Record<string, any>;
        }
    ): Promise<BackupInfo> {
        const opts = { compress: true, ...options };
        const totalSize = files.reduce((sum, file) => sum + file.size, 0);

        const backup: BackupInfo = {
            id: `backup-${this.nextId++}`,
            timestamp: new Date(),
            fileCount: files.length,
            totalSize,
            compressed: opts.compress,
            metadata: opts.metadata || {},
        };

        this.backups.set(backup.id, backup);
        return { ...backup };
    }

    async restoreBackup(backupId: string): Promise<FileMetadata[]> {
        const backup = this.backups.get(backupId);
        if (!backup) {
            throw new Error(`Backup ${backupId} not found`);
        }

        // Mock restored files
        const restoredFiles: FileMetadata[] = [];
        for (let i = 0; i < backup.fileCount; i++) {
            restoredFiles.push({
                name: `restored_file_${i}.txt`,
                path: `/backup/${backupId}/restored_file_${i}.txt`,
                size: Math.floor(backup.totalSize / backup.fileCount),
                mimeType: "text/plain",
                createdAt: backup.timestamp,
                modifiedAt: new Date(),
                checksum: Math.random().toString(16),
                permissions: {
                    read: true,
                    write: true,
                    execute: false,
                    owner: "system",
                    group: "users",
                },
                tags: ["restored"],
                metadata: { backupId, originalTimestamp: backup.timestamp },
            });
        }

        return restoredFiles;
    }

    async listBackups(): Promise<BackupInfo[]> {
        return Array.from(this.backups.values(), (backup) => ({
            ...backup,
        }));
    }

    async deleteBackup(backupId: string): Promise<boolean> {
        return this.backups.delete(backupId);
    }

    clear(): void {
        this.backups.clear();
        this.nextId = 1;
    }
}

class MockFileManagementService {
    private fileSystem: MockFileSystem;
    private backupService: MockBackupService;
    private cache = new Map<string, { data: any; expiry: Date }>();
    private cacheTimeout = 300_000; // 5 minutes

    constructor() {
        this.fileSystem = new MockFileSystem();
        this.backupService = new MockBackupService();
    }

    async saveFile(
        path: string,
        content: Buffer | string,
        options?: {
            encoding?: "utf8" | "base64" | "binary";
            compress?: boolean;
            tags?: string[];
            metadata?: Record<string, any>;
        }
    ): Promise<FileMetadata> {
        const metadata = await this.fileSystem.writeFile(
            path,
            content,
            options
        );

        // Clear related cache entries
        this.clearCachePattern(this.getDirPath(path));

        return metadata;
    }

    async loadFile(
        path: string,
        useCache: boolean = true
    ): Promise<{ metadata: FileMetadata; content: Buffer | string }> {
        // Check cache first
        if (useCache) {
            const cached = this.cache.get(path);
            if (cached && cached.expiry > new Date()) {
                return cached.data;
            }
        }

        const result = await this.fileSystem.readFile(path);

        // Cache result
        if (useCache) {
            this.cache.set(path, {
                data: result,
                expiry: new Date(Date.now() + this.cacheTimeout),
            });
        }

        return result;
    }

    async deleteFile(path: string): Promise<boolean> {
        const deleted = await this.fileSystem.deleteFile(path);

        if (deleted) {
            // Clear cache
            this.cache.delete(path);
            this.clearCachePattern(this.getDirPath(path));
        }

        return deleted;
    }

    async copyFile(
        sourcePath: string,
        destPath: string
    ): Promise<FileMetadata> {
        const metadata = await this.fileSystem.copyFile(sourcePath, destPath);

        // Clear destination directory cache
        this.clearCachePattern(this.getDirPath(destPath));

        return metadata;
    }

    async moveFile(
        sourcePath: string,
        destPath: string
    ): Promise<FileMetadata> {
        const metadata = await this.fileSystem.moveFile(sourcePath, destPath);

        // Clear both directory caches
        this.clearCachePattern(this.getDirPath(sourcePath));
        this.clearCachePattern(this.getDirPath(destPath));

        return metadata;
    }

    async listDirectory(
        path: string,
        recursive: boolean = false
    ): Promise<FileMetadata[]> {
        const cacheKey = `list:${path}:${recursive}`;

        // Check cache
        const cached = this.cache.get(cacheKey);
        if (cached && cached.expiry > new Date()) {
            return cached.data;
        }

        const files = await this.fileSystem.listFiles(path, recursive);

        // Cache results
        this.cache.set(cacheKey, {
            data: files,
            expiry: new Date(Date.now() + this.cacheTimeout),
        });

        return files;
    }

    async searchFiles(options: FileSearchOptions): Promise<FileMetadata[]> {
        return await this.fileSystem.searchFiles(options);
    }

    async batchOperations(
        operations: {
            type: "create" | "update" | "delete" | "copy" | "move";
            sourcePath?: string;
            destPath?: string;
            content?: Buffer | string;
            options?: any;
        }[]
    ): Promise<{ successful: number; failed: number; results: any[] }> {
        let successful = 0;
        let failed = 0;
        const results: any[] = [];

        for (const operation of operations) {
            try {
                let result;

                switch (operation.type) {
                    case "create":
                    case "update": {
                        if (!operation.destPath || !operation.content) {
                            throw new Error(
                                "Missing required parameters for create/update"
                            );
                        }
                        result = await this.saveFile(
                            operation.destPath,
                            operation.content,
                            operation.options
                        );
                        break;
                    }

                    case "delete": {
                        if (!operation.sourcePath) {
                            throw new Error("Missing sourcePath for delete");
                        }
                        result = await this.deleteFile(operation.sourcePath);
                        break;
                    }

                    case "copy": {
                        if (!operation.sourcePath || !operation.destPath) {
                            throw new Error("Missing paths for copy");
                        }
                        result = await this.copyFile(
                            operation.sourcePath,
                            operation.destPath
                        );
                        break;
                    }

                    case "move": {
                        if (!operation.sourcePath || !operation.destPath) {
                            throw new Error("Missing paths for move");
                        }
                        result = await this.moveFile(
                            operation.sourcePath,
                            operation.destPath
                        );
                        break;
                    }

                    default: {
                        throw new Error(
                            `Unknown operation type: ${operation.type}`
                        );
                    }
                }

                results.push({ success: true, result });
                successful++;
            } catch (error) {
                results.push({ success: false, error: error.message });
                failed++;
            }
        }

        return { successful, failed, results };
    }

    async createBackup(
        directory: string,
        options?: {
            recursive?: boolean;
            compress?: boolean;
            metadata?: Record<string, any>;
        }
    ): Promise<BackupInfo> {
        const opts = { recursive: true, compress: true, ...options };

        const files = await this.listDirectory(directory, opts.recursive);
        return await this.backupService.createBackup(files, {
            compress: opts.compress,
            metadata: opts.metadata,
        });
    }

    async restoreBackup(
        backupId: string,
        targetDirectory: string
    ): Promise<FileMetadata[]> {
        const restoredFiles = await this.backupService.restoreBackup(backupId);

        // Save restored files to target directory
        const savedFiles: FileMetadata[] = [];

        for (const file of restoredFiles) {
            const targetPath = `${targetDirectory}/${file.name}`;
            const content = `Restored content for ${file.name}`;

            const savedFile = await this.saveFile(targetPath, content, {
                tags: file.tags,
                metadata: file.metadata,
            });

            savedFiles.push(savedFile);
        }

        return savedFiles;
    }

    async getStorageStats(): Promise<StorageStats> {
        return await this.fileSystem.getStats();
    }

    async cleanupCache(olderThan?: Date): Promise<number> {
        const cutoff = olderThan || new Date(Date.now() - this.cacheTimeout);
        let cleaned = 0;

        for (const [key, cached] of this.cache) {
            if (cached.expiry < cutoff) {
                this.cache.delete(key);
                cleaned++;
            }
        }

        return cleaned;
    }

    private getDirPath(filePath: string): string {
        const parts = filePath.split("/");
        return parts.slice(0, -1).join("/") || "/";
    }

    private clearCachePattern(pattern: string): void {
        for (const key of this.cache.keys()) {
            if (key.includes(pattern)) {
                this.cache.delete(key);
            }
        }
    }

    getCacheStats(): { size: number; entries: string[] } {
        return {
            size: this.cache.size,
            entries: Array.from(this.cache.keys()),
        };
    }

    reset(): void {
        this.fileSystem.clear();
        this.backupService.clear();
        this.cache.clear();
    }
}

// Helper functions for creating test data
function generateTestFiles(
    count: number,
    directory: string = "/test"
): {
    path: string;
    content: string;
    options?: any;
}[] {
    return Array.from({ length: count }, (_, i) => ({
        path: `${directory}/file_${i}.txt`,
        content: `Test content for file ${i}\n`.repeat(
            Math.floor(Math.random() * 100) + 10
        ),
        options: {
            tags: [`tag${i % 5}`, "test"],
            metadata: {
                index: i,
                type: "test-file",
                created: new Date().toISOString(),
            },
        },
    }));
}

function generateLargeFile(sizeMB: number): string {
    const sizeBytes = sizeMB * 1024 * 1024;
    const chunkSize = 1024;
    const chunks = Math.ceil(sizeBytes / chunkSize);

    let content = "";
    for (let i = 0; i < chunks; i++) {
        content += "A".repeat(Math.min(chunkSize, sizeBytes - i * chunkSize));
    }

    return content;
}

describe("File Management Service Performance", () => {
    let service: MockFileManagementService;

    bench(
        "service initialization",
        () => {
            service = new MockFileManagementService();
        },
        { warmupIterations: 10, iterations: 1000 }
    );

    bench(
        "save single file",
        () => {
            service = new MockFileManagementService();
            service.saveFile("/test/single.txt", "Hello, World!");
        },
        { warmupIterations: 10, iterations: 3000 }
    );

    bench(
        "load single file",
        () => {
            service = new MockFileManagementService();
            service.saveFile("/test/load.txt", "Test content").then(() => {
                service.loadFile("/test/load.txt");
            });
        },
        { warmupIterations: 10, iterations: 4000 }
    );

    bench(
        "save file with compression",
        () => {
            service = new MockFileManagementService();
            const content = "Large content that should be compressed. ".repeat(
                100
            );
            service.saveFile("/test/compressed.txt", content, {
                compress: true,
                tags: ["compressed", "large"],
                metadata: { originalSize: content.length },
            });
        },
        { warmupIterations: 10, iterations: 2000 }
    );

    bench(
        "cached file access",
        () => {
            service = new MockFileManagementService();
            const content = "Cached content for performance testing";

            service.saveFile("/test/cached.txt", content).then(() => {
                // First access populates cache
                service.loadFile("/test/cached.txt", true).then(() => {
                    // Second access uses cache
                    service.loadFile("/test/cached.txt", true);
                });
            });
        },
        { warmupIterations: 10, iterations: 5000 }
    );

    bench(
        "delete file",
        () => {
            service = new MockFileManagementService();
            service.saveFile("/test/delete.txt", "To be deleted").then(() => {
                service.deleteFile("/test/delete.txt");
            });
        },
        { warmupIterations: 10, iterations: 3000 }
    );

    bench(
        "copy file",
        () => {
            service = new MockFileManagementService();
            service.saveFile("/test/source.txt", "Source content").then(() => {
                service.copyFile("/test/source.txt", "/test/copied.txt");
            });
        },
        { warmupIterations: 10, iterations: 2500 }
    );

    bench(
        "move file",
        () => {
            service = new MockFileManagementService();
            service
                .saveFile("/test/move_source.txt", "Move content")
                .then(() => {
                    service.moveFile(
                        "/test/move_source.txt",
                        "/test/moved.txt"
                    );
                });
        },
        { warmupIterations: 10, iterations: 2500 }
    );

    bench(
        "list directory",
        () => {
            service = new MockFileManagementService();
            const testFiles = generateTestFiles(20, "/test");

            Promise.all(
                testFiles.map((file) =>
                    service.saveFile(file.path, file.content, file.options)
                )
            ).then(() => {
                service.listDirectory("/test");
            });
        },
        { warmupIterations: 10, iterations: 1000 }
    );

    bench(
        "recursive directory listing",
        () => {
            service = new MockFileManagementService();
            const testFiles = [
                ...generateTestFiles(10, "/test/dir1"),
                ...generateTestFiles(10, "/test/dir2"),
                ...generateTestFiles(10, "/test/dir1/subdir"),
            ];

            Promise.all(
                testFiles.map((file) =>
                    service.saveFile(file.path, file.content, file.options)
                )
            ).then(() => {
                service.listDirectory("/test", true);
            });
        },
        { warmupIterations: 10, iterations: 800 }
    );

    bench(
        "file search by pattern",
        () => {
            service = new MockFileManagementService();
            const testFiles = generateTestFiles(30, "/search");

            Promise.all(
                testFiles.map((file) =>
                    service.saveFile(file.path, file.content, file.options)
                )
            ).then(() => {
                service.searchFiles({
                    pattern: String.raw`file_1.*\.txt`,
                    limit: 10,
                });
            });
        },
        { warmupIterations: 10, iterations: 1200 }
    );

    bench(
        "file search by tags",
        () => {
            service = new MockFileManagementService();
            const testFiles = generateTestFiles(25, "/tagged");

            Promise.all(
                testFiles.map((file) =>
                    service.saveFile(file.path, file.content, file.options)
                )
            ).then(() => {
                service.searchFiles({
                    tags: ["tag1", "tag2"],
                    limit: 15,
                });
            });
        },
        { warmupIterations: 10, iterations: 1200 }
    );

    bench(
        "file search by size range",
        () => {
            service = new MockFileManagementService();
            const testFiles = generateTestFiles(20, "/sized");

            Promise.all(
                testFiles.map((file) =>
                    service.saveFile(file.path, file.content, file.options)
                )
            ).then(() => {
                service.searchFiles({
                    sizeRange: { min: 100, max: 1000 },
                    limit: 10,
                });
            });
        },
        { warmupIterations: 10, iterations: 1200 }
    );

    bench(
        "batch file operations",
        () => {
            service = new MockFileManagementService();

            const operations = [
                ...Array.from({ length: 10 }, (_, i) => ({
                    type: "create" as const,
                    destPath: `/batch/create_${i}.txt`,
                    content: `Batch created content ${i}`,
                    options: { tags: ["batch", "created"] },
                })),
                ...Array.from({ length: 5 }, (_, i) => ({
                    type: "copy" as const,
                    sourcePath: `/batch/create_${i}.txt`,
                    destPath: `/batch/copied_${i}.txt`,
                })),
            ];

            service.batchOperations(operations);
        },
        { warmupIterations: 10, iterations: 600 }
    );

    bench(
        "large file handling",
        () => {
            service = new MockFileManagementService();
            const largeContent = generateLargeFile(1); // 1MB file

            service.saveFile("/test/large.bin", largeContent, {
                compress: true,
                metadata: { size: "1MB", type: "large-file" },
            });
        },
        { warmupIterations: 5, iterations: 200 }
    );

    bench(
        "create backup",
        () => {
            service = new MockFileManagementService();
            const testFiles = generateTestFiles(15, "/backup_source");

            Promise.all(
                testFiles.map((file) =>
                    service.saveFile(file.path, file.content, file.options)
                )
            ).then(() => {
                service.createBackup("/backup_source", {
                    recursive: true,
                    compress: true,
                    metadata: { purpose: "performance-test" },
                });
            });
        },
        { warmupIterations: 10, iterations: 500 }
    );

    bench(
        "restore backup",
        () => {
            service = new MockFileManagementService();
            const testFiles = generateTestFiles(10, "/backup_test");

            Promise.all(
                testFiles.map((file) =>
                    service.saveFile(file.path, file.content, file.options)
                )
            ).then(() => {
                service.createBackup("/backup_test").then((backup) => {
                    service.restoreBackup(backup.id, "/restored");
                });
            });
        },
        { warmupIterations: 10, iterations: 400 }
    );

    bench(
        "storage statistics",
        () => {
            service = new MockFileManagementService();
            const testFiles = generateTestFiles(25, "/stats");

            Promise.all(
                testFiles.map((file) =>
                    service.saveFile(file.path, file.content, file.options)
                )
            ).then(() => {
                service.getStorageStats();
            });
        },
        { warmupIterations: 10, iterations: 1500 }
    );

    bench(
        "cache management",
        () => {
            service = new MockFileManagementService();
            const testFiles = generateTestFiles(20, "/cache_test");

            Promise.all(
                testFiles.map((file) =>
                    service.saveFile(file.path, file.content, file.options)
                )
            ).then(() => {
                // Load files to populate cache
                const loadPromises = testFiles.map((file) =>
                    service.loadFile(file.path, true)
                );

                Promise.all(loadPromises).then(() => {
                    // Check cache stats
                    service.getCacheStats();
                    // Clean cache
                    service.cleanupCache();
                });
            });
        },
        { warmupIterations: 10, iterations: 800 }
    );

    bench(
        "concurrent file operations",
        () => {
            service = new MockFileManagementService();

            // Simulate concurrent read/write operations
            const writePromises = Array.from({ length: 10 }, (_, i) =>
                service.saveFile(
                    `/concurrent/write_${i}.txt`,
                    `Concurrent content ${i}`
                )
            );

            Promise.all(writePromises).then(() => {
                const readPromises = Array.from({ length: 10 }, (_, i) =>
                    service.loadFile(`/concurrent/write_${i}.txt`)
                );
                Promise.all(readPromises);
            });
        },
        { warmupIterations: 10, iterations: 600 }
    );

    bench(
        "mixed file operations",
        () => {
            service = new MockFileManagementService();

            // Create initial files
            const initialFiles = generateTestFiles(8, "/mixed");

            Promise.all(
                initialFiles.map((file) =>
                    service.saveFile(file.path, file.content, file.options)
                )
            ).then(() => {
                // Perform mixed operations
                const operations = [
                    service.copyFile(
                        "/mixed/file_0.txt",
                        "/mixed/copied_0.txt"
                    ),
                    service.moveFile("/mixed/file_1.txt", "/mixed/moved_1.txt"),
                    service.searchFiles({ tags: ["test"], limit: 5 }),
                    service.listDirectory("/mixed"),
                    service.loadFile("/mixed/file_2.txt"),
                    service.deleteFile("/mixed/file_3.txt"),
                ];

                Promise.all(operations);
            });
        },
        { warmupIterations: 10, iterations: 400 }
    );

    bench(
        "service reset",
        () => {
            service = new MockFileManagementService();
            const testFiles = generateTestFiles(15, "/reset_test");

            Promise.all(
                testFiles.map((file) =>
                    service.saveFile(file.path, file.content, file.options)
                )
            ).then(() => {
                service.createBackup("/reset_test").then(() => {
                    service.reset();
                });
            });
        },
        { warmupIterations: 10, iterations: 600 }
    );
});
