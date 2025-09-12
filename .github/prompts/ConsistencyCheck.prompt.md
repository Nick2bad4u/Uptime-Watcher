---
mode: "agent"
tools: ['edit', 'runNotebooks', 'search', 'new', 'runCommands', 'runTasks', 'usages', 'vscodeAPI', 'think', 'problems', 'changes', 'testFailure', 'openSimpleBrowser', 'fetch', 'githubRepo', 'extensions', 'todos', 'runTests', 'sequentialthinking', 'review', 'reviewStaged', 'reviewUnstaged', 'websearch']
description: "Conduct a thorough review of the codebase for consistency"
---

# Codebase Consistency Audit Prompt

## Objective

Perform a comprehensive analysis of the entire codebase to identify and resolve any inconsistencies in logic, data flow, and architectural patterns before implementing new features.

## Analysis Requirements

### 1. Structural Consistency Check

- [ ] Verify uniform implementation of design patterns across all files
- [ ] Identify any divergent architectural approaches (e.g., mixed MVC vs MVVM)
- [ ] Check for consistent layer separation (presentation, business logic, data access)

### 2. Data Flow Audit

- [ ] Map all data pathways and transformations
- [ ] Flag any inconsistent data handling (e.g., different validation approaches for similar data types)
- [ ] Verify uniform error handling patterns for data operations

### 3. Logic Uniformity Review

- [ ] Detect duplicate or similar functions with different implementations
- [ ] Identify business logic that's implemented differently in various components
- [ ] Check for consistent state management approaches

### 4. Interface Consistency

- [ ] Verify API endpoint patterns follow consistent conventions
- [ ] Check for uniform parameter handling and response formats
- [ ] Audit internal component interfaces for consistency

### 5. Inconsistency Detection

- [ ] Highlight areas where similar operations are handled differently
- [ ] Flag any anti-patterns or deviations from established conventions
- [ ] Identify "special case" implementations that should be generalized

## Output Requirements

### 1. Categorized Report

For each inconsistency found:

- File locations
- Specific code snippets
- Description of the inconsistency
- Recommended standardization approach

### 2. Prioritization

Findings should be prioritized by:

- Impact on system stability
- Potential for bugs
- Effect on maintainability

### 3. Improvement Suggestions

For each major inconsistency category:

- A unified approach to adopt
- Required refactoring steps
- Impact analysis of proposed changes

### 4. Roadmap

Create a consistency improvement roadmap with:

- Quick wins (easy fixes with high impact)
- Medium-term standardization projects
- Long-term architectural alignment

## Additional Instructions

- Pay special attention to boundary areas between components/modules
- Consider both horizontal (same-layer) and vertical (cross-layer) consistency
- Don't worry about test files for this task.
- Focus on implementation files only
- Don't worry about minor formatting issues when making changes. (Can always fix with (eslint . --fix))
- Highlight any inconsistencies that might affect upcoming feature work
