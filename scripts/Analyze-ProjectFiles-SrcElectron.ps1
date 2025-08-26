#Requires -Version 5.1

<#
.SYNOPSIS
    Advanced Project File Analyzer - Enhanced version with caching, performance monitoring, and detailed analysis

.DESCRIPTION
    Analyzes file sizes and line counts for TypeScript, JavaScript, and related files in src/ and electron/ directories.
    Enhanced with performance metrics, caching, parallel processing, and comprehensive reporting.

.PARAMETER ProjectPath
    The root project directory to analyze (default: current directory)

.PARAMETER ShowDetails
    Show detailed help and usage information

.PARAMETER IncludeTests
    Include test files in the analysis (excluded by default)

.PARAMETER OutputFormat
    Output format: Table (default), Json, Csv, or Html

.PARAMETER CacheResults
    Cache analysis results for faster subsequent runs

.PARAMETER MaxDepth
    Maximum directory depth to traverse (default: unlimited)

.PARAMETER MinFileSize
    Minimum file size to include in analysis (in bytes, default: 0)

.PARAMETER SortBy
    Sort files by: Size (default), Lines, Name, Extension, or Date

.PARAMETER TopCount
    Number of top files to display (default: 20)

.PARAMETER ExportPath
    Path to export detailed results (optional)

.PARAMETER Parallel
    Use parallel processing for better performance on large codebases

.PARAMETER ShowProgress
    Show progress bars during analysis

.EXAMPLE
    .\Analyze-ProjectFiles-SrcElectron.ps1
    Basic analysis of current project

.EXAMPLE
    .\Analyze-ProjectFiles-SrcElectron.ps1 -IncludeTests -OutputFormat Json -CacheResults
    Include tests, output as JSON, and cache results

.EXAMPLE
    .\Analyze-ProjectFiles-SrcElectron.ps1 -ProjectPath "C:\MyProject" -SortBy Lines -TopCount 50 -Parallel
    Analyze specific project, sort by lines, show top 50 files, use parallel processing

.NOTES
    Author: GitHub Copilot Assistant
    Version: 2.0.0
    Requires: PowerShell 5.1+
    Enhanced with: Caching, Parallel Processing, Multiple Output Formats, Performance Monitoring
#>

[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [ValidateScript({Test-Path $_ -PathType Container})]
    [string]$ProjectPath = ".",

    [switch]$ShowDetails,

    [switch]$IncludeTests,

    [ValidateSet('Table', 'Json', 'Csv', 'Html')]
    [string]$OutputFormat = 'Table',

    [switch]$CacheResults,

    [ValidateRange(1, 50)]
    [int]$MaxDepth = [int]::MaxValue,

    [ValidateRange(0, [long]::MaxValue)]
    [long]$MinFileSize = 0,

    [ValidateSet('Size', 'Lines', 'Name', 'Extension', 'Date')]
    [string]$SortBy = 'Size',

    [ValidateRange(1, 1000)]
    [int]$TopCount = 20,

    [string]$ExportPath,

    [switch]$Parallel,

    [switch]$ShowProgress
)

# Enhanced color scheme with more visual elements
$Colors = @{
    Header       = "Cyan"
    FolderName   = "Yellow"
    TableHeader  = "Green"
    FileType     = "Magenta"
    Size         = "Blue"
    Lines        = "Red"
    Border       = "DarkGray"
    Summary      = "White"
    Success      = "Green"
    Warning      = "Yellow"
    Error        = "Red"
    Info         = "Cyan"
    Progress     = "DarkCyan"
    Performance  = "DarkGreen"
}

# Performance monitoring
$script:PerformanceCounters = @{
    StartTime = Get-Date
    FilesProcessed = 0
    BytesProcessed = 0
    CacheHits = 0
    CacheMisses = 0
}

# Cache configuration
$script:CacheConfig = @{
    Enabled = $CacheResults
    Path = Join-Path $env:TEMP "ProjectAnalyzer_Cache"
    MaxAge = (New-TimeSpan -Hours 24)
}

# File extensions to analyze
$script:ValidExtensions = @(
    '.ts', '.tsx', '.js', '.jsx', '.json', '.md',
    '.css', '.scss', '.sass', '.less', '.html',
    '.yml', '.yaml', '.toml', '.xml', '.vue',
    '.svelte', '.mjs', '.cjs'
)

# Test patterns for filtering
$script:TestPatterns = @(
    '*test*', '*spec*', '*mock*', '*fixture*',
    '*__tests__*', '*__mocks__*', '*__fixtures__*'
)

#region Utility Functions

function Write-ColorOutput {
    [CmdletBinding()]
    param(
        [string]$Message,
        [string]$Color = "White",
        [switch]$NoNewline
    )

    if ($NoNewline) {
        Write-Host $Message -ForegroundColor $Color -NoNewline
    } else {
        Write-Host $Message -ForegroundColor $Color
    }
}

function Write-ProgressInfo {
    [CmdletBinding()]
    param(
        [string]$Activity,
        [string]$Status,
        [int]$PercentComplete = -1,
        [int]$Id = 1
    )

    if ($ShowProgress) {
        if ($PercentComplete -ge 0) {
            Write-Progress -Activity $Activity -Status $Status -PercentComplete $PercentComplete -Id $Id
        } else {
            Write-Progress -Activity $Activity -Status $Status -Id $Id
        }
    }
}

function Get-CacheKey {
    [CmdletBinding()]
    param(
        [string]$Path,
        [hashtable]$Parameters
    )

    $keyData = @{
        Path = $Path
        IncludeTests = $Parameters.IncludeTests
        MaxDepth = $Parameters.MaxDepth
        MinFileSize = $Parameters.MinFileSize
        LastModified = (Get-Item $Path -ErrorAction SilentlyContinue)?.LastWriteTime
    }

    $keyString = ($keyData | ConvertTo-Json -Compress)
    $hash = [System.Security.Cryptography.SHA256]::Create().ComputeHash([System.Text.Encoding]::UTF8.GetBytes($keyString))
    return [System.BitConverter]::ToString($hash) -replace '-', ''
}

function Get-FromCache {
    [CmdletBinding()]
    param(
        [string]$CacheKey
    )

    if (-not $script:CacheConfig.Enabled) {
        return $null
    }

    $cachePath = Join-Path $script:CacheConfig.Path "$CacheKey.json"

    if (Test-Path $cachePath) {
        try {
            $cacheItem = Get-Content $cachePath -Raw | ConvertFrom-Json
            $cacheAge = (Get-Date) - [DateTime]$cacheItem.Timestamp

            if ($cacheAge -le $script:CacheConfig.MaxAge) {
                $script:PerformanceCounters.CacheHits++
                Write-ColorOutput "🎯 Cache hit for analysis results" $Colors.Performance
                return $cacheItem.Data
            }
        } catch {
            Write-ColorOutput "⚠️ Cache read error: $($_.Exception.Message)" $Colors.Warning
        }
    }

    $script:PerformanceCounters.CacheMisses++
    return $null
}

function Set-ToCache {
    [CmdletBinding()]
    param(
        [string]$CacheKey,
        [object]$Data
    )

    if (-not $script:CacheConfig.Enabled) {
        return
    }

    try {
        if (-not (Test-Path $script:CacheConfig.Path)) {
            New-Item -ItemType Directory -Path $script:CacheConfig.Path -Force | Out-Null
        }

        $cacheItem = @{
            Timestamp = Get-Date
            Data = $Data
        }

        $cachePath = Join-Path $script:CacheConfig.Path "$CacheKey.json"
        $cacheItem | ConvertTo-Json -Depth 10 | Set-Content $cachePath -Encoding UTF8

        Write-ColorOutput "💾 Results cached for future runs" $Colors.Performance
    } catch {
        Write-ColorOutput "⚠️ Cache write error: $($_.Exception.Message)" $Colors.Warning
    }
}

#endregion

function Get-EnhancedLineCount {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [string]$FilePath
    )

    try {
        # Use more efficient line counting for large files
        $fileInfo = Get-Item $FilePath -ErrorAction Stop

        if ($fileInfo.Length -eq 0) {
            return 0
        }

        # For binary files or very large files, estimate
        if ($fileInfo.Length -gt 50MB) {
            return [math]::Round($fileInfo.Length / 80) # Rough estimate: 80 chars per line
        }

        # Read content efficiently
        $content = Get-Content $FilePath -ErrorAction Stop
        return if ($content) { $content.Count } else { 0 }
    }
    catch {
        Write-Verbose "Failed to read file $FilePath : $($_.Exception.Message)"
        return 0
    }
}

function Format-FileSize {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [long]$Bytes
    )

    $sizes = @(
        @{ Unit = "TB"; Value = 1TB },
        @{ Unit = "GB"; Value = 1GB },
        @{ Unit = "MB"; Value = 1MB },
        @{ Unit = "KB"; Value = 1KB },
        @{ Unit = "B";  Value = 1 }
    )

    foreach ($size in $sizes) {
        if ($Bytes -ge $size.Value) {
            $value = $Bytes / $size.Value
            return "{0:N2} {1}" -f $value, $size.Unit
        }
    }

    return "0 B"
}

function Get-FileComplexityScore {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [System.IO.FileInfo]$File,
        [int]$LineCount
    )

    $score = 0

    # Base score from file size and lines
    $score += [math]::Log10($File.Length + 1) * 10
    $score += [math]::Log10($LineCount + 1) * 15

    # Extension-based complexity
    switch ($File.Extension.ToLower()) {
        '.ts'    { $score += 20 }  # TypeScript is complex
        '.tsx'   { $score += 25 }  # TSX even more so
        '.js'    { $score += 15 }  # JavaScript
        '.jsx'   { $score += 18 }  # JSX
        '.css'   { $score += 10 }  # CSS
        '.scss'  { $score += 12 }  # SCSS
        '.json'  { $score += 5 }   # JSON is simple
        '.md'    { $score += 8 }   # Markdown
        default  { $score += 7 }
    }

    return [math]::Round($score, 1)
}

function Get-FilteredFiles {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [string]$FolderPath,
        [bool]$IncludeTests,
        [int]$MaxDepth = [int]::MaxValue,
        [long]$MinFileSize = 0
    )

    if (-not (Test-Path $FolderPath)) {
        return @()
    }

    Write-ProgressInfo -Activity "Scanning Files" -Status "Reading directory structure..."

    try {
        # Get all files with depth limiting
        $getAllFilesScript = {
            param($Path, $Extensions, $MaxDepth, $CurrentDepth = 0)

            if ($CurrentDepth -ge $MaxDepth) {
                return @()
            }

            $files = @()
            $items = Get-ChildItem -Path $Path -ErrorAction SilentlyContinue

            foreach ($item in $items) {
                if ($item.PSIsContainer) {
                    $files += & $getAllFilesScript $item.FullName $Extensions $MaxDepth ($CurrentDepth + 1)
                } elseif ($item.Extension -in $Extensions -and $item.Length -ge $MinFileSize) {
                    $files += $item
                }
            }

            return $files
        }

        $allFiles = & $getAllFilesScript $FolderPath $script:ValidExtensions $MaxDepth

        # Filter out test files unless -IncludeTests is specified
        if (-not $IncludeTests) {
            $allFiles = $allFiles | Where-Object {
                $isTestFile = $false

                foreach ($pattern in $script:TestPatterns) {
                    if ($_.Name -like $pattern -or
                        $_.DirectoryName -like "*$($pattern.Trim('*'))*" -or
                        $_.FullName -like "*$($pattern.Trim('*'))*") {
                        $isTestFile = $true
                        break
                    }
                }

                -not $isTestFile
            }
        }

        $script:PerformanceCounters.FilesProcessed += $allFiles.Count
        $script:PerformanceCounters.BytesProcessed += ($allFiles | Measure-Object Length -Sum).Sum

        return $allFiles
    }
    catch {
        Write-ColorOutput "❌ Error scanning directory $FolderPath : $($_.Exception.Message)" $Colors.Error
        return @()
    }
}

function Get-EnhancedFileAnalysis {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [System.IO.FileInfo[]]$Files,
        [string]$FolderPath,
        [switch]$UseParallel
    )

    Write-ProgressInfo -Activity "Analyzing Files" -Status "Processing file statistics..."

    if ($UseParallel -and $Files.Count -gt 10) {
        Write-ColorOutput "🔄 Using parallel processing for $($Files.Count) files..." $Colors.Performance

        # Parallel processing for large file sets
        $fileStats = $Files | ForEach-Object -Parallel {
            $file = $_
            $relativePath = $file.FullName.Replace($using:FolderPath, "").TrimStart('\', '/')
            $lineCount = 0

            try {
                if ($file.Length -gt 0 -and $file.Length -lt 50MB) {
                    $content = Get-Content $file.FullName -ErrorAction Stop
                    $lineCount = if ($content) { $content.Count } else { 0 }
                }
            } catch {
                $lineCount = 0
            }

            [PSCustomObject]@{
                Name = $file.Name
                RelativePath = $relativePath
                Extension = $file.Extension
                SizeBytes = $file.Length
                SizeFormatted = if ($file.Length -ge 1MB) { "{0:N2} MB" -f ($file.Length / 1MB) }
                               elseif ($file.Length -ge 1KB) { "{0:N2} KB" -f ($file.Length / 1KB) }
                               else { "$($file.Length) B" }
                Lines = $lineCount
                Directory = $file.Directory.Name
                LastModified = $file.LastWriteTime
                ComplexityScore = [math]::Log10($file.Length + 1) * 10 + [math]::Log10($lineCount + 1) * 15
            }
        } -ThrottleLimit 8
    } else {
        # Sequential processing
        $fileStats = @()
        $totalFiles = $Files.Count
        $current = 0

        foreach ($file in $Files) {
            $current++
            if ($ShowProgress -and $current % 10 -eq 0) {
                $percent = [math]::Round(($current / $totalFiles) * 100)
                Write-ProgressInfo -Activity "Analyzing Files" -Status "Processing file $current of $totalFiles" -PercentComplete $percent
            }

            $relativePath = $file.FullName.Replace($FolderPath, "").TrimStart('\', '/')
            $lineCount = Get-EnhancedLineCount -FilePath $file.FullName
            $complexityScore = Get-FileComplexityScore -File $file -LineCount $lineCount

            $fileStats += [PSCustomObject]@{
                Name = $file.Name
                RelativePath = $relativePath
                Extension = $file.Extension
                SizeBytes = $file.Length
                SizeFormatted = Format-FileSize -Bytes $file.Length
                Lines = $lineCount
                Directory = $file.Directory.Name
                LastModified = $file.LastWriteTime
                ComplexityScore = $complexityScore
            }
        }
    }

    return $fileStats
}

function Export-AnalysisResults {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [object[]]$Results,
        [Parameter(Mandatory)]
        [string]$Format,
        [string]$Path
    )

    switch ($Format.ToLower()) {
        'json' {
            $jsonOutput = $Results | ConvertTo-Json -Depth 5
            if ($Path) {
                $jsonOutput | Set-Content -Path $Path -Encoding UTF8
                Write-ColorOutput "📁 Results exported to: $Path" $Colors.Success
            } else {
                return $jsonOutput
            }
        }

        'csv' {
            if ($Path) {
                $Results | Export-Csv -Path $Path -NoTypeInformation -Encoding UTF8
                Write-ColorOutput "📁 Results exported to: $Path" $Colors.Success
            } else {
                return ($Results | ConvertTo-Csv -NoTypeInformation)
            }
        }

        'html' {
            $htmlContent = @"
<!DOCTYPE html>
<html>
<head>
    <title>Project File Analysis</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2c3e50; text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #3498db; color: white; }
        tr:nth-child(even) { background-color: #f2f2f2; }
        .size { text-align: right; }
        .lines { text-align: right; }
        .complexity { text-align: right; }
        .summary { background: #ecf0f1; padding: 15px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Project File Analysis Report</h1>
        <div class="summary">
            <h3>Summary</h3>
            <p><strong>Total Files:</strong> $($Results.Count)</p>
            <p><strong>Total Size:</strong> $(Format-FileSize -Bytes ($Results | Measure-Object SizeBytes -Sum).Sum)</p>
            <p><strong>Total Lines:</strong> $($Results | Measure-Object Lines -Sum | Select-Object -ExpandProperty Sum)</p>
            <p><strong>Generated:</strong> $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')</p>
        </div>
        <table>
            <thead>
                <tr>
                    <th>File Name</th>
                    <th>Type</th>
                    <th class="size">Size</th>
                    <th class="lines">Lines</th>
                    <th class="complexity">Complexity</th>
                    <th>Directory</th>
                    <th>Last Modified</th>
                </tr>
            </thead>
            <tbody>
"@
            foreach ($file in $Results) {
                $htmlContent += @"
                <tr>
                    <td>$($file.Name)</td>
                    <td>$($file.Extension)</td>
                    <td class="size">$($file.SizeFormatted)</td>
                    <td class="lines">$($file.Lines)</td>
                    <td class="complexity">$($file.ComplexityScore)</td>
                    <td>$($file.Directory)</td>
                    <td>$($file.LastModified.ToString('yyyy-MM-dd HH:mm'))</td>
                </tr>
"@
            }

            $htmlContent += @"
            </tbody>
        </table>
    </div>
</body>
</html>
"@

            if ($Path) {
                $htmlContent | Set-Content -Path $Path -Encoding UTF8
                Write-ColorOutput "📁 HTML report exported to: $Path" $Colors.Success
            } else {
                return $htmlContent
            }
        }
    }
}
    param(
        [string]$FolderPath,
        [string]$FolderName
    )

    if (-not (Test-Path $FolderPath)) {
        Write-Output "⚠️  Folder '$FolderName' not found at: $FolderPath" -ForegroundColor Yellow
        return
    }

    # Get filtered files
    $files = Get-FilteredFile -FolderPath $FolderPath -IncludeTests $IncludeTests

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
Write-Output "🚀 PROJECT FILE ANALYZER - SRC & ELECTRON FOCUS" -ForegroundColor $Colors.Header
Write-Output "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $Colors.Header
Write-Output "📍 Analyzing: $(Resolve-Path $ProjectPath)" -ForegroundColor $Colors.Summary
Write-Output "🎯 Focus: src/ and electron/ directories only (recursive)" -ForegroundColor $Colors.Summary
Write-Output ""

# Define paths
$srcPath = Join-Path $ProjectPath "src"
$electronPath = Join-Path $ProjectPath "electron"

# Check if either directory exists
if (-not (Test-Path $srcPath) -and -not (Test-Path $electronPath)) {
    Write-Output "❌ Neither 'src' nor 'electron' directories found in the project path!" -ForegroundColor Red
    Write-Output "📂 Project path: $(Resolve-Path $ProjectPath)" -ForegroundColor Yellow
    Write-Output "💡 Make sure you're running this from the correct project directory." -ForegroundColor Gray
    Write-Output ""
    exit 1
}

# Analyze src folder
if (Test-Path $srcPath) {
    Show-FolderAnalysis -FolderPath $srcPath -FolderName "src"
} else {
    Write-Output ""
    Write-Output "⚠️  'src' directory not found - skipping" -ForegroundColor Yellow
}

# Analyze electron folder
if (Test-Path $electronPath) {
    Show-FolderAnalysis -FolderPath $electronPath -FolderName "electron"
} else {
    Write-Output ""
    Write-Output "⚠️  'electron' directory not found - skipping" -ForegroundColor Yellow
}

# Overall project summary (only for src and electron)
Write-Output ""
Write-Output "═══════════════════════════════════════════════════════════════════" -ForegroundColor $Colors.Border
Write-Output "🎯 PROJECT TOTALS (src + electron only)" -ForegroundColor $Colors.Header
Write-Output "═══════════════════════════════════════════════════════════════════" -ForegroundColor $Colors.Border

# Get all files from both directories
$allSrcFiles = Get-FilteredFile -FolderPath $srcPath -IncludeTests $IncludeTests
$allElectronFiles = Get-FilteredFile -FolderPath $electronPath -IncludeTests $IncludeTests
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

    # Show distribution
    $srcFileCount = $allSrcFiles.Count
    $electronFileCount = $allElectronFiles.Count
    Write-Output ""
    Write-Output "📊 Distribution:" -ForegroundColor $Colors.Summary
    Write-Output "   src/: $srcFileCount files" -ForegroundColor $Colors.FileType
    Write-Output "   electron/: $electronFileCount files" -ForegroundColor $Colors.FileType
} else {
    Write-Output "No files found in src/ or electron/ directories." -ForegroundColor Yellow
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
    Write-Output "🎯 Focus Areas:" -ForegroundColor $Colors.Summary
    Write-Output "  • This script ONLY analyzes src/ and electron/ directories" -ForegroundColor Gray
    Write-Output "  • All subdirectories within src/ and electron/ are included recursively" -ForegroundColor Gray
    Write-Output "  • Other project directories (docs/, scripts/, etc.) are ignored" -ForegroundColor Gray
    Write-Output ""
    Write-Output "🔍 Test File Filtering:" -ForegroundColor $Colors.Summary
    Write-Output "  • By default, excludes files with .test. or .spec. patterns" -ForegroundColor Gray
    Write-Output "  • Excludes files in test/tests/__tests__/spec/specs directories" -ForegroundColor Gray
    Write-Output "  • Use -IncludeTests flag to include all files" -ForegroundColor Gray
    Write-Output ""
}
