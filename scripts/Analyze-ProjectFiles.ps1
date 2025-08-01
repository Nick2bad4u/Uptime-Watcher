# Project File Analyzer - Displays file statistics for src/ and electron/ directories
# Features:
# - Analyzes file sizes and line counts for TypeScript, JavaScript, and related files
# - Excludes test files by default (use -IncludeTests to include them)
# - Provides detailed breakdown by file type and directory
# - Shows top files by size with color-coded output
# Author: GitHub Copilot Assistant
# Date: $(Get-Date -Format "yyyy-MM-dd")

param(
    [string]$ProjectPath = ".",
    [switch]$ShowDetails = $false,
    [switch]$IncludeTests = $false
)

# Color scheme
$Colors = @{
    Header = "Cyan"
    FolderName = "Yellow"
    TableHeader = "Green"
    FileType = "Magenta"
    Size = "Blue"
    Lines = "Red"
    Border = "DarkGray"
    Summary = "White"
}

function Get-LineCount {
    param([string]$FilePath)

    try {
        $content = Get-Content $FilePath -ErrorAction SilentlyContinue
        if ($content) {
            return $content.Count
        }
        return 0
    }
    catch {
        return 0
    }
}

function Format-FileSize {
    param([long]$Bytes)

    if ($Bytes -ge 1MB) {
        return "{0:N2} MB" -f ($Bytes / 1MB)
    }
    elseif ($Bytes -ge 1KB) {
        return "{0:N2} KB" -f ($Bytes / 1KB)
    }
    else {
        return "$Bytes B"
    }
}

function Show-FolderAnalysis {
    param(
        [string]$FolderPath,
        [string]$FolderName
    )

    if (-not (Test-Path $FolderPath)) {
        Write-Output "⚠️  Folder '$FolderName' not found at: $FolderPath" -ForegroundColor Yellow
        return
    }

    # Get all files recursively
    $files = Get-ChildItem -Path $FolderPath -File -Recurse | Where-Object {
        $_.Extension -match '\.(ts|tsx|js|jsx|json|md|css|scss|html|yml|yaml|toml)$'
    }

    # Filter out test files unless -IncludeTests is specified
    if (-not $IncludeTests) {
        $files = $files | Where-Object {
            $_.Name -notmatch '\.(test|spec)\.' -and
            $_.Directory.Name -notmatch '^(test|tests|__tests__|spec|specs)$' -and
            $_.FullName -notmatch '[\\/](test|tests|__tests__|spec|specs)[\\/]' -and
            $_.Name -notmatch '^(test|spec)\.' -and
            $_.Name -notmatch '\.(test|spec)$'
        }
    }

    if ($files.Count -eq 0) {
        Write-Output "📁 No relevant files found in $FolderName" -ForegroundColor Yellow
        return
    }

    # Calculate file statistics
    $fileStats = $files | ForEach-Object {
        $lineCount = Get-LineCount $_.FullName
        [PSCustomObject]@{
            Name = $_.Name
            RelativePath = $_.FullName.Replace($FolderPath, "").TrimStart('\', '/')
            Extension = $_.Extension
            SizeBytes = $_.Length
            SizeFormatted = Format-FileSize $_.Length
            Lines = $lineCount
            Directory = $_.Directory.Name
        }
    }

    # Sort by size (descending)
    $sortedFiles = $fileStats | Sort-Object SizeBytes -Descending

    # Display header
    Write-Output ""
    Write-Output "═══════════════════════════════════════════════════════════════════" -ForegroundColor $Colors.Border
    $testStatus = if ($IncludeTests) { "🧪 Including test files" } else { "🚫 Excluding test files" }
    Write-Output "📂 $FolderName Directory Analysis ($testStatus)" -ForegroundColor $Colors.FolderName
    Write-Output "═══════════════════════════════════════════════════════════════════" -ForegroundColor $Colors.Border

    # Summary statistics
    $totalFiles = $files.Count
    $totalSize = ($fileStats | Measure-Object SizeBytes -Sum).Sum
    $totalLines = ($fileStats | Measure-Object Lines -Sum).Sum
    $avgSize = if ($totalFiles -gt 0) { $totalSize / $totalFiles } else { 0 }
    $avgLines = if ($totalFiles -gt 0) { $totalLines / $totalFiles } else { 0 }

    Write-Output "📊 Summary: " -ForegroundColor $Colors.Summary -NoNewline
    Write-Output "$totalFiles files" -ForegroundColor $Colors.FileType -NoNewline
    Write-Output " | " -ForegroundColor $Colors.Border -NoNewline
    Write-Output "$(Format-FileSize $totalSize)" -ForegroundColor $Colors.Size -NoNewline
    Write-Output " | " -ForegroundColor $Colors.Border -NoNewline
    Write-Output "$totalLines lines" -ForegroundColor $Colors.Lines
    Write-Output "📈 Averages: " -ForegroundColor $Colors.Summary -NoNewline
    Write-Output "$(Format-FileSize $avgSize) per file" -ForegroundColor $Colors.Size -NoNewline
    Write-Output " | " -ForegroundColor $Colors.Border -NoNewline
    Write-Output "$([math]::Round($avgLines)) lines per file" -ForegroundColor $Colors.Lines
    Write-Output ""

    # Table header
    $headerFormat = "{0,-30} {1,-8} {2,10} {3,8} {4,-15}"
    Write-Output ($headerFormat -f "File Name", "Type", "Size", "Lines", "Directory") -ForegroundColor $Colors.TableHeader
    Write-Output ("-" * 80) -ForegroundColor $Colors.Border

    # Display top files
    $topFiles = $sortedFiles | Select-Object -First 20
    foreach ($file in $topFiles) {
        $nameColor = switch ($file.Extension) {
            { $_ -in '.ts', '.tsx' } { "Blue" }
            { $_ -in '.js', '.jsx' } { "Yellow" }
            '.json' { "Green" }
            '.md' { "Cyan" }
            { $_ -in '.css', '.scss' } { "Magenta" }
            default { "White" }
        }

        $truncatedName = if ($file.Name.Length -gt 28) {
            $file.Name.Substring(0, 25) + "..."
        } else {
            $file.Name
        }

        Write-Output ($headerFormat -f
            $truncatedName,
            $file.Extension,
            $file.SizeFormatted,
            $file.Lines,
            $file.Directory
        ) -ForegroundColor $nameColor
    }

    if ($sortedFiles.Count -gt 20) {
        Write-Output ""
        Write-Output "... and $($sortedFiles.Count - 20) more files" -ForegroundColor $Colors.Border
    }

    # File type breakdown
    Write-Output ""
    Write-Output "📋 File Type Breakdown:" -ForegroundColor $Colors.Summary
    $typeStats = $fileStats | Group-Object Extension | Sort-Object Count -Descending
    foreach ($type in $typeStats) {
        $typeSize = ($type.Group | Measure-Object SizeBytes -Sum).Sum
        $typeLines = ($type.Group | Measure-Object Lines -Sum).Sum
        Write-Output "   $($type.Name): " -ForegroundColor $Colors.FileType -NoNewline
        Write-Output "$($type.Count) files" -ForegroundColor White -NoNewline
        Write-Output " | " -ForegroundColor $Colors.Border -NoNewline
        Write-Output "$(Format-FileSize $typeSize)" -ForegroundColor $Colors.Size -NoNewline
        Write-Output " | " -ForegroundColor $Colors.Border -NoNewline
        Write-Output "$typeLines lines" -ForegroundColor $Colors.Lines
    }
}

# Main script execution
Clear-Host
Write-Output ""
Write-Output "🚀 PROJECT FILE ANALYZER" -ForegroundColor $Colors.Header
Write-Output "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $Colors.Header
Write-Output "📍 Analyzing: $(Resolve-Path $ProjectPath)" -ForegroundColor $Colors.Summary
Write-Output ""

# Analyze src folder
$srcPath = Join-Path $ProjectPath "src"
Show-FolderAnalysis -FolderPath $srcPath -FolderName "src"

# Analyze electron folder
$electronPath = Join-Path $ProjectPath "electron"
Show-FolderAnalysis -FolderPath $electronPath -FolderName "electron"

# Overall project summary
Write-Output ""
Write-Output "═══════════════════════════════════════════════════════════════════" -ForegroundColor $Colors.Border
Write-Output "🎯 PROJECT TOTALS" -ForegroundColor $Colors.Header
Write-Output "═══════════════════════════════════════════════════════════════════" -ForegroundColor $Colors.Border

# Get all files with proper filtering
$allSrcFiles = if (Test-Path $srcPath) {
    $srcFiles = Get-ChildItem -Path $srcPath -File -Recurse | Where-Object {
        $_.Extension -match '\.(ts|tsx|js|jsx|json|md|css|scss|html|yml|yaml|toml)$'
    }
    if (-not $IncludeTests) {
        $srcFiles = $srcFiles | Where-Object {
            $_.Name -notmatch '\.(test|spec)\.' -and
            $_.Directory.Name -notmatch '^(test|tests|__tests__|spec|specs)$' -and
            $_.FullName -notmatch '[\\/](test|tests|__tests__|spec|specs)[\\/]' -and
            $_.Name -notmatch '^(test|spec)\.' -and
            $_.Name -notmatch '\.(test|spec)$'
        }
    }
    $srcFiles
} else { @() }

$allElectronFiles = if (Test-Path $electronPath) {
    $electronFiles = Get-ChildItem -Path $electronPath -File -Recurse | Where-Object {
        $_.Extension -match '\.(ts|tsx|js|jsx|json|md|css|scss|html|yml|yaml|toml)$'
    }
    if (-not $IncludeTests) {
        $electronFiles = $electronFiles | Where-Object {
            $_.Name -notmatch '\.(test|spec)\.' -and
            $_.Directory.Name -notmatch '^(test|tests|__tests__|spec|specs)$' -and
            $_.FullName -notmatch '[\\/](test|tests|__tests__|spec|specs)[\\/]' -and
            $_.Name -notmatch '^(test|spec)\.' -and
            $_.Name -notmatch '\.(test|spec)$'
        }
    }
    $electronFiles
} else { @() }

$allFiles = $allSrcFiles + $allElectronFiles

if ($allFiles.Count -gt 0) {
    $projectTotalSize = ($allFiles | Measure-Object Length -Sum).Sum
    $projectTotalLines = $allFiles | ForEach-Object { Get-LineCount $_.FullName } | Measure-Object -Sum | Select-Object -ExpandProperty Sum

    Write-Output "📦 Total Files: " -ForegroundColor $Colors.Summary -NoNewline
    Write-Output "$($allFiles.Count)" -ForegroundColor White
    Write-Output "💾 Total Size: " -ForegroundColor $Colors.Summary -NoNewline
    Write-Output "$(Format-FileSize $projectTotalSize)" -ForegroundColor $Colors.Size
    Write-Output "📄 Total Lines: " -ForegroundColor $Colors.Summary -NoNewline
    Write-Output "$projectTotalLines" -ForegroundColor $Colors.Lines
} else {
    Write-Output "No files found in either directory." -ForegroundColor Yellow
}

Write-Output ""
Write-Output "✅ Analysis complete!" -ForegroundColor Green
Write-Output ""

# Usage instructions
if ($ShowDetails) {
    Write-Output "💡 Usage Tips:" -ForegroundColor $Colors.Summary
    Write-Output "  • Run without parameters to analyze current directory" -ForegroundColor Gray
    Write-Output "  • Use -ProjectPath to specify different project directory" -ForegroundColor Gray
    Write-Output "  • Add -ShowDetails to see this help message" -ForegroundColor Gray
    Write-Output "  • Use -IncludeTests to include test files (excluded by default)" -ForegroundColor Gray
    Write-Output ""
    Write-Output "🔍 Test File Filtering:" -ForegroundColor $Colors.Summary
    Write-Output "  • By default, excludes files with .test. or .spec. patterns" -ForegroundColor Gray
    Write-Output "  • Excludes files in test/tests/__tests__/spec/specs directories" -ForegroundColor Gray
    Write-Output "  • Use -IncludeTests flag to include all files" -ForegroundColor Gray
    Write-Output ""
}
