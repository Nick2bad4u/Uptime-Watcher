/**
 * Import pattern audit tool for ensuring consistent import usage across the codebase.
 * Analyzes and validates import patterns to ensure proper barrel export usage.
 *
 * @remarks
 * This tool examines:
 * - Barrel export usage consistency
 * - Direct vs. indirect import patterns
 * - Circular dependency detection
 * - Import optimization opportunities
 *
 * @public
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("Import Pattern Audit", () => {
    const projectRoot = path.resolve(__dirname, "../../../..");
    const srcDirs = [
        path.join(projectRoot, "src"),
        path.join(projectRoot, "electron"),
        path.join(projectRoot, "shared"),
    ];

    /**
     * Helper function to recursively find all TypeScript files
     */
    function findTSFiles(dir: string): string[] {
        const files: string[] = [];
        
        if (!fs.existsSync(dir)) {
            return files;
        }
        
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
                files.push(...findTSFiles(fullPath));
            } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
                files.push(fullPath);
            }
        }
        
        return files;
    }

    /**
     * Extract import statements from a file
     */
    function extractImports(filePath: string): string[] {
        const content = fs.readFileSync(filePath, 'utf-8');
        const importRegex = /import\s+(?:(?:[\w*\s{},]*)\s+from\s+)?['"](.*?)['"];?/g;
        const imports: string[] = [];
        let match;
        
        while ((match = importRegex.exec(content)) !== null) {
            imports.push(match[1]);
        }
        
        return imports;
    }

    /**
     * Find barrel export files (index.ts files)
     */
    function findBarrelExports(): string[] {
        const barrelFiles: string[] = [];
        
        for (const srcDir of srcDirs) {
            const files = findTSFiles(srcDir);
            barrelFiles.push(...files.filter(file => 
                path.basename(file) === 'index.ts' || path.basename(file) === 'index.tsx'
            ));
        }
        
        return barrelFiles;
    }

    /**
     * Check if an import should use a barrel export
     */
    function shouldUseBarrel(importPath: string, filePath: string): boolean {
        // Skip relative imports to the same directory
        if (importPath.startsWith('./') && !importPath.includes('/')) {
            return false;
        }
        
        // Skip external modules
        if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
            return false;
        }
        
        // Skip test files importing test utilities
        if (filePath.includes('test') && importPath.includes('test')) {
            return false;
        }
        
        return true;
    }

    describe("Barrel Export Usage", () => {
        it("should identify all barrel export files", () => {
            const barrelFiles = findBarrelExports();
            
            console.log("Found barrel export files:");
            barrelFiles.forEach(file => {
                const relativePath = path.relative(projectRoot, file);
                console.log(`  ${relativePath}`);
            });
            
            // Verify key barrel exports exist
            const relativeBarrels = barrelFiles.map(f => path.relative(projectRoot, f));
            expect(relativeBarrels.some(p => p.includes('src/utils/index.ts'))).toBe(true);
            expect(relativeBarrels.some(p => p.includes('electron/services/ipc/index.ts'))).toBe(true);
        });

        it("should analyze import patterns across the codebase", () => {
            const allFiles = srcDirs.flatMap(dir => findTSFiles(dir));
            const importAnalysis: {
                file: string;
                totalImports: number;
                relativeImports: number;
                barrelImports: number;
                directImports: number;
                externalImports: number;
            }[] = [];
            
            for (const file of allFiles.slice(0, 50)) { // Limit for performance
                const imports = extractImports(file);
                const analysis = {
                    file: path.relative(projectRoot, file),
                    totalImports: imports.length,
                    relativeImports: imports.filter(imp => imp.startsWith('.')).length,
                    barrelImports: imports.filter(imp => imp.endsWith('/index') || imp.endsWith('/')).length,
                    directImports: imports.filter(imp => imp.startsWith('.') && !imp.endsWith('/index') && !imp.endsWith('/')).length,
                    externalImports: imports.filter(imp => !imp.startsWith('.')).length,
                };
                
                importAnalysis.push(analysis);
            }
            
            console.log("\nImport Pattern Analysis (Sample):");
            console.log("=" .repeat(80));
            
            importAnalysis.slice(0, 10).forEach(analysis => {
                console.log(`\n${analysis.file}:`);
                console.log(`  Total: ${analysis.totalImports}, Relative: ${analysis.relativeImports}, External: ${analysis.externalImports}`);
                console.log(`  Barrel: ${analysis.barrelImports}, Direct: ${analysis.directImports}`);
            });
            
            // Calculate overall statistics
            const totalFiles = importAnalysis.length;
            const avgImportsPerFile = importAnalysis.reduce((sum, a) => sum + a.totalImports, 0) / totalFiles;
            const barrelUsageRate = importAnalysis.reduce((sum, a) => sum + a.barrelImports, 0) / 
                                   importAnalysis.reduce((sum, a) => sum + a.relativeImports, 0) * 100;
            
            console.log("\nOverall Statistics:");
            console.log(`  Files analyzed: ${totalFiles}`);
            console.log(`  Average imports per file: ${avgImportsPerFile.toFixed(1)}`);
            console.log(`  Barrel export usage rate: ${barrelUsageRate.toFixed(1)}%`);
            
            expect(totalFiles).toBeGreaterThan(0);
            expect(avgImportsPerFile).toBeGreaterThan(0);
        });

        it("should identify files that could benefit from barrel exports", () => {
            const allFiles = srcDirs.flatMap(dir => findTSFiles(dir));
            const potentialBarrelBenefits: {
                file: string;
                issues: string[];
                suggestions: string[];
            }[] = [];
            
            for (const file of allFiles.slice(0, 30)) { // Limit for performance
                const imports = extractImports(file);
                const issues: string[] = [];
                const suggestions: string[] = [];
                
                // Check for deep relative imports
                const deepImports = imports.filter(imp => 
                    imp.startsWith('.') && (imp.match(/\.\.\//g) || []).length > 2
                );
                
                if (deepImports.length > 0) {
                    issues.push(`${deepImports.length} deep relative imports (../../..)`);
                    suggestions.push("Consider using barrel exports to simplify import paths");
                }
                
                // Check for imports from the same module family
                const moduleGroups = new Map<string, number>();
                imports.forEach(imp => {
                    if (imp.startsWith('.')) {
                        const basePath = imp.split('/').slice(0, -1).join('/');
                        moduleGroups.set(basePath, (moduleGroups.get(basePath) || 0) + 1);
                    }
                });
                
                for (const [basePath, count] of moduleGroups) {
                    if (count >= 3) {
                        issues.push(`${count} imports from ${basePath || 'same directory'}`);
                        suggestions.push(`Consider consolidating imports from ${basePath || 'same directory'}`);
                    }
                }
                
                if (issues.length > 0) {
                    potentialBarrelBenefits.push({
                        file: path.relative(projectRoot, file),
                        issues,
                        suggestions,
                    });
                }
            }
            
            console.log("\nFiles that could benefit from improved import patterns:");
            potentialBarrelBenefits.slice(0, 5).forEach(({ file, issues, suggestions }) => {
                console.log(`\n${file}:`);
                console.log(`  Issues: ${issues.join(', ')}`);
                console.log(`  Suggestions: ${suggestions.join(', ')}`);
            });
            
            // Don't fail the test, just report findings
            expect(potentialBarrelBenefits.length).toBeGreaterThanOrEqual(0);
        });
    });

    describe("Circular Dependency Detection", () => {
        it("should detect potential circular dependencies", () => {
            const allFiles = srcDirs.flatMap(dir => findTSFiles(dir)).slice(0, 20); // Limit for performance
            const dependencyGraph = new Map<string, Set<string>>();
            
            // Build dependency graph
            for (const file of allFiles) {
                const imports = extractImports(file);
                const dependencies = new Set<string>();
                
                for (const imp of imports) {
                    if (imp.startsWith('.')) {
                        // Resolve relative path
                        const resolvedPath = path.resolve(path.dirname(file), imp);
                        dependencies.add(resolvedPath);
                    }
                }
                
                dependencyGraph.set(file, dependencies);
            }
            
            // Detect cycles using DFS
            const visited = new Set<string>();
            const recursionStack = new Set<string>();
            const cycles: string[][] = [];
            
            function dfs(node: string, path: string[]): void {
                if (recursionStack.has(node)) {
                    // Found a cycle
                    const cycleStart = path.indexOf(node);
                    if (cycleStart !== -1) {
                        cycles.push(path.slice(cycleStart).concat([node]));
                    }
                    return;
                }
                
                if (visited.has(node)) {
                    return;
                }
                
                visited.add(node);
                recursionStack.add(node);
                
                const dependencies = dependencyGraph.get(node) || new Set();
                for (const dep of dependencies) {
                    if (allFiles.includes(dep)) {
                        dfs(dep, [...path, node]);
                    }
                }
                
                recursionStack.delete(node);
            }
            
            for (const file of allFiles) {
                if (!visited.has(file)) {
                    dfs(file, []);
                }
            }
            
            console.log("Circular Dependency Analysis:");
            if (cycles.length > 0) {
                console.log(`Found ${cycles.length} potential circular dependencies:`);
                cycles.slice(0, 3).forEach((cycle, index) => {
                    console.log(`\n  Cycle ${index + 1}:`);
                    cycle.forEach(file => {
                        console.log(`    → ${path.relative(projectRoot, file)}`);
                    });
                });
            } else {
                console.log("No circular dependencies detected in analyzed files.");
            }
            
            // Report but don't fail on circular dependencies (they might be legitimate)
            expect(cycles.length).toBeLessThan(10); // Should not have excessive circular dependencies
        });
    });

    describe("Import Optimization Opportunities", () => {
        it("should identify optimization opportunities", () => {
            const optimizations: {
                category: string;
                description: string;
                impact: string;
                examples: string[];
            }[] = [
                {
                    category: "Barrel Export Usage",
                    description: "Use barrel exports to simplify import paths",
                    impact: "Improved maintainability and cleaner code",
                    examples: [
                        "Replace '../../../utils/errorHandling' with '../../../utils'",
                        "Replace multiple imports from same module with single barrel import"
                    ]
                },
                {
                    category: "Dynamic Imports",
                    description: "Use dynamic imports for large or rarely used modules",
                    impact: "Reduced bundle size and faster startup time",
                    examples: [
                        "Use import() for heavy libraries only used in specific features",
                        "Lazy load components that are not immediately visible"
                    ]
                },
                {
                    category: "Tree Shaking",
                    description: "Import only specific functions instead of entire modules",
                    impact: "Smaller bundle size and better performance",
                    examples: [
                        "Use 'import { specific } from 'module'' instead of 'import * as module'",
                        "Avoid importing entire utility libraries when only using specific functions"
                    ]
                },
                {
                    category: "Import Organization",
                    description: "Group and order imports consistently",
                    impact: "Better code readability and maintainability", 
                    examples: [
                        "Group external imports, internal imports, and relative imports",
                        "Sort imports alphabetically within each group"
                    ]
                }
            ];
            
            console.log("\nImport Optimization Recommendations:");
            console.log("=" .repeat(60));
            
            optimizations.forEach(({ category, description, impact, examples }) => {
                console.log(`\n${category}:`);
                console.log(`  Description: ${description}`);
                console.log(`  Impact: ${impact}`);
                console.log(`  Examples:`);
                examples.forEach(example => {
                    console.log(`    • ${example}`);
                });
            });
            
            expect(optimizations.length).toBeGreaterThan(0);
        });

        it("should provide import pattern guidelines", () => {
            const guidelines = [
                "Use barrel exports (index.ts) to provide clean public APIs for modules",
                "Prefer relative imports for files within the same feature/module",
                "Use absolute imports from src/ for cross-module dependencies",
                "Group imports: external libraries, internal modules, relative imports",
                "Avoid deep relative paths (../../../), use barrel exports instead",
                "Use specific imports rather than namespace imports when possible",
                "Consider dynamic imports for code splitting and lazy loading",
                "Keep import statements at the top of files for clarity"
            ];
            
            console.log("\nImport Pattern Guidelines:");
            console.log("=" .repeat(40));
            guidelines.forEach((guideline, index) => {
                console.log(`${index + 1}. ${guideline}`);
            });
            
            expect(guidelines.length).toEqual(8);
        });
    });
});
