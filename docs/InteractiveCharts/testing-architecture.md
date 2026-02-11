---
schema: "../../config/schemas/doc-frontmatter.schema.json"
doc_title: "Testing Architecture & Quality Gates"
summary: "Diagrams mapping the Vitest, Storybook, fast-check, fuzzing, and Playwright quality gate pipelines."
created: "2026-02-10"
last_reviewed: "2026-02-10"
doc_category: "guide"
author: "Nick2bad4u"
tags:
 - "uptime-watcher"
 - "testing"
 - "vitest"
 - "playwright"
 - "fast-check"
 - "storybook"
 - "mermaid"
slug: "/testing-architecture"
sidebar_label: "🧪 Testing Architecture"
---

# Testing Architecture & Quality Gates

This document maps every automated test surface in Uptime Watcher—unit, integration, property-based, fuzzing, Storybook component and runner suites, and Playwright E2E—in one place.

Each diagram references the actual configs and directories so contributors can trace where data flows and how coverage gates are enforced.

## Test Suite Topology

```mermaid
graph TD
    subgraph CLI["npm scripts (package.json)"]
      testAll["npm run test:all\n(renderer + storybook + story runner)"]
      testAllCoverage["npm run test:all:coverage\n(renderer + electron + shared + storybook + story runner)"]
      testAllDetailed["npm run test:all:detailed"]
      testPlaywright["npm run test:playwright (alias test:e2e)"]
      fuzz["npm run fuzz"]
    end

    subgraph VitestFront["Vitest Frontend\n(vitest.config.ts)"]
      FrontDir["src/test/**/*.*"]
      FrontSetup["src/test/setup.ts\n& src/test/dom-setup.ts"]
      FrontEnv["JSDOM + @testing-library/jest-dom"]
    end

    subgraph VitestElectron["Vitest Electron\n(vitest.electron.config.ts)"]
      ElectronDir["electron/test/**/*.*"]
      ElectronSetup["electron/test/setup.ts\n(mocked electron, fc.configureGlobal)"]
      ElectronEnv["Node environment\n+ threads pool"]
    end

    subgraph VitestShared["Vitest Shared\n(vitest.shared.config.ts)"]
      SharedDir["shared/test/**/*.*"]
      SharedSetup["shared/test/setup.ts"]
      SharedFc["@fast-check/vitest\nnumRuns=10, verbose=2"]
    end

    subgraph VitestStorybook["Vitest Storybook\n(vitest.storybook.config.ts)"]
      StorybookDir["storybook stories\nvia @storybook/addon-vitest"]
      StorybookPlugins["storybookTest plugin\n+ React compiler"]
    end

    subgraph StorybookRunner["Storybook Runner\n(scripts/run-storybook-tests.mjs)"]
      RunnerSuites["Playwright-driven story runner"]
    end

    subgraph Playwright["Playwright E2E & UI\n(playwright.config.ts)"]
      GlobalSetup["global-setup.ts\nbuild:electron-main + HEADLESS"]
      GlobalTeardown["global-teardown.ts\nkill lingering electron"]
      ElectronHelpers["fixtures/electron-helpers.ts\nlaunchElectronApp"]
      PWTests["playwright/tests/**/*.playwright.test.ts"]
    end

    subgraph Typecheck["TS type-check configs\n(config/testing)"]
      tsFrontend["tsconfig.test.json"]
      tsElectron["tsconfig.electron.test.json"]
      tsShared["tsconfig.shared.test.json"]
      tsPlaywright["playwright/tsconfig.json"]
    end

    testAll -->|runs| VitestFront
    testAll -->|runs| VitestStorybook
    testAll -->|runs| StorybookRunner

    testAllCoverage -->|collects| VitestFront
    testAllCoverage -->|collects| VitestElectron
    testAllCoverage -->|collects| VitestShared
    testAllCoverage -->|collects| VitestStorybook
    testAllCoverage -->|collects| StorybookRunner

    testAllDetailed -->|verbose reports| VitestFront
    testAllDetailed -->|verbose reports| VitestElectron
    testAllDetailed -->|verbose reports| VitestShared
    testAllDetailed -->|verbose reports| VitestStorybook
    testAllDetailed -->|verbose reports| StorybookRunner

    testPlaywright --> Playwright
    fuzz --> SharedDir

    VitestFront --> FrontDir
    VitestFront --> FrontSetup
    VitestFront --> FrontEnv

    VitestElectron --> ElectronDir
    VitestElectron --> ElectronSetup
    VitestElectron --> ElectronEnv

    VitestShared --> SharedDir
    VitestShared --> SharedSetup
    VitestShared --> SharedFc

    VitestStorybook --> StorybookDir
    VitestStorybook --> StorybookPlugins

    StorybookRunner --> RunnerSuites

    Playwright --> GlobalSetup
    Playwright --> PWTests
    Playwright --> ElectronHelpers
    Playwright --> GlobalTeardown

    TsDeps["npm run check:frontend:test"] --> tsFrontend
    TsDeps2["npm run check:electron:test"] --> tsElectron
    TsDeps3["npm run check:shared:test"] --> tsShared
    TsDeps4["npm run check:playwright"] --> tsPlaywright

    classDef cli fill:#0ea5e9,stroke:#0369a1,color:#ffffff
    classDef vitest fill:#312e81,stroke:#1e1b4b,color:#ffffff
    classDef setup fill:#1f2937,stroke:#111827,color:#f1f5f9
    classDef type fill:#15803d,stroke:#166534,color:#f0fdf4

    class testAll,testAllCoverage,testAllDetailed,testPlaywright,fuzz cli
    class VitestFront,VitestElectron,VitestShared,VitestStorybook,StorybookRunner,Playwright vitest
    class FrontDir,FrontSetup,FrontEnv setup
    class ElectronDir,ElectronSetup,ElectronEnv setup
    class SharedDir,SharedSetup,SharedFc setup
    class StorybookDir,StorybookPlugins setup
    class RunnerSuites setup
    class GlobalSetup,GlobalTeardown,ElectronHelpers,PWTests setup
    class tsFrontend,tsElectron,tsShared,tsPlaywright,TsDeps,TsDeps2,TsDeps3,TsDeps4 type
```

## Property & Fuzz Validation Pipelines

Shared and Electron tests use `@fast-check/vitest` to hammer the Zod schemas, monitor factories, and error-handling routines.

```mermaid
flowchart LR
    Arbitraries["Custom fast-check arbitraries\n(shared/test/schemas.property.test.ts)"] -->|generate Site & Monitor payloads| Validators["Zod schemas\nshared/validation/schemas.ts"]
    Validators -->|validated objects| Sanitizers["validateSiteData / validateMonitorData"]
    Sanitizers -->|round-trip clones| Invariants["Assertions: status enum, intervals, history shape"]
    Invariants -->|feed| DerivedStats["useSiteStats & monitor math\n(src/hooks/site/useSiteStats.ts)"]

    subgraph Fuzzing["Fuzz harnesses"]
        ErrorFuzz["errorHandling.fuzz.test.ts"]
        SiteStatusFuzz["siteStatus.fuzz.test.ts"]
        ConversionFuzz["safeConversions.fuzz.test.ts"]
    end

    Fuzzing -->|mutate inputs| CoreUtils["@shared/utils/**"]
    CoreUtils -->|surface| LoggerGuards["ensureError / withErrorHandling\nproduces console + logger fallbacks"]

    subgraph ElectronShared["Electron property suites"]
        EnhancedCheckerProp["EnhancedMonitorChecker.comprehensive.test.ts"]
        MonitorRegistryProp["MonitorTypeRegistry.test.ts"]
    end

    ElectronShared -->|mocked electron bridges| ElectronMocks["vi.mock('electron')\n in electron/test/setup.ts"]
    ElectronMocks -->|emit| EventBusChecks["TypedEventBus invariants\n(electron/test/events/*)"]

    classDef stage fill:#2563eb,stroke:#1d4ed8,color:#f8fafc
    classDef fuzz fill:#9333ea,stroke:#6b21a8,color:#f3e8ff
    classDef util fill:#15803d,stroke:#166534,color:#f0fdf4

    class Arbitraries stage
    class ErrorFuzz,SiteStatusFuzz,ConversionFuzz fuzz
    class Validators,Sanitizers,Invariants,DerivedStats,CoreUtils,LoggerGuards,EnhancedCheckerProp,MonitorRegistryProp,ElectronMocks,EventBusChecks util
```

## Playwright & Electron End-to-End Flow

Playwright projects exercise the packaged Electron app.

```mermaid
sequenceDiagram
    autonumber
    participant CLI as npm run test:e2e
    participant PW as Playwright Runner
    participant Setup as global-setup.ts
    participant Build as npm run build:electron-main
    participant Fixture as launchElectronApp()
    participant App as ElectronApplication
    participant Test as *.playwright.test.ts
    participant Report as Reports & Artifacts

    CLI->>PW: invoke playwright test
    PW->>Setup: execute globalSetup()
    Setup->>Build: exec npm run build:electron-main
    Build-->>Setup: dist/main.js ready
    Setup->>Fixture: preload HEADLESS env
    PW->>Fixture: beforeEach launchElectronApp()
    Fixture->>App: _electron.launch({ args: ['.', '--test-mode'] })
    App-->>Fixture: ElectronApplication handle
    Fixture-->>Test: expose handles (windows, mainProcess)
    Test->>App: orchestrate UI (selectors, IPC via preload)
    Test->>Report: capture screenshot/video on failure
    PW->>Report: write trace.zip + results.json/xml
    PW->>globalTeardown: kill residual electron
    globalTeardown-->>PW: cleanup complete

    Note over Fixture,App: HEADLESS=true ensures WindowService skips show()
    Note over Test,Report: Traces stored in playwright/test-results + html-report
```
