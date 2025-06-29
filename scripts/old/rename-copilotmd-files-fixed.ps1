# PowerShell script to rename all .copilotmd files to .md files in the docs folder
# Author: GitHub Copilot Assistant
# Date: June 29, 2025

param(
    [switch]$WhatIf = $false,  # Preview changes without executing
    [switch]$Verbose = $false  # Show detailed output
)

# Get the script directory (where this script is located)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$DocsPath = Join-Path $ScriptDir "docs"

# Verify docs folder exists
if (-not (Test-Path $DocsPath)) {
    Write-Error "Docs folder not found at: $DocsPath"
    exit 1
}

Write-Host "Searching for .copilotmd files in: $DocsPath" -ForegroundColor Cyan

# Find all .copilotmd files recursively in the docs folder
$CopilotMdFiles = Get-ChildItem -Path $DocsPath -Filter "*.copilotmd" -Recurse

if ($CopilotMdFiles.Count -eq 0) {
    Write-Host "No .copilotmd files found in the docs folder." -ForegroundColor Green
    exit 0
}

Write-Host "Found $($CopilotMdFiles.Count) .copilotmd file(s):" -ForegroundColor Yellow

# Display files to be renamed
foreach ($file in $CopilotMdFiles) {
    $RelativePath = $file.FullName.Replace($DocsPath, "docs")
    $NewName = $file.Name -replace '\.copilotmd$', '.md'
    $NewPath = Join-Path $file.Directory.FullName $NewName
    $RelativeNewPath = $NewPath.Replace($DocsPath, "docs")
    
    if ($WhatIf) {
        Write-Host "  WOULD RENAME: $RelativePath -> $RelativeNewPath" -ForegroundColor Magenta
    } else {
        Write-Host "  $RelativePath -> $RelativeNewPath" -ForegroundColor White
    }
}

if ($WhatIf) {
    Write-Host "`nThis was a preview. Run without -WhatIf to execute the renames." -ForegroundColor Yellow
    exit 0
}

# Confirm action unless in non-interactive mode
if ($Host.UI.RawUI.KeyAvailable -or $env:CI) {
    # Non-interactive or CI environment, skip confirmation
    $Proceed = $true
} else {
    Write-Host "`nProceed with renaming these files? (y/N): " -ForegroundColor Yellow -NoNewline
    $Response = Read-Host
    $Proceed = $Response -match '^[yY]([eE][sS])?$'
}

if (-not $Proceed) {
    Write-Host "Operation cancelled by user." -ForegroundColor Red
    exit 0
}

Write-Host "`nStarting rename operations..." -ForegroundColor Green

$SuccessCount = 0
$ErrorCount = 0

# Rename each file
foreach ($file in $CopilotMdFiles) {
    try {
        $NewName = $file.Name -replace '\.copilotmd$', '.md'
        $NewPath = Join-Path $file.Directory.FullName $NewName
        
        # Check if target file already exists
        if (Test-Path $NewPath) {
            Write-Warning "Target file already exists: $NewPath"
            Write-Host "   Skipping: $($file.Name)" -ForegroundColor Yellow
            continue
        }
        
        # Perform the rename
        Rename-Item -Path $file.FullName -NewName $NewName -ErrorAction Stop
        
        $RelativePath = $file.FullName.Replace($DocsPath, "docs")
        Write-Host "  Renamed: $($file.Name) -> $NewName" -ForegroundColor Green
        
        if ($Verbose) {
            Write-Host "     Full path: $RelativePath" -ForegroundColor Gray
        }
        
        $SuccessCount++
    }
    catch {
        Write-Error "Failed to rename $($file.Name): $($_.Exception.Message)"
        $ErrorCount++
    }
}

# Summary
Write-Host "`nSUMMARY:" -ForegroundColor Cyan
Write-Host "  Successfully renamed: $SuccessCount files" -ForegroundColor Green

if ($ErrorCount -gt 0) {
    Write-Host "  Errors encountered: $ErrorCount files" -ForegroundColor Red
} else {
    Write-Host "  All operations completed successfully!" -ForegroundColor Green
}

# List any remaining .copilotmd files
$RemainingFiles = Get-ChildItem -Path $DocsPath -Filter "*.copilotmd" -Recurse
if ($RemainingFiles.Count -gt 0) {
    Write-Host "`nRemaining .copilotmd files:" -ForegroundColor Yellow
    foreach ($file in $RemainingFiles) {
        $RelativePath = $file.FullName.Replace($DocsPath, "docs")
        Write-Host "    $RelativePath" -ForegroundColor Yellow
    }
} else {
    Write-Host "`nNo .copilotmd files remaining in docs folder!" -ForegroundColor Green
}
