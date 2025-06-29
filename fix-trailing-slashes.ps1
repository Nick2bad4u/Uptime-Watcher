# PowerShell script to fix trailing slashes in Jekyll collection links
# This script removes trailing slashes from internal collection links

Write-Host "🔧 Fixing trailing slashes in Jekyll collection links..." -ForegroundColor Cyan

# Get all markdown files in the docs directory
$docFiles = Get-ChildItem -Path "docs" -Filter "*.md" -Recurse

$totalFiles = $docFiles.Count
$processedFiles = 0
$totalReplacements = 0

foreach ($file in $docFiles) {
    $processedFiles++
    Write-Progress -Activity "Processing Markdown files" -Status "File $processedFiles of $totalFiles" -PercentComplete (($processedFiles / $totalFiles) * 100)
    
    try {
        # Check if file exists and is readable
        if (-not (Test-Path $file.FullName)) {
            Write-Warning "⚠️  Skipping: $($file.Name) - File not found"
            continue
        }
        
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8 -ErrorAction Stop
        
        # Skip empty files or files with null content
        if ([string]::IsNullOrEmpty($content)) {
            Write-Host "⏭️  Skipping: $($file.Name) - Empty file" -ForegroundColor Gray
            continue
        }
        
        $originalContent = $content
        $fileReplacements = 0
        
        # Pattern to match markdown links with trailing slashes for internal links
        # Matches: [text](path/) but excludes external URLs and root paths
        $pattern = '\[([^\]]+)\]\(([^)]*[^/])/\)'
        
        # Find all matches first to report them
        $linkMatches = [regex]::Matches($content, $pattern)
        
        if ($linkMatches.Count -gt 0) {
            Write-Host "📝 Processing: $($file.Name)" -ForegroundColor Yellow
            
            foreach ($match in $linkMatches) {
                $linkText = $match.Groups[1].Value
                $linkPath = $match.Groups[2].Value
                # Only show internal links that aren't root paths
                if (-not ($linkPath -match '^https?://') -and -not ($linkPath -eq '')) {
                    Write-Host "  🔗 Found link: [$linkText]($linkPath/)" -ForegroundColor Gray
                }
            }
        }
        
        # Replace trailing slashes in internal links
        $content = [regex]::Replace($content, $pattern, {
            param($match)
            $linkText = $match.Groups[1].Value
            $linkPath = $match.Groups[2].Value
            
            # Handle different path types
            if ($linkPath -match '^https?://') {
                # External URL - don't modify
                return $match.Value
            } elseif ($linkPath -eq '') {
                # Root path - don't modify
                return $match.Value
            } elseif ($linkPath -match '^\.\.?/' -or $linkPath -match '/') {
                # Internal path - remove trailing slash
                $fileReplacements++
                return "[$linkText]($linkPath)"
            } else {
                # Simple filename - remove trailing slash
                $fileReplacements++
                return "[$linkText]($linkPath)"
            }
        })
        
        # Only write if content changed
        if ($content -ne $originalContent) {
            Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
            $totalReplacements += $fileReplacements
            Write-Host "  ✅ Fixed $fileReplacements trailing slashes in $($file.Name)" -ForegroundColor Green
        }
    }
    catch {
        Write-Warning "⚠️  Error processing $($file.Name): $($_.Exception.Message)"
        continue
    }
}

Write-Progress -Activity "Processing Markdown files" -Completed

Write-Host ""
Write-Host "🎉 Trailing slash fixing complete!" -ForegroundColor Green
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "  • Files processed: $totalFiles" -ForegroundColor White
Write-Host "  • Total trailing slashes removed: $totalReplacements" -ForegroundColor White

if ($totalReplacements -gt 0) {
    Write-Host ""
    Write-Host "📝 What was changed:" -ForegroundColor Yellow
    Write-Host "  • Removed trailing slashes from internal Jekyll collection links" -ForegroundColor White
    Write-Host "  • Preserved external URLs unchanged" -ForegroundColor White
    Write-Host "  • Preserved root path links unchanged" -ForegroundColor White
    Write-Host ""
    Write-Host "🚀 Your Jekyll collection links should now work properly!" -ForegroundColor Green
    Write-Host ""
    Write-Host "💡 Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Test your documentation site locally" -ForegroundColor White
    Write-Host "  2. Commit and push the changes" -ForegroundColor White
    Write-Host "  3. Check that collection links work on your GitHub Pages site" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "ℹ️  No trailing slashes found that needed fixing!" -ForegroundColor Blue
}
