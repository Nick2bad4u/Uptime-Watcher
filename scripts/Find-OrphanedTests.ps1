#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Finds test files that are outside the main test directories.

.DESCRIPTION
    Searches the entire repository for test files (*.test.ts, *.test.js, *.spec.ts, *.spec.js)
    that are located outside the main 3 test folders:
    - src/test/
    - electron/test/
    - shared/test/

.PARAMETER RootPath
    The root path to search from. Defaults to the current directory.

.PARAMETER OutputFormat
    Output format: 'Table', 'List', or 'Json'. Defaults to 'Table'.

.PARAMETER ExcludePaths
    Additional paths to exclude from the search (relative to root).

.EXAMPLE
    .\Find-OrphanedTests.ps1

    Finds all orphaned test files and displays them in a table format.

.EXAMPLE
    .\Find-OrphanedTests.ps1 -OutputFormat List

    Finds all orphaned test files and displays them as a list.

.EXAMPLE
    .\Find-OrphanedTests.ps1 -ShowOnlyProjectTests

    Shows only test files from your project (excludes node_modules completely).

.EXAMPLE
    .\Find-OrphanedTests.ps1 -OutputFormat Detailed -SkipNodeModules

    Shows detailed categorized output without node_modules clutter.

.NOTES
    Author: GitHub Copilot
    Created: 2025-01-19

    This script helps identify test files that may be misplaced or organized
    outside the standard test directory structure.
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [string]$RootPath = ".",

    [Parameter(Mandatory = $false)]
    [ValidateSet("Table", "List", "Json", "Detailed")]
    [string]$OutputFormat = "Detailed",

    [Parameter(Mandatory = $false)]
    [string[]]$ExcludePaths = @(),

    [Parameter(Mandatory = $false)]
    [switch]$SkipNodeModules,

    [Parameter(Mandatory = $false)]
    [switch]$ShowOnlyProjectTests
)

# Set error action preference
$ErrorActionPreference = "Stop"

# Define the main test directories (relative to root)
$MainTestDirs = @(
    "src/test",
    "electron/test",
    "shared/test",
    "playwright/tests"
)

# Define common test file patterns
$TestFilePatterns = @(
    "*.test.ts",
    "*.test.js",
    "*.test.tsx",
    "*.test.jsx",
    "*.spec.ts",
    "*.spec.js",
    "*.spec.tsx",
    "*.spec.jsx",
    "*.test.mts",
    "*.spec.mts",
    "*.playwright.ts",
    "*.playwright.js",
    "*.e2e.ts",
    "*.e2e.js",
    "*.cy.ts",
    "*.cy.js"
)

# Default directories to exclude from search
$DefaultExcludePaths = @(
    "node_modules",
    ".git",
    "dist",
    "coverage",
    ".nyc_output",
    "release",
    "build",
    ".vscode",
    "docs/docusaurus/node_modules",
    "docs/*/node_modules",
    ".cache",
    ".tmp",
    "temp",
    "out",
    "scripts/Find-OrphanedTests.ps1"
)

# Combine default and user-specified exclusions
$AllExcludePaths = $DefaultExcludePaths + $ExcludePaths

# Add node_modules exclusion if requested
if ($SkipNodeModules -or $ShowOnlyProjectTests) {
    $AllExcludePaths += @("**/node_modules/**", "*node_modules*")
}

function Write-Header {
    param([string]$Title)

    Write-Host ""
    Write-Host "=" * 60 -ForegroundColor Cyan
    Write-Host $Title -ForegroundColor Cyan
    Write-Host "=" * 60 -ForegroundColor Cyan
    Write-Host ""
}

function Get-RelativePath {
    param(
        [string]$Path,
        [string]$BasePath
    )

    try {
        $resolvedPath = Resolve-Path -Path $Path -Relative -RelativeBasePath $BasePath -ErrorAction SilentlyContinue
        return $resolvedPath -replace "^\.\\", ""
    }
    catch {
        return $Path
    }
}

function Find-TestFiles {
    param(
        [string]$SearchPath,
        [string[]]$Patterns,
        [string[]]$ExcludeDirs
    )

    $testFiles = @()

    foreach ($pattern in $Patterns) {
        try {
            $files = Get-ChildItem -Path $SearchPath -Filter $pattern -Recurse -File -ErrorAction SilentlyContinue

            foreach ($file in $files) {
                $relativePath = Get-RelativePath -Path $file.FullName -BasePath $SearchPath
                $shouldExclude = $false

                # Check if file is in an excluded directory
                foreach ($excludeDir in $ExcludeDirs) {
                    $normalizedExcludeDir = $excludeDir -replace "\\", "/"
                    $normalizedRelativePath = $relativePath -replace "\\", "/"

                    # Handle wildcard patterns and direct path matches
                    if ($normalizedExcludeDir.Contains("*")) {
                        if ($normalizedRelativePath -like $normalizedExcludeDir) {
                            $shouldExclude = $true
                            break
                        }
                    }
                    elseif ($normalizedRelativePath -like "$normalizedExcludeDir/*" -or
                            $normalizedRelativePath -eq $normalizedExcludeDir -or
                            $normalizedRelativePath.Contains("/node_modules/") -or
                            $normalizedRelativePath.Contains("\node_modules\")) {
                        $shouldExclude = $true
                        break
                    }
                }

                if (-not $shouldExclude) {
                    $testFiles += [PSCustomObject]@{
                        Name = $file.Name
                        Path = $relativePath
                        FullPath = $file.FullName
                        Size = $file.Length
                        LastModified = $file.LastWriteTime
                        Directory = $file.Directory.Name
                    }
                }
            }
        }
        catch {
            Write-Warning "Error searching for pattern '$pattern': $($_.Exception.Message)"
        }
    }

    return $testFiles
}

function Test-IsInMainTestDir {
    param(
        [string]$FilePath,
        [string[]]$MainDirs
    )

    foreach ($mainDir in $MainDirs) {
        $normalizedMainDir = $mainDir -replace "\\", "/"
        $normalizedFilePath = $FilePath -replace "\\", "/"

        if ($normalizedFilePath -like "$normalizedMainDir/*") {
            return $true
        }
    }

    return $false
}

# Main execution
try {
    Write-Header "Orphaned Test File Finder"

    # Resolve and validate root path
    $ResolvedRootPath = Resolve-Path -Path $RootPath -ErrorAction Stop
    Write-Host "Searching in: $ResolvedRootPath" -ForegroundColor Green
    Write-Host ""

    # Display main test directories
    Write-Host "Main test directories:" -ForegroundColor Yellow
    foreach ($dir in $MainTestDirs) {
        $fullDir = Join-Path $ResolvedRootPath $dir
        $exists = Test-Path $fullDir
        $status = if ($exists) { "✓" } else { "✗" }
        Write-Host "  $status $dir" -ForegroundColor $(if ($exists) { "Green" } else { "Red" })
    }
    Write-Host ""

    # Display excluded directories
    Write-Host "Excluded directories:" -ForegroundColor Yellow
    foreach ($excludeDir in $AllExcludePaths) {
        Write-Host "  - $excludeDir" -ForegroundColor Gray
    }
    Write-Host ""

    # Find all test files
    Write-Host "Searching for test files..." -ForegroundColor Yellow
    $allTestFiles = Find-TestFiles -SearchPath $ResolvedRootPath -Patterns $TestFilePatterns -ExcludeDirs $AllExcludePaths

    Write-Host "Found $($allTestFiles.Count) total test files" -ForegroundColor Green

    # Filter orphaned test files (not in main test directories)
    $orphanedTests = @()
    $projectOrphanedTests = @()
    $nodeModulesTests = @()

    foreach ($testFile in $allTestFiles) {
        if (-not (Test-IsInMainTestDir -FilePath $testFile.Path -MainDirs $MainTestDirs)) {
            $orphanedTests += $testFile

            # Categorize the orphaned tests
            if ($testFile.Path -match "node_modules" -or $testFile.Path -match "docs[\\/]docusaurus[\\/]") {
                $nodeModulesTests += $testFile
            }
            else {
                $projectOrphanedTests += $testFile
            }
        }
    }

    # Apply filter if ShowOnlyProjectTests is specified
    if ($ShowOnlyProjectTests) {
        $orphanedTests = $projectOrphanedTests
    }

    # Display results
    Write-Header "Results"

    if ($orphanedTests.Count -eq 0) {
        Write-Host "✓ No orphaned test files found! All tests are in the main test directories." -ForegroundColor Green
    }
    else {
        Write-Host "Found $($orphanedTests.Count) orphaned test file(s):" -ForegroundColor Red
        Write-Host ""

        switch ($OutputFormat) {
            "Table" {
                $orphanedTests | Format-Table -Property Name, Directory, Path -AutoSize
            }
            "List" {
                foreach ($test in $orphanedTests) {
                    Write-Host "• $($test.Path)" -ForegroundColor Yellow
                    Write-Host "  Size: $($test.Size) bytes, Modified: $($test.LastModified)" -ForegroundColor Gray
                }
            }
            "Json" {
                $orphanedTests | ConvertTo-Json -Depth 3
            }
            "Detailed" {
                if ($projectOrphanedTests.Count -gt 0) {
                    Write-Host "🔍 PROJECT TEST FILES (outside main test directories):" -ForegroundColor Yellow
                    Write-Host ""
                    $projectOrphanedTests | Format-Table -Property Name, Directory, Path -AutoSize
                    Write-Host ""
                }

                if ($nodeModulesTests.Count -gt 0 -and -not $ShowOnlyProjectTests) {
                    Write-Host "📦 NODE_MODULES TEST FILES:" -ForegroundColor Cyan
                    Write-Host "  (Found $($nodeModulesTests.Count) test files in dependencies)" -ForegroundColor Gray
                    if ($nodeModulesTests.Count -le 10) {
                        $nodeModulesTests | Format-Table -Property Name, Path -AutoSize
                    }
                    else {
                        Write-Host "  Use -OutputFormat Table to see all $($nodeModulesTests.Count) files" -ForegroundColor Gray
                    }
                    Write-Host ""
                }
            }
        }

        Write-Host ""
        Write-Host "Recommendations:" -ForegroundColor Cyan
        Write-Host "• Consider moving these files to appropriate test directories" -ForegroundColor White
        Write-Host "• Or add them to exclusions if they're intentionally placed" -ForegroundColor White
        Write-Host "• Verify these files are being run by your test suite" -ForegroundColor White
    }

    # Summary statistics
    Write-Host ""
    Write-Host "Summary:" -ForegroundColor Cyan
    Write-Host "  Total test files: $($allTestFiles.Count)" -ForegroundColor White
    Write-Host "  In main test dirs: $($allTestFiles.Count - $orphanedTests.Count - $nodeModulesTests.Count)" -ForegroundColor Green
    Write-Host "  Project orphaned: $($projectOrphanedTests.Count)" -ForegroundColor $(if ($projectOrphanedTests.Count -eq 0) { "Green" } else { "Yellow" })
    if (-not $ShowOnlyProjectTests) {
        Write-Host "  Node modules: $($nodeModulesTests.Count)" -ForegroundColor Cyan
        Write-Host "  Total orphaned: $($orphanedTests.Count)" -ForegroundColor $(if ($orphanedTests.Count -eq 0) { "Green" } else { "Red" })
    }

}
catch {
    Write-Error "Script execution failed: $($_.Exception.Message)"
    exit 1
}
