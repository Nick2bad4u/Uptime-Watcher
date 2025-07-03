# Migration Scripts - Uptime Watcher Refactoring

## 🔧 **Automated Migration Scripts**

This document contains practical scripts and tools to automate the refactoring process outlined in `REFACTORING_ANALYSIS.md` and `ADDITIONAL_REFACTORING_OPPORTUNITIES.md`.

---

## 🚀 **PowerShell Migration Scripts**

### **1. Component Migration Script**

```powershell
# scripts/migrate-components.ps1
param(
    [Parameter(Mandatory=$true)]
    [string]$SourceFile,
    
    [Parameter(Mandatory=$true)]
    [string]$TargetDirectory,
    
    [switch]$DryRun = $false,
    
    [switch]$CreateTests = $true,
    
    [switch]$UpdateImports = $true
)

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $(
        switch($Level) {
            "ERROR" { "Red" }
            "WARN" { "Yellow" }
            "SUCCESS" { "Green" }
            default { "White" }
        }
    )
}

function Extract-Component {
    param(
        [string]$ComponentName,
        [string]$ComponentCode,
        [string]$TargetPath
    )
    
    if ($DryRun) {
        Write-Log "DRY RUN: Would create $TargetPath/$ComponentName/" -Level "INFO"
        return
    }
    
    # Create component directory
    $componentDir = Join-Path $TargetPath $ComponentName
    New-Item -ItemType Directory -Path $componentDir -Force | Out-Null
    
    # Create component file
    $componentFile = Join-Path $componentDir "$ComponentName.tsx" 
    Set-Content -Path $componentFile -Value $ComponentCode
    Write-Log "Created component: $componentFile" -Level "SUCCESS"
    
    # Create types file
    $typesContent = @"
import { ReactNode } from 'react';

export interface ${ComponentName}Props {
  children?: ReactNode;
  className?: string;
  'data-testid'?: string;
}
"@
    $typesFile = Join-Path $componentDir "$ComponentName.types.ts"
    Set-Content -Path $typesFile -Value $typesContent
    Write-Log "Created types: $typesFile" -Level "SUCCESS"
    
    # Create test file if requested
    if ($CreateTests) {
        $testContent = @"
import { render, screen } from '@testing-library/react';
import { $ComponentName } from './$ComponentName';

describe('$ComponentName', () => {
  it('renders without crashing', () => {
    render(<$ComponentName data-testid="$($ComponentName.ToLower())" />);
    expect(screen.getByTestId('$($ComponentName.ToLower())')).toBeInTheDocument();
  });
  
  it('applies custom className', () => {
    render(<$ComponentName className="custom-class" data-testid="$($ComponentName.ToLower())" />);
    expect(screen.getByTestId('$($ComponentName.ToLower())')).toHaveClass('custom-class');
  });
});
"@
        $testFile = Join-Path $componentDir "$ComponentName.test.tsx"
        Set-Content -Path $testFile -Value $testContent
        Write-Log "Created test: $testFile" -Level "SUCCESS"
    }
}

function Update-ImportStatements {
    param([string]$ProjectRoot)
    
    if (-not $UpdateImports) {
        Write-Log "Skipping import updates" -Level "INFO"
        return
    }
    
    Write-Log "Updating import statements..." -Level "INFO"
    
    # Find all TypeScript/TSX files
    $files = Get-ChildItem -Path $ProjectRoot -Recurse -Include "*.ts", "*.tsx" | 
              Where-Object { $_.Name -notlike "*.test.*" -and $_.Name -notlike "*.spec.*" }
    
    foreach ($file in $files) {
        $content = Get-Content -Path $file.FullName -Raw
        $originalContent = $content
        
        # Update theme component imports
        $content = $content -replace "from '@/theme/components'", "from '@/theme/components'"
        
        # Add specific component imports
        $content = $content -replace "import { (.+) } from '@/theme/components'", {
            param($match)
            $imports = $match.Groups[1].Value -split "," | ForEach-Object { $_.Trim() }
            $newImports = $imports | ForEach-Object {
                "import { $_ } from '@/theme/components/$_/$_';"
            }
            $newImports -join "`n"
        }
        
        if ($content -ne $originalContent) {
            if (-not $DryRun) {
                Set-Content -Path $file.FullName -Value $content
            }
            Write-Log "Updated imports in: $($file.Name)" -Level "SUCCESS"
        }
    }
}

# Main execution
try {
    Write-Log "Starting component migration..." -Level "INFO"
    Write-Log "Source file: $SourceFile" -Level "INFO"
    Write-Log "Target directory: $TargetDirectory" -Level "INFO"
    Write-Log "Dry run: $DryRun" -Level "INFO"
    
    if (-not (Test-Path $SourceFile)) {
        throw "Source file not found: $SourceFile"
    }
    
    # Create target directory
    if (-not $DryRun) {
        New-Item -ItemType Directory -Path $TargetDirectory -Force | Out-Null
    }
    
    # Read source file
    $sourceContent = Get-Content -Path $SourceFile -Raw
    
    # Extract components (simplified - would need actual parsing logic)
    Write-Log "Extracting components from source file..." -Level "INFO"
    
    # Update imports in project
    $projectRoot = Split-Path $SourceFile -Parent | Split-Path -Parent
    Update-ImportStatements -ProjectRoot $projectRoot
    
    Write-Log "Migration completed successfully!" -Level "SUCCESS"
    
} catch {
    Write-Log "Migration failed: $($_.Exception.Message)" -Level "ERROR"
    exit 1
}
```

### **2. Store Migration Script**

```powershell
# scripts/migrate-store.ps1
param(
    [string]$StoreFile = "src/store.ts",
    [string]$OutputDir = "src/store/slices",
    [switch]$DryRun = $false
)

function Create-StoreSlice {
    param(
        [string]$SliceName,
        [string]$SliceContent,
        [string]$OutputPath
    )
    
    $sliceTemplate = @"
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
interface ${SliceName}State {
  // Define state shape here
}

const initialState: ${SliceName}State = {
  // Define initial state here
};

// Slice
export const ${SliceName}Slice = createSlice({
  name: '$($SliceName.ToLower())',
  initialState,
  reducers: {
    // Define reducers here
  },
});

// Actions
export const {
  // Export actions here
} = ${SliceName}Slice.actions;

// Selectors
export const select${SliceName}State = (state: RootState) => state.$($SliceName.ToLower());

export default ${SliceName}Slice.reducer;
"@

    if (-not $DryRun) {
        $sliceFile = Join-Path $OutputPath "$($SliceName.ToLower())Slice.ts"
        Set-Content -Path $sliceFile -Value $sliceTemplate
        Write-Host "✅ Created slice: $sliceFile" -ForegroundColor Green
    } else {
        Write-Host "🔍 DRY RUN: Would create $($SliceName.ToLower())Slice.ts" -ForegroundColor Yellow
    }
}

# Main execution
Write-Host "🚀 Starting store migration..." -ForegroundColor Cyan

if (-not $DryRun) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

# Create individual slices
$slices = @("Sites", "Settings", "UI", "Analytics", "Monitoring")

foreach ($slice in $slices) {
    Create-StoreSlice -SliceName $slice -SliceContent "" -OutputPath $OutputDir
}

Write-Host "✅ Store migration completed!" -ForegroundColor Green
```

### **3. Service Extraction Script**

```powershell
# scripts/extract-services.ps1
param(
    [string]$SourceFile,
    [string]$ServicesDir = "src/services",
    [switch]$DryRun = $false
)

function Create-ServiceStructure {
    param([string]$BaseDir)
    
    $directories = @(
        "monitoring",
        "database", 
        "notifications",
        "analytics",
        "http",
        "utils"
    )
    
    foreach ($dir in $directories) {
        $fullPath = Join-Path $BaseDir $dir
        if (-not $DryRun) {
            New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
            Write-Host "📁 Created directory: $dir" -ForegroundColor Blue
        } else {
            Write-Host "🔍 DRY RUN: Would create directory: $dir" -ForegroundColor Yellow
        }
    }
}

function Create-ServiceInterface {
    param(
        [string]$ServiceName,
        [string]$OutputPath
    )
    
    $interfaceContent = @"
// ${ServiceName} Service Interface
export interface I${ServiceName}Service {
  // Define service contract here
}

export class ${ServiceName}Service implements I${ServiceName}Service {
  // Implement service methods here
}
"@

    if (-not $DryRun) {
        $serviceFile = Join-Path $OutputPath "$ServiceName.ts"
        Set-Content -Path $serviceFile -Value $interfaceContent
        Write-Host "🔧 Created service: $ServiceName.ts" -ForegroundColor Green
    } else {
        Write-Host "🔍 DRY RUN: Would create service: $ServiceName.ts" -ForegroundColor Yellow
    }
}

# Main execution
Write-Host "🚀 Starting service extraction..." -ForegroundColor Cyan

Create-ServiceStructure -BaseDir $ServicesDir

$services = @(
    @{ Name = "UptimeMonitorService"; Dir = "monitoring" },
    @{ Name = "HttpCheckService"; Dir = "http" },
    @{ Name = "NotificationService"; Dir = "notifications" },
    @{ Name = "AnalyticsService"; Dir = "analytics" },
    @{ Name = "DatabaseService"; Dir = "database" }
)

foreach ($service in $services) {
    $servicePath = Join-Path $ServicesDir $service.Dir
    Create-ServiceInterface -ServiceName $service.Name -OutputPath $servicePath
}

Write-Host "✅ Service extraction completed!" -ForegroundColor Green
```

---

## 🔍 **Analysis and Validation Scripts**

### **4. Code Complexity Analyzer**

```powershell
# scripts/analyze-complexity.ps1
param(
    [string]$ProjectPath = ".",
    [string]$OutputFile = "complexity-report.json",
    [int]$MaxComplexity = 10
)

function Measure-FileComplexity {
    param([string]$FilePath)
    
    $content = Get-Content -Path $FilePath -Raw
    $lines = ($content -split "`n").Count
    
    # Simple complexity metrics
    $ifStatements = ([regex]::Matches($content, '\bif\s*\(')).Count
    $forLoops = ([regex]::Matches($content, '\b(for|while)\s*\(')).Count
    $switches = ([regex]::Matches($content, '\bswitch\s*\(')).Count
    $functions = ([regex]::Matches($content, '\b(function|const .* =|.*\(.*\)\s*=>')).Count
    
    $complexity = $ifStatements + $forLoops + $switches + ($functions * 0.5)
    
    return @{
        File = $FilePath
        Lines = $lines
        Complexity = [math]::Round($complexity, 2)
        IfStatements = $ifStatements
        Loops = $forLoops
        Switches = $switches
        Functions = $functions
        NeedsRefactoring = $complexity -gt $MaxComplexity -or $lines -gt 200
    }
}

# Analyze all TypeScript files
$files = Get-ChildItem -Path $ProjectPath -Recurse -Include "*.ts", "*.tsx" | 
          Where-Object { $_.Name -notlike "*.test.*" -and $_.Name -notlike "*.spec.*" }

$results = @()
$totalFiles = $files.Count
$current = 0

Write-Host "🔍 Analyzing $totalFiles files..." -ForegroundColor Cyan

foreach ($file in $files) {
    $current++
    Write-Progress -Activity "Analyzing complexity" -Status "Processing $($file.Name)" -PercentComplete (($current / $totalFiles) * 100)
    
    try {
        $analysis = Measure-FileComplexity -FilePath $file.FullName
        $results += $analysis
        
        if ($analysis.NeedsRefactoring) {
            Write-Host "⚠️  High complexity: $($file.Name) (Complexity: $($analysis.Complexity), Lines: $($analysis.Lines))" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ Error analyzing $($file.Name): $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Generate report
$report = @{
    Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    TotalFiles = $results.Count
    HighComplexityFiles = ($results | Where-Object { $_.NeedsRefactoring }).Count
    AverageComplexity = [math]::Round(($results | Measure-Object -Property Complexity -Average).Average, 2)
    AverageLines = [math]::Round(($results | Measure-Object -Property Lines -Average).Average, 2)
    Files = $results | Sort-Object Complexity -Descending
}

$reportJson = $report | ConvertTo-Json -Depth 3 -Compress
Set-Content -Path $OutputFile -Value $reportJson

Write-Host "📊 Analysis complete!" -ForegroundColor Green
Write-Host "📄 Report saved to: $OutputFile" -ForegroundColor Blue
Write-Host "🔍 Files analyzed: $($report.TotalFiles)" -ForegroundColor Blue
Write-Host "⚠️  High complexity files: $($report.HighComplexityFiles)" -ForegroundColor Yellow
Write-Host "📈 Average complexity: $($report.AverageComplexity)" -ForegroundColor Blue
Write-Host "📏 Average lines: $($report.AverageLines)" -ForegroundColor Blue
```

### **5. Import Dependency Analyzer**

```powershell
# scripts/analyze-dependencies.ps1
param(
    [string]$ProjectPath = ".",
    [string]$OutputFile = "dependency-graph.json"
)

function Extract-Imports {
    param([string]$FilePath)
    
    $content = Get-Content -Path $FilePath -Raw
    $imports = [regex]::Matches($content, "import.*from\s+['\"]([^'\"]+)['\"]") | 
               ForEach-Object { $_.Groups[1].Value }
    
    return $imports
}

function Build-DependencyGraph {
    param([array]$Files)
    
    $graph = @{}
    
    foreach ($file in $Files) {
        $relativePath = $file.FullName.Replace($PWD.Path, "").Replace("\", "/").TrimStart("/")
        $imports = Extract-Imports -FilePath $file.FullName
        
        $graph[$relativePath] = @{
            Path = $relativePath
            Size = (Get-Item $file.FullName).Length
            Imports = $imports
            ImportCount = $imports.Count
        }
    }
    
    return $graph
}

# Analyze dependencies
$files = Get-ChildItem -Path $ProjectPath -Recurse -Include "*.ts", "*.tsx" | 
         Where-Object { $_.Name -notlike "*.test.*" }

Write-Host "🔍 Building dependency graph for $($files.Count) files..." -ForegroundColor Cyan

$dependencyGraph = Build-DependencyGraph -Files $files

# Find circular dependencies
$circularDeps = @()
foreach ($file in $dependencyGraph.Keys) {
    # Simplified circular dependency detection
    $imports = $dependencyGraph[$file].Imports
    foreach ($import in $imports) {
        if ($dependencyGraph.ContainsKey($import)) {
            $reverseImports = $dependencyGraph[$import].Imports
            if ($reverseImports -contains $file) {
                $circularDeps += @{ From = $file; To = $import }
            }
        }
    }
}

# Generate report
$report = @{
    Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    TotalFiles = $dependencyGraph.Count
    CircularDependencies = $circularDeps
    DependencyGraph = $dependencyGraph
}

$reportJson = $report | ConvertTo-Json -Depth 4 -Compress
Set-Content -Path $OutputFile -Value $reportJson

Write-Host "📊 Dependency analysis complete!" -ForegroundColor Green
Write-Host "📄 Report saved to: $OutputFile" -ForegroundColor Blue
Write-Host "🔄 Circular dependencies found: $($circularDeps.Count)" -ForegroundColor $(if ($circularDeps.Count -gt 0) { "Red" } else { "Green" })
```

---

## 🧪 **Testing Scripts**

### **6. Test Coverage Analyzer**

```powershell
# scripts/analyze-test-coverage.ps1
param(
    [string]$ProjectPath = ".",
    [string]$CoverageFile = "coverage/coverage-final.json",
    [double]$TargetCoverage = 80.0
)

function Analyze-Coverage {
    param([string]$CoverageFilePath)
    
    if (-not (Test-Path $CoverageFilePath)) {
        Write-Host "❌ Coverage file not found: $CoverageFilePath" -ForegroundColor Red
        Write-Host "💡 Run 'npm test -- --coverage' first" -ForegroundColor Yellow
        return
    }
    
    $coverageData = Get-Content -Path $CoverageFilePath | ConvertFrom-Json
    
    $results = @()
    
    foreach ($file in $coverageData.PSObject.Properties) {
        $fileData = $file.Value
        
        $lineCoverage = if ($fileData.l.total -gt 0) { 
            ($fileData.l.covered / $fileData.l.total) * 100 
        } else { 0 }
        
        $branchCoverage = if ($fileData.b.total -gt 0) { 
            ($fileData.b.covered / $fileData.b.total) * 100 
        } else { 0 }
        
        $functionCoverage = if ($fileData.f.total -gt 0) { 
            ($fileData.f.covered / $fileData.f.total) * 100 
        } else { 0 }
        
        $overall = ($lineCoverage + $branchCoverage + $functionCoverage) / 3
        
        $results += @{
            File = $file.Name
            LineCoverage = [math]::Round($lineCoverage, 2)
            BranchCoverage = [math]::Round($branchCoverage, 2)
            FunctionCoverage = [math]::Round($functionCoverage, 2)
            OverallCoverage = [math]::Round($overall, 2)
            NeedsImprovement = $overall -lt $TargetCoverage
        }
    }
    
    return $results
}

# Run analysis
Write-Host "🧪 Analyzing test coverage..." -ForegroundColor Cyan

$coverageResults = Analyze-Coverage -CoverageFilePath $CoverageFile

if ($coverageResults) {
    $lowCoverageFiles = $coverageResults | Where-Object { $_.NeedsImprovement }
    $averageCoverage = ($coverageResults | Measure-Object -Property OverallCoverage -Average).Average
    
    Write-Host "📊 Coverage Analysis Results:" -ForegroundColor Green
    Write-Host "📁 Total files: $($coverageResults.Count)" -ForegroundColor Blue
    Write-Host "📈 Average coverage: $([math]::Round($averageCoverage, 2))%" -ForegroundColor Blue
    Write-Host "⚠️  Files below target ($TargetCoverage%): $($lowCoverageFiles.Count)" -ForegroundColor Yellow
    
    if ($lowCoverageFiles.Count -gt 0) {
        Write-Host "`n🔍 Files needing test improvement:" -ForegroundColor Yellow
        $lowCoverageFiles | Sort-Object OverallCoverage | ForEach-Object {
            Write-Host "   $($_.File): $($_.OverallCoverage)%" -ForegroundColor Yellow
        }
    }
}
```

---

## ⚡ **Quick Setup Script**

### **7. Complete Setup Script**

```powershell
# scripts/setup-refactoring.ps1
param(
    [switch]$InstallDependencies = $true,
    [switch]$CreateDirectories = $true,
    [switch]$SetupLinting = $true,
    [switch]$SetupTesting = $true
)

function Install-Dependencies {
    Write-Host "📦 Installing refactoring dependencies..." -ForegroundColor Cyan
    
    $packages = @(
        "@reduxjs/toolkit",
        "react-redux", 
        "@testing-library/react",
        "@testing-library/jest-dom",
        "@testing-library/user-event",
        "jest",
        "typescript",
        "eslint",
        "prettier"
    )
    
    foreach ($package in $packages) {
        Write-Host "📥 Installing $package..." -ForegroundColor Blue
        npm install $package --save-dev
    }
}

function Create-Directories {
    Write-Host "📁 Creating project structure..." -ForegroundColor Cyan
    
    $directories = @(
        "src/store/slices",
        "src/store/selectors", 
        "src/store/middleware",
        "src/store/api",
        "src/theme/components/base",
        "src/theme/components/form",
        "src/theme/components/status",  
        "src/theme/components/layout",
        "src/theme/components/feedback",
        "src/services/monitoring",
        "src/services/analytics",
        "src/services/notifications",
        "src/hooks/analytics",
        "src/hooks/forms",
        "src/hooks/navigation",
        "electron/services/monitoring",
        "electron/services/database",
        "electron/services/http",
        "electron/container",
        "electron/types",
        "electron/errors"
    )
    
    foreach ($dir in $directories) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "✅ Created: $dir" -ForegroundColor Green
    }
}

function Setup-Linting {
    Write-Host "🔍 Setting up linting configuration..." -ForegroundColor Cyan
    
    $eslintConfig = @{
        extends = @(
            "@typescript-eslint/recommended",
            "plugin:react/recommended",
            "plugin:react-hooks/recommended"
        )
        rules = @{
            "@typescript-eslint/no-unused-vars" = "error"
            "react/prop-types" = "off"
            "react-hooks/exhaustive-deps" = "warn"
        }
    }
    
    $eslintConfig | ConvertTo-Json -Depth 3 | Set-Content -Path ".eslintrc.json"
    Write-Host "✅ Created .eslintrc.json" -ForegroundColor Green
}

function Setup-Testing {
    Write-Host "🧪 Setting up testing configuration..." -ForegroundColor Cyan
    
    $jestConfig = @{
        testEnvironment = "jsdom"
        setupFilesAfterEnv = @("<rootDir>/src/setupTests.ts")
        moduleNameMapping = @{
            "^@/(.*)$" = "<rootDir>/src/$1"
        }
        collectCoverageFrom = @(
            "src/**/*.{ts,tsx}",
            "!src/**/*.test.{ts,tsx}",
            "!src/**/*.stories.{ts,tsx}"
        )
        coverageThreshold = @{
            global = @{
                branches = 80
                functions = 80
                lines = 80
                statements = 80
            }
        }
    }
    
    $jestConfig | ConvertTo-Json -Depth 3 | Set-Content -Path "jest.config.json"
    Write-Host "✅ Created jest.config.json" -ForegroundColor Green
}

# Main execution
Write-Host "🚀 Setting up refactoring environment..." -ForegroundColor Cyan

if ($InstallDependencies) { Install-Dependencies }
if ($CreateDirectories) { Create-Directories }
if ($SetupLinting) { Setup-Linting }
if ($SetupTesting) { Setup-Testing }

Write-Host "✅ Refactoring environment setup complete!" -ForegroundColor Green
Write-Host "💡 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Run 'npm test' to verify testing setup" -ForegroundColor Yellow
Write-Host "   2. Run './scripts/analyze-complexity.ps1' to analyze current code" -ForegroundColor Yellow
Write-Host "   3. Start with theme component extraction using './scripts/migrate-components.ps1'" -ForegroundColor Yellow
```

---

## 📋 **Usage Examples**

### **Running the Scripts**

```powershell
# 1. Setup refactoring environment
.\scripts\setup-refactoring.ps1

# 2. Analyze current code complexity  
.\scripts\analyze-complexity.ps1 -ProjectPath "." -MaxComplexity 10

# 3. Extract theme components
.\scripts\migrate-components.ps1 -SourceFile "src\theme\components.tsx" -TargetDirectory "src\theme\components" -DryRun

# 4. Migrate store to slices
.\scripts\migrate-store.ps1 -StoreFile "src\store.ts" -OutputDir "src\store\slices"

# 5. Extract services
.\scripts\extract-services.ps1 -SourceFile "electron\uptimeMonitor.ts" -ServicesDir "electron\services"

# 6. Analyze test coverage
.\scripts\analyze-test-coverage.ps1 -TargetCoverage 85

# 7. Check dependencies
.\scripts\analyze-dependencies.ps1 -OutputFile "dependency-report.json"
```

These migration scripts provide automated tools to implement the comprehensive refactoring plan, ensuring consistency and reducing manual effort in the transformation process.
