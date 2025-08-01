# FileAnalyzer.ps1
param(
    [switch]$IncludeTests,
    [ValidateSet('Table','Json','Csv','Markdown')]
    [string]$Format = 'Table'
)

# Define test file patterns to exclude
$excludePatterns = @('*test*', '*spec*', '*mock*', '*__tests__*')

# Get all files recursively
$files = Get-ChildItem -Path "Src\electron" -File -Recurse

# Filter files based on test inclusion flag
$filteredFiles = if (-not $IncludeTests) {
    $files | Where-Object {
        $filePath = $_.FullName.ToLower()
        -not ($excludePatterns | Where-Object { $filePath -like $_ })
    }
} else {
    $files
}

# Process files and collect data
$results = foreach ($file in $filteredFiles) {
    $sizeKB = [math]::Round($file.Length / 1KB, 2)

    # Get line count (skip for binary files)
    $lineCount = $null
    if ($file.Extension -notin @('.png','.jpg','.gif','.ico','.svg','.woff','.ttf','.eot','.woff2','.bin')) {
        try {
            $lineCount = [System.IO.File]::ReadLines($file.FullName).Count
        }
        catch {
            $lineCount = "Error"
        }
    }
    else {
        $lineCount = "Binary"
    }

    [PSCustomObject]@{
        Name      = $file.FullName.Substring($pwd.Path.Length + 1)
        SizeKB    = $sizeKB
        LineCount = $lineCount
        Extension = $file.Extension
        LastModified = $file.LastWriteTime.ToString("yyyy-MM-dd HH:mm")
    }
}

# Sort by size descending
$sorted = $results | Sort-Object -Property SizeKB -Descending

# Handle different output formats
switch ($Format) {
    'Json' {
        $sorted | ConvertTo-Json -Depth 2 | Out-String
        break
    }

    'Csv' {
        $sorted | Export-Csv -Path "file-analysis.csv" -NoTypeInformation
        Write-Output "✅ CSV output saved to file-analysis.csv" -ForegroundColor Green
        break
    }

    'Markdown' {
        $mdOutput = "## File Analysis Report`n"
        $mdOutput += "| File | Size (KB) | Lines | Type | Last Modified |`n"
        $mdOutput += "|------|-----------|-------|------|---------------|`n"

        foreach ($item in $sorted) {
            $mdOutput += "| $($item.Name) | $($item.SizeKB) | $($item.LineCount) | $($item.Extension) | $($item.LastModified) |`n"
        }

        $mdOutput | Out-File "file-analysis.md"
        Write-Output "✅ Markdown output saved to file-analysis.md" -ForegroundColor Green
        break
    }

    'Table' {
        # Create formatted display
        Clear-Host
        Write-Output "`n📁 FILE ANALYSIS REPORT" -ForegroundColor Cyan
        Write-Output "======================"
        Write-Output "Path: Src\electron" -ForegroundColor DarkGray
        Write-Output "Include tests: $($IncludeTests.IsPresent)" -ForegroundColor DarkGray
        Write-Output "Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm')`n" -ForegroundColor DarkGray

        $sorted | Format-Table -AutoSize @{
            Label = "File"
            Expression = {
                # Color code by file type
                $color = if ($_.Extension -in '.js','.ts') { 'Cyan' }
                         elseif ($_.Extension -in '.html','.css') { 'Magenta' }
                         elseif ($_.Extension -in '.json','.yml') { 'Green' }
                         else { 'White' }
                Write-Output $_.Name -ForegroundColor $color -NoNewline
                ""
            }
        },
        @{
            Label = "Size (KB)"
            Expression = {
                $color = if ($_.SizeKB -gt 100) { 'Red' }
                         elseif ($_.SizeKB -gt 50) { 'Yellow' }
                         else { 'White' }
                Write-Output ("{0:N2}" -f $_.SizeKB) -ForegroundColor $color -NoNewline
                ""
            }
            Align = 'Right'
        },
        @{
            Label = "Lines"
            Expression = {
                if ($_.LineCount -ne "Binary" -and $_.LineCount -ne "Error") {
                    $color = if ($_.LineCount -gt 500) { 'Red' }
                             elseif ($_.LineCount -gt 100) { 'Yellow' }
                             else { 'White' }
                    Write-Output $_.LineCount -ForegroundColor $color -NoNewline
                } else {
                    Write-Output $_.LineCount -ForegroundColor DarkGray -NoNewline
                }
                ""
            }
            Align = 'Right'
        }

        Write-Output "`n📊 Summary" -ForegroundColor Yellow
        Write-Output "Files: $($sorted.Count)" -ForegroundColor White
        Write-Output "Total size: $([math]::Round(($sorted | Measure-Object -Property SizeKB -Sum).Sum, 2)) KB" -ForegroundColor White
        Write-Output "Excluded tests: $(($files.Count - $filteredFiles.Count))" -ForegroundColor DarkGray
    }
}