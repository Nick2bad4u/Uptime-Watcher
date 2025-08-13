---
mode: "agent"
tools: ['All Tools']
description: "Review File for quality, correctness, and style. Provide constructive feedback and suggestions for improvement."
---

# Review Instructions

Review the attached or referenced file for the following:

## SOLID Principles

- **Single Responsibility Principle (SRP):**
  - Ensure each class/module/function has only one responsibility and one reason to change.
  - Identify mixed responsibilities and suggest refactoring.

- **Open-Closed Principle (OCP):**
  - Code should be open for extension but closed for modification.
  - Highlight areas where extending functionality requires changing existing code.
  - Propose abstractions or patterns (e.g., strategy, inheritance, composition).

- **Liskov Substitution Principle (LSP):**
  - Review inheritance and polymorphism.
  - Ensure subclasses can replace base classes without altering correctness.
  - Point out violations and provide fixes.

- **Interface Segregation Principle (ISP):**
  - Check interfaces and APIs.
  - Ensure clients are not forced to depend on unused methods.
  - Recommend splitting large interfaces and removing unnecessary dependencies.

- **Dependency Inversion Principle (DIP):**
  - Examine dependencies.
  - High-level modules should not depend on low-level modules; both should depend on abstractions.
  - Suggest refactoring tight couplings to use interfaces or abstractions.

## Bugs

- Identify logic errors, runtime issues, or edge-case bugs.

## Improvements

- Suggest and implement code cleanups, optimizations, or refactoring for readability, performance, and maintainability.

## TSDoc

- Ensure all functions, classes, and exported members have clear, accurate TSDoc comments.
- Fix or add missing/incorrect documentation.

## General Code Quality

- Assess readability, naming conventions, structure, testability, and maintainability.

---

**Plan your fixes in a document before applying them. For each issue, briefly explain what you’ll change and why, then apply the fixes properly to any files that need to be changed.**

- Make the document in `/docs/Reviews/FR.<filename>.md`
- Make a separate document for each file you review.

---

## Special Instructions

- You cannot stop even if it takes a long time to complete.
- You can use as many requests and time as needed to achieve this goal.
- You CANNOT assume any code function without checking its full use. Do not take any shortcuts.
- Do not add any TODOs or comments that are not implemented.
- Do NOT rush to get the task done. Take your time to ensure quality.
- Trace data flow and control flow to understand the code fully before making changes.
