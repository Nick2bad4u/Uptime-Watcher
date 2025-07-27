# Setup script for metrics branch
# This creates an orphan branch specifically for hosting repository metrics

Write-Output "Setting up metrics branch for repository stats..." -ForegroundColor Green

# Create and switch to orphan metrics branch
git checkout --orphan metrics

# Remove all files from the new branch
git rm -rf .

# Create a simple README for the metrics branch
@"
# Repository Metrics

This branch contains automatically generated repository statistics and metrics.

## Files:
- `metrics.repository.svg` - Repository statistics image

This branch is automatically updated by GitHub Actions.
"@ | Out-File -FilePath "README.md" -Encoding UTF8

# Add and commit the initial README
git add README.md
git commit -m "Initial metrics branch setup"

# Push the new branch
git push -u origin metrics

# Switch back to main branch
git checkout main

Write-Output "Metrics branch created successfully!" -ForegroundColor Green
Write-Output "You can now reference metrics from: https://raw.githubusercontent.com/nick2bad4u/Uptime-Watcher/metrics/metrics.repository.svg" -ForegroundColor Yellow
