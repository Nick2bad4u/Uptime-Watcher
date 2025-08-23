/**
 * @module benchmarks/electron/updaterService
 *
 * @file Benchmarks for updater service operations in the Electron main process.
 *
 *   Tests performance of update checking, downloading, verification,
 *   installation, and rollback operations for application updates.
 */

import { bench, describe } from "vitest";

// Define comprehensive interfaces for type safety
interface UpdateInfo {
    version: string;
    releaseDate: string;
    downloadUrl: string;
    size: number;
    checksum: string;
    signature?: string;
    releaseNotes: string;
    critical: boolean;
    minimumVersion?: string;
    platforms: string[];
    channels: string[];
}

interface UpdateCheck {
    checkId: string;
    currentVersion: string;
    channel: string;
    checkStartTime: number;
    checkEndTime: number;
    success: boolean;
    updateAvailable: boolean;
    updateInfo?: UpdateInfo;
    error?: string;
    cacheHit: boolean;
    networkLatency: number;
}

interface DownloadProgress {
    downloadId: string;
    startTime: number;
    currentTime: number;
    totalBytes: number;
    downloadedBytes: number;
    speed: number; // bytes per second
    remainingTime: number; // milliseconds
    progress: number; // 0-1
    paused: boolean;
    error?: string;
}

interface VerificationResult {
    verificationId: string;
    filePath: string;
    expectedChecksum: string;
    actualChecksum: string;
    checksumValid: boolean;
    signatureValid: boolean;
    verificationTime: number;
    success: boolean;
    error?: string;
}

interface InstallationProgress {
    installId: string;
    phase: string;
    startTime: number;
    currentTime: number;
    progress: number;
    estimatedTimeRemaining: number;
    backupCreated: boolean;
    rollbackAvailable: boolean;
    error?: string;
}

describe("Updater Service Benchmarks", () => {
    const updateChannels = [
        "stable",
        "beta",
        "alpha",
        "nightly",
    ];
    const platforms = [
        "win32",
        "darwin",
        "linux",
    ];
    const installationPhases = [
        "preparation",
        "backup",
        "verification",
        "extraction",
        "file-replacement",
        "configuration-update",
        "cleanup",
        "finalization",
    ];

    // Update checking performance
    bench("update checking simulation", () => {
        const updateChecks: UpdateCheck[] = [];

        // Simulate various update scenarios
        const updateScenarios = [
            {
                name: "no-update-available",
                probability: 0.6,
                networkDelay: { min: 200, max: 1000 },
                cacheHitRate: 0.3,
            },
            {
                name: "minor-update-available",
                probability: 0.25,
                networkDelay: { min: 300, max: 1500 },
                cacheHitRate: 0.1,
            },
            {
                name: "major-update-available",
                probability: 0.1,
                networkDelay: { min: 400, max: 2000 },
                cacheHitRate: 0.05,
            },
            {
                name: "critical-update-available",
                probability: 0.05,
                networkDelay: { min: 500, max: 2500 },
                cacheHitRate: 0.02,
            },
        ];

        for (let i = 0; i < 500; i++) {
            // Determine scenario based on probability
            const rand = Math.random();
            let cumulativeProbability = 0;
            let selectedScenario = updateScenarios[0];

            for (const scenario of updateScenarios) {
                cumulativeProbability += scenario.probability;
                if (rand <= cumulativeProbability) {
                    selectedScenario = scenario;
                    break;
                }
            }

            const currentVersion = `1.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 20)}`;
            const channel =
                updateChannels[
                    Math.floor(Math.random() * updateChannels.length)
                ];
            const checkStartTime = Date.now();

            // Simulate network latency
            const isCacheHit = Math.random() < selectedScenario.cacheHitRate;
            const networkLatency = isCacheHit
                ? 10
                : selectedScenario.networkDelay.min +
                  Math.random() *
                      (selectedScenario.networkDelay.max -
                          selectedScenario.networkDelay.min);

            const checkEndTime = checkStartTime + networkLatency;

            // Determine if update is available
            const updateAvailable =
                selectedScenario.name !== "no-update-available";

            let updateInfo: UpdateInfo | undefined;
            if (updateAvailable) {
                const versionParts = currentVersion.split(".").map(Number);

                // Generate new version based on scenario
                switch (selectedScenario.name) {
                    case "minor-update-available": {
                        versionParts[2]++;
                        break;
                    }
                    case "major-update-available": {
                        versionParts[1]++;
                        versionParts[2] = 0;
                        break;
                    }
                    case "critical-update-available": {
                        versionParts[0]++;
                        versionParts[1] = 0;
                        versionParts[2] = 0;
                        break;
                    }
                }

                const newVersion = versionParts.join(".");
                const updateSize =
                    Math.floor(Math.random() * 100_000_000) + 10_000_000; // 10MB - 110MB

                updateInfo = {
                    version: newVersion,
                    releaseDate: new Date(
                        Date.now() - Math.random() * 86_400_000 * 7
                    ).toISOString(), // Within last week
                    downloadUrl: `https://releases.example.com/v${newVersion}/update.zip`,
                    size: updateSize,
                    checksum: `sha256:${Math.random().toString(36).slice(2, 66)}`, // Mock checksum
                    signature:
                        Math.random() > 0.2
                            ? `sig_${Math.random().toString(36).slice(2, 20)}`
                            : undefined,
                    releaseNotes: `Release notes for version ${newVersion}`,
                    critical:
                        selectedScenario.name === "critical-update-available",
                    minimumVersion:
                        selectedScenario.name === "critical-update-available"
                            ? currentVersion
                            : undefined,
                    platforms: platforms.slice(), // All platforms
                    channels: [channel],
                };
            }

            // Simulate check success/failure
            const success = Math.random() > 0.02; // 98% success rate

            const updateCheck: UpdateCheck = {
                checkId: `check-${i}`,
                currentVersion,
                channel,
                checkStartTime,
                checkEndTime,
                success,
                updateAvailable: success ? updateAvailable : false,
                updateInfo: success ? updateInfo : undefined,
                error: success
                    ? undefined
                    : "Network error during update check",
                cacheHit: isCacheHit,
                networkLatency,
            };

            updateChecks.push(updateCheck);
        }

        // Calculate update check metrics
        const successfulChecks = updateChecks.filter((c) => c.success);
        const checksWithUpdates = successfulChecks.filter(
            (c) => c.updateAvailable
        );
        const averageCheckTime =
            updateChecks.reduce(
                (sum, c) => sum + (c.checkEndTime - c.checkStartTime),
                0
            ) / updateChecks.length;
        const cacheHitRate =
            updateChecks.filter((c) => c.cacheHit).length / updateChecks.length;
        const updateAvailabilityRate =
            checksWithUpdates.length / successfulChecks.length;
    });

    // Download progress simulation
    bench("download progress simulation", () => {
        const downloadProgresses: DownloadProgress[] = [];

        const downloadScenarios = [
            {
                name: "small-update",
                size: { min: 5_000_000, max: 25_000_000 }, // 5-25 MB
                speed: { min: 1_000_000, max: 5_000_000 }, // 1-5 MB/s
                reliabilityRate: 0.98,
            },
            {
                name: "medium-update",
                size: { min: 25_000_000, max: 100_000_000 }, // 25-100 MB
                speed: { min: 800_000, max: 4_000_000 }, // 0.8-4 MB/s
                reliabilityRate: 0.95,
            },
            {
                name: "large-update",
                size: { min: 100_000_000, max: 500_000_000 }, // 100-500 MB
                speed: { min: 500_000, max: 3_000_000 }, // 0.5-3 MB/s
                reliabilityRate: 0.9,
            },
        ];

        for (let i = 0; i < 300; i++) {
            const scenario =
                downloadScenarios[
                    Math.floor(Math.random() * downloadScenarios.length)
                ];

            // Generate download parameters
            const totalBytes = Math.floor(
                scenario.size.min +
                    Math.random() * (scenario.size.max - scenario.size.min)
            );

            const baseSpeed = Math.floor(
                scenario.speed.min +
                    Math.random() * (scenario.speed.max - scenario.speed.min)
            );

            const startTime = Date.now();
            let currentTime = startTime;
            let downloadedBytes = 0;
            let currentSpeed = baseSpeed;
            let paused = false;

            // Simulate download progress over time
            const progressSnapshots: DownloadProgress[] = [];

            while (downloadedBytes < totalBytes) {
                // Simulate speed variations (±30%)
                const speedVariation = (Math.random() - 0.5) * 0.6;
                currentSpeed = Math.max(
                    100_000,
                    baseSpeed * (1 + speedVariation)
                ); // Minimum 100 KB/s

                // Simulate potential pauses (5% chance)
                if (Math.random() < 0.05 && !paused) {
                    paused = true;
                    currentSpeed = 0;
                } else if (paused && Math.random() < 0.3) {
                    paused = false;
                }

                // Simulate download progress
                const timeStep = 1000; // 1 second intervals
                const bytesThisStep = paused
                    ? 0
                    : Math.min(currentSpeed, totalBytes - downloadedBytes);

                downloadedBytes += bytesThisStep;
                currentTime += timeStep;

                const progress = downloadedBytes / totalBytes;
                const remainingBytes = totalBytes - downloadedBytes;
                const remainingTime =
                    currentSpeed > 0
                        ? (remainingBytes / currentSpeed) * 1000
                        : 0;

                // Simulate download failures
                const shouldFail = Math.random() > scenario.reliabilityRate;

                const progressSnapshot: DownloadProgress = {
                    downloadId: `download-${i}`,
                    startTime,
                    currentTime,
                    totalBytes,
                    downloadedBytes,
                    speed: currentSpeed,
                    remainingTime,
                    progress,
                    paused,
                    error: shouldFail ? "Network connection lost" : undefined,
                };

                progressSnapshots.push(progressSnapshot);

                if (shouldFail) {
                    break; // Stop download on failure
                }

                // Break if download is complete
                if (downloadedBytes >= totalBytes) {
                    break;
                }

                // Limit snapshots to prevent excessive data
                if (progressSnapshots.length > 100) {
                    break;
                }
            }

            // Add all snapshots to the main array
            downloadProgresses.push(...progressSnapshots);
        }

        // Calculate download metrics
        const completedDownloads = downloadProgresses
            .filter((dp) => dp.progress >= 1)
            .reduce(
                (groups, dp) => {
                    if (!groups[dp.downloadId]) {
                        groups[dp.downloadId] = dp;
                    }
                    return groups;
                },
                {} as Record<string, DownloadProgress>
            );

        const failedDownloads = downloadProgresses
            .filter((dp) => dp.error)
            .reduce(
                (groups, dp) => {
                    if (!groups[dp.downloadId]) {
                        groups[dp.downloadId] = dp;
                    }
                    return groups;
                },
                {} as Record<string, DownloadProgress>
            );

        const averageDownloadSpeed =
            downloadProgresses
                .filter((dp) => dp.speed > 0)
                .reduce((sum, dp) => sum + dp.speed, 0) /
            downloadProgresses.filter((dp) => dp.speed > 0).length;

        const pauseRate =
            downloadProgresses.filter((dp) => dp.paused).length /
            downloadProgresses.length;
    });

    // File verification simulation
    bench("file verification simulation", () => {
        const verificationResults: VerificationResult[] = [];

        const verificationScenarios = [
            {
                name: "standard-verification",
                checksumAlgorithm: "sha256",
                hasSignature: 0.8,
                checksumValidRate: 0.99,
                signatureValidRate: 0.98,
                verificationTime: { min: 100, max: 2000 },
            },
            {
                name: "enhanced-verification",
                checksumAlgorithm: "sha512",
                hasSignature: 0.95,
                checksumValidRate: 0.995,
                signatureValidRate: 0.99,
                verificationTime: { min: 200, max: 3000 },
            },
            {
                name: "legacy-verification",
                checksumAlgorithm: "sha256",
                hasSignature: 0.3,
                checksumValidRate: 0.97,
                signatureValidRate: 0.95,
                verificationTime: { min: 50, max: 1000 },
            },
        ];

        for (let i = 0; i < 400; i++) {
            const scenario =
                verificationScenarios[
                    Math.floor(Math.random() * verificationScenarios.length)
                ];

            const filePath = `./downloads/update-${i}.zip`;
            const hasSignature = Math.random() < scenario.hasSignature;

            // Generate checksums
            const expectedChecksum = `${scenario.checksumAlgorithm}:${Math.random().toString(36).slice(2, 66)}`;

            // Simulate verification process
            const verificationStartTime = Date.now();
            const verificationTime = Math.floor(
                scenario.verificationTime.min +
                    Math.random() *
                        (scenario.verificationTime.max -
                            scenario.verificationTime.min)
            );

            // Determine verification results
            const checksumValid = Math.random() < scenario.checksumValidRate;
            const signatureValid = hasSignature
                ? Math.random() < scenario.signatureValidRate
                : true;

            // Generate actual checksum (same as expected if valid)
            const actualChecksum = checksumValid
                ? expectedChecksum
                : `${scenario.checksumAlgorithm}:${Math.random().toString(36).slice(2, 66)}`;

            const success = checksumValid && signatureValid;

            let error: string | undefined;
            if (!checksumValid) {
                error = "Checksum verification failed";
            } else if (!signatureValid) {
                error = "Signature verification failed";
            }

            const verificationResult: VerificationResult = {
                verificationId: `verify-${i}`,
                filePath,
                expectedChecksum,
                actualChecksum,
                checksumValid,
                signatureValid,
                verificationTime,
                success,
                error,
            };

            verificationResults.push(verificationResult);
        }

        // Calculate verification metrics
        const successfulVerifications = verificationResults.filter(
            (v) => v.success
        );
        const checksumFailures = verificationResults.filter(
            (v) => !v.checksumValid
        );
        const signatureFailures = verificationResults.filter(
            (v) => !v.signatureValid
        );
        const averageVerificationTime =
            verificationResults.reduce(
                (sum, v) => sum + v.verificationTime,
                0
            ) / verificationResults.length;
        const verificationSuccessRate =
            successfulVerifications.length / verificationResults.length;
    });

    // Installation progress simulation
    bench("installation progress simulation", () => {
        const installationProgresses: InstallationProgress[] = [];

        const installationScenarios = [
            {
                name: "standard-installation",
                phases: installationPhases.slice(),
                phaseDurations: [
                    1000,
                    3000,
                    2000,
                    8000,
                    12_000,
                    2000,
                    3000,
                    1000,
                ], // milliseconds
                successRate: 0.95,
                backupEnabled: true,
                rollbackSupported: true,
            },
            {
                name: "quick-installation",
                phases: [
                    "preparation",
                    "verification",
                    "file-replacement",
                    "finalization",
                ],
                phaseDurations: [
                    500,
                    1000,
                    5000,
                    500,
                ],
                successRate: 0.98,
                backupEnabled: false,
                rollbackSupported: false,
            },
            {
                name: "complex-installation",
                phases: installationPhases.concat([
                    "migration",
                    "post-install-verification",
                ]),
                phaseDurations: [
                    1500,
                    5000,
                    3000,
                    15_000,
                    20_000,
                    4000,
                    5000,
                    2000,
                    8000,
                    3000,
                ],
                successRate: 0.9,
                backupEnabled: true,
                rollbackSupported: true,
            },
        ];

        for (let i = 0; i < 200; i++) {
            const scenario =
                installationScenarios[
                    Math.floor(Math.random() * installationScenarios.length)
                ];

            const installId = `install-${i}`;
            let currentTime = Date.now();
            let overallSuccess = true;

            for (
                let phaseIndex = 0;
                phaseIndex < scenario.phases.length;
                phaseIndex++
            ) {
                const phase = scenario.phases[phaseIndex];
                const phaseDuration = scenario.phaseDurations[phaseIndex];
                const phaseStartTime = currentTime;

                // Simulate phase progress
                for (let progressStep = 0; progressStep <= 10; progressStep++) {
                    const phaseProgress = progressStep / 10;
                    const overallProgress =
                        (phaseIndex + phaseProgress) / scenario.phases.length;
                    const stepTime =
                        phaseStartTime + phaseDuration * phaseProgress;

                    // Estimate remaining time
                    const completedPhases = phaseIndex;
                    const remainingPhases =
                        scenario.phases.length - phaseIndex - 1;
                    const remainingPhaseDuration = scenario.phaseDurations
                        .slice(phaseIndex + 1)
                        .reduce((sum, duration) => sum + duration, 0);
                    const currentPhaseRemaining =
                        phaseDuration * (1 - phaseProgress);
                    const estimatedTimeRemaining =
                        currentPhaseRemaining + remainingPhaseDuration;

                    // Simulate phase failures (rare)
                    const phaseSuccess =
                        Math.random() < scenario.successRate ||
                        phaseIndex === 0; // First phase always succeeds
                    if (!phaseSuccess && progressStep === 5) {
                        // Fail mid-phase
                        overallSuccess = false;
                    }

                    const installationProgress: InstallationProgress = {
                        installId,
                        phase,
                        startTime: phaseStartTime,
                        currentTime: stepTime,
                        progress: overallProgress,
                        estimatedTimeRemaining,
                        backupCreated:
                            scenario.backupEnabled && phaseIndex >= 1,
                        rollbackAvailable:
                            scenario.rollbackSupported &&
                            scenario.backupEnabled &&
                            phaseIndex >= 1,
                        error:
                            !phaseSuccess && progressStep === 5
                                ? `Installation failed during ${phase}`
                                : undefined,
                    };

                    installationProgresses.push(installationProgress);

                    if (!phaseSuccess && progressStep === 5) {
                        break; // Stop installation on failure
                    }
                }

                if (!overallSuccess) {
                    break; // Stop processing phases on failure
                }

                currentTime += phaseDuration;
            }
        }

        // Calculate installation metrics
        const installationGroups = installationProgresses.reduce(
            (groups, progress) => {
                if (!groups[progress.installId]) {
                    groups[progress.installId] = [];
                }
                groups[progress.installId].push(progress);
                return groups;
            },
            {} as Record<string, InstallationProgress[]>
        );

        const installationStats = Object.values(installationGroups).map(
            (progressList) => {
                const lastProgress = progressList.at(-1);
                const success =
                    !lastProgress.error && lastProgress.progress >= 0.95;
                const totalDuration =
                    lastProgress.currentTime - progressList[0].startTime;
                const phases = [...new Set(progressList.map((p) => p.phase))];

                return {
                    installId: lastProgress.installId,
                    success,
                    totalDuration,
                    phases: phases.length,
                    backupCreated: lastProgress.backupCreated,
                    rollbackAvailable: lastProgress.rollbackAvailable,
                    finalProgress: lastProgress.progress,
                    error: lastProgress.error,
                };
            }
        );

        const successfulInstallations = installationStats.filter(
            (s) => s.success
        );
        const averageInstallationTime =
            installationStats.reduce((sum, s) => sum + s.totalDuration, 0) /
            installationStats.length;
        const installationSuccessRate =
            successfulInstallations.length / installationStats.length;
        const backupUsageRate =
            installationStats.filter((s) => s.backupCreated).length /
            installationStats.length;
    });

    // Rollback and recovery simulation
    bench("rollback recovery simulation", () => {
        interface RollbackOperation {
            rollbackId: string;
            trigger: string;
            startTime: number;
            endTime: number;
            success: boolean;
            filesRestored: number;
            configRestored: boolean;
            dataIntact: boolean;
            rollbackDuration: number;
            error?: string;
        }

        const rollbackOperations: RollbackOperation[] = [];

        const rollbackTriggers = [
            {
                name: "installation-failure",
                probability: 0.4,
                complexity: "medium",
            },
            { name: "startup-failure", probability: 0.3, complexity: "high" },
            { name: "user-request", probability: 0.2, complexity: "low" },
            {
                name: "corruption-detected",
                probability: 0.1,
                complexity: "high",
            },
        ];

        for (let i = 0; i < 150; i++) {
            // Determine rollback trigger
            const rand = Math.random();
            let cumulativeProbability = 0;
            let selectedTrigger = rollbackTriggers[0];

            for (const trigger of rollbackTriggers) {
                cumulativeProbability += trigger.probability;
                if (rand <= cumulativeProbability) {
                    selectedTrigger = trigger;
                    break;
                }
            }

            const startTime = Date.now();

            // Simulate rollback complexity based on trigger
            let baseDuration: number;
            let successRate: number;
            let filesRestored: number;

            switch (selectedTrigger.complexity) {
                case "low": {
                    baseDuration = 5000; // 5 seconds
                    successRate = 0.99;
                    filesRestored = Math.floor(Math.random() * 50) + 10;
                    break;
                }
                case "medium": {
                    baseDuration = 15_000; // 15 seconds
                    successRate = 0.95;
                    filesRestored = Math.floor(Math.random() * 200) + 50;
                    break;
                }
                case "high": {
                    baseDuration = 45_000; // 45 seconds
                    successRate = 0.9;
                    filesRestored = Math.floor(Math.random() * 500) + 100;
                    break;
                }
                default: {
                    baseDuration = 10_000;
                    successRate = 0.95;
                    filesRestored = 100;
                }
            }

            // Add variance to duration
            const variance = (Math.random() - 0.5) * 0.4;
            const rollbackDuration = Math.max(
                1000,
                baseDuration * (1 + variance)
            );
            const endTime = startTime + rollbackDuration;

            // Determine operation success
            const success = Math.random() < successRate;
            const configRestored = success && Math.random() > 0.05; // 95% config restoration rate
            const dataIntact = success && Math.random() > 0.02; // 98% data integrity rate

            let error: string | undefined;
            if (!success) {
                const errors = [
                    "Backup files corrupted",
                    "Insufficient disk space for rollback",
                    "File system locked by another process",
                    "Registry restoration failed",
                    "Permission denied during file restoration",
                ];
                error = errors[Math.floor(Math.random() * errors.length)];
            }

            const rollbackOperation: RollbackOperation = {
                rollbackId: `rollback-${i}`,
                trigger: selectedTrigger.name,
                startTime,
                endTime,
                success,
                filesRestored: success ? filesRestored : 0,
                configRestored,
                dataIntact,
                rollbackDuration,
                error,
            };

            rollbackOperations.push(rollbackOperation);
        }

        // Calculate rollback metrics
        const successfulRollbacks = rollbackOperations.filter((r) => r.success);
        const averageRollbackTime =
            rollbackOperations.reduce((sum, r) => sum + r.rollbackDuration, 0) /
            rollbackOperations.length;
        const rollbackSuccessRate =
            successfulRollbacks.length / rollbackOperations.length;
        const dataIntegrityRate =
            rollbackOperations.filter((r) => r.dataIntact).length /
            rollbackOperations.length;

        // Trigger-specific analysis
        const triggerStats = rollbackTriggers.map((trigger) => {
            const triggerOps = rollbackOperations.filter(
                (r) => r.trigger === trigger.name
            );
            const successfulTriggerOps = triggerOps.filter((r) => r.success);

            return {
                trigger: trigger.name,
                operations: triggerOps.length,
                successRate:
                    triggerOps.length > 0
                        ? successfulTriggerOps.length / triggerOps.length
                        : 0,
                averageDuration:
                    triggerOps.length > 0
                        ? triggerOps.reduce(
                              (sum, r) => sum + r.rollbackDuration,
                              0
                          ) / triggerOps.length
                        : 0,
                averageFilesRestored:
                    successfulTriggerOps.length > 0
                        ? successfulTriggerOps.reduce(
                              (sum, r) => sum + r.filesRestored,
                              0
                          ) / successfulTriggerOps.length
                        : 0,
            };
        });
    });

    // Auto-update scheduling and coordination
    bench("auto-update coordination simulation", () => {
        interface UpdateSchedule {
            scheduleId: string;
            updateChannel: string;
            checkInterval: number;
            installationWindow: { start: number; end: number };
            retryPolicy: { maxRetries: number; backoffMultiplier: number };
            userInteractionRequired: boolean;
            forceInstall: boolean;
        }

        interface ScheduledUpdate {
            updateId: string;
            scheduleId: string;
            plannedTime: number;
            actualStartTime: number;
            actualEndTime: number;
            phase: string;
            success: boolean;
            userApproved: boolean;
            retryCount: number;
            skippedReason?: string;
        }

        const updateSchedules: UpdateSchedule[] = [
            {
                scheduleId: "daily-stable",
                updateChannel: "stable",
                checkInterval: 86_400_000, // 24 hours
                installationWindow: { start: 2, end: 6 }, // 2 AM - 6 AM
                retryPolicy: { maxRetries: 3, backoffMultiplier: 2 },
                userInteractionRequired: true,
                forceInstall: false,
            },
            {
                scheduleId: "weekly-beta",
                updateChannel: "beta",
                checkInterval: 604_800_000, // 7 days
                installationWindow: { start: 1, end: 5 }, // 1 AM - 5 AM
                retryPolicy: { maxRetries: 2, backoffMultiplier: 1.5 },
                userInteractionRequired: false,
                forceInstall: false,
            },
            {
                scheduleId: "critical-immediate",
                updateChannel: "stable",
                checkInterval: 3_600_000, // 1 hour
                installationWindow: { start: 0, end: 24 }, // Any time
                retryPolicy: { maxRetries: 5, backoffMultiplier: 1.2 },
                userInteractionRequired: false,
                forceInstall: true,
            },
        ];

        const scheduledUpdates: ScheduledUpdate[] = [];

        for (let i = 0; i < 300; i++) {
            const schedule =
                updateSchedules[
                    Math.floor(Math.random() * updateSchedules.length)
                ];

            // Generate scheduled update time
            const baseTime = Date.now() + Math.random() * 86_400_000 * 7; // Within next week
            const windowStart = new Date(baseTime);
            windowStart.setHours(schedule.installationWindow.start, 0, 0, 0);
            const windowEnd = new Date(baseTime);
            windowEnd.setHours(schedule.installationWindow.end, 0, 0, 0);

            const plannedTime =
                windowStart.getTime() +
                Math.random() * (windowEnd.getTime() - windowStart.getTime());

            // Simulate actual execution
            let actualStartTime = plannedTime;
            let skippedReason: string | undefined;
            let userApproved = true;

            // Check if user interaction affects timing
            if (schedule.userInteractionRequired) {
                userApproved = Math.random() > 0.2; // 80% user approval rate
                if (!userApproved && !schedule.forceInstall) {
                    skippedReason = "User declined update";
                }
            }

            // Check for system conditions that might delay update
            if (!skippedReason) {
                const systemBusy = Math.random() < 0.1; // 10% chance system is busy
                const networkIssue = Math.random() < 0.05; // 5% chance of network issues

                if (systemBusy) {
                    actualStartTime += Math.random() * 3_600_000; // Delay up to 1 hour
                }

                if (networkIssue) {
                    skippedReason = "Network connectivity issues";
                }
            }

            // Simulate update execution if not skipped
            let actualEndTime = actualStartTime;
            let success = false;
            let retryCount = 0;
            let phase = "skipped";

            if (!skippedReason) {
                const phases = [
                    "check",
                    "download",
                    "verify",
                    "install",
                ];
                let currentPhase = 0;

                for (
                    let attempt = 0;
                    attempt <= schedule.retryPolicy.maxRetries;
                    attempt++
                ) {
                    retryCount = attempt;

                    // Simulate phase execution
                    for (
                        let phaseIndex = currentPhase;
                        phaseIndex < phases.length;
                        phaseIndex++
                    ) {
                        phase = phases[phaseIndex];

                        let phaseDuration: number;
                        let phaseSuccessRate: number;

                        switch (phase) {
                            case "check": {
                                phaseDuration = Math.random() * 5000 + 1000; // 1-6 seconds
                                phaseSuccessRate = 0.98;
                                break;
                            }
                            case "download": {
                                phaseDuration =
                                    Math.random() * 120_000 + 30_000; // 30s-2.5min
                                phaseSuccessRate = 0.92;
                                break;
                            }
                            case "verify": {
                                phaseDuration = Math.random() * 10_000 + 2000; // 2-12 seconds
                                phaseSuccessRate = 0.99;
                                break;
                            }
                            case "install": {
                                phaseDuration = Math.random() * 60_000 + 20_000; // 20s-1.3min
                                phaseSuccessRate = 0.95;
                                break;
                            }
                            default: {
                                phaseDuration = 5000;
                                phaseSuccessRate = 0.95;
                            }
                        }

                        actualEndTime += phaseDuration;

                        const phaseSuccess = Math.random() < phaseSuccessRate;
                        if (!phaseSuccess) {
                            currentPhase = phaseIndex; // Resume from this phase on retry
                            break;
                        }

                        if (phaseIndex === phases.length - 1) {
                            success = true;
                        }
                    }

                    if (success) {
                        break; // No need to retry
                    }

                    // Apply retry backoff
                    if (attempt < schedule.retryPolicy.maxRetries) {
                        const backoffDelay =
                            schedule.retryPolicy.backoffMultiplier ** attempt *
                            300_000; // Base 5 minutes
                        actualEndTime += backoffDelay;
                    }
                }
            }

            const scheduledUpdate: ScheduledUpdate = {
                updateId: `scheduled-${i}`,
                scheduleId: schedule.scheduleId,
                plannedTime,
                actualStartTime,
                actualEndTime,
                phase,
                success,
                userApproved,
                retryCount,
                skippedReason,
            };

            scheduledUpdates.push(scheduledUpdate);
        }

        // Calculate coordination metrics
        const completedUpdates = scheduledUpdates.filter(
            (u) => !u.skippedReason
        );
        const successfulUpdates = completedUpdates.filter((u) => u.success);
        const skippedUpdates = scheduledUpdates.filter((u) => u.skippedReason);

        const averageExecutionTime =
            completedUpdates.length > 0
                ? completedUpdates.reduce(
                      (sum, u) => sum + (u.actualEndTime - u.actualStartTime),
                      0
                  ) / completedUpdates.length
                : 0;

        const userApprovalRate =
            scheduledUpdates.filter((u) => u.userApproved).length /
            scheduledUpdates.length;
        const retryRate =
            completedUpdates.filter((u) => u.retryCount > 0).length /
            completedUpdates.length;

        // Schedule-specific analysis
        const scheduleStats = updateSchedules.map((schedule) => {
            const scheduleUpdates = scheduledUpdates.filter(
                (u) => u.scheduleId === schedule.scheduleId
            );
            const scheduleCompleted = scheduleUpdates.filter(
                (u) => !u.skippedReason
            );
            const scheduleSuccessful = scheduleUpdates.filter((u) => u.success);

            return {
                scheduleId: schedule.scheduleId,
                totalUpdates: scheduleUpdates.length,
                completed: scheduleCompleted.length,
                successful: scheduleSuccessful.length,
                skipped: scheduleUpdates.filter((u) => u.skippedReason).length,
                successRate:
                    scheduleCompleted.length > 0
                        ? scheduleSuccessful.length / scheduleCompleted.length
                        : 0,
                averageRetries:
                    scheduleCompleted.length > 0
                        ? scheduleCompleted.reduce(
                              (sum, u) => sum + u.retryCount,
                              0
                          ) / scheduleCompleted.length
                        : 0,
            };
        });
    });
});
