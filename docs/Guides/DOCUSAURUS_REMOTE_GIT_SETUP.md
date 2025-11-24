---
schema: "../../config/schemas/doc-frontmatter.schema.json"
title: "Documentation Style Guide"
summary: "Style and formatting standards for all Markdown documentation in the Uptime Watcher project."
created: "2025-11-23"
last_reviewed: "2025-11-23"
category: "guide"
author: "Nick2bad4u"
tags:
  - "uptime-watcher"
  - "documentation"
  - "docusaurus"
  - "markdown"
topics:
  - "documentation"
---

# Git Subtree Setup Instructions

## What's been done:

1. ✅ Updated `docs/docusaurus/package.json` to point to the correct repository URL: `https://github.com/Nick2bad4u/Uptime-Watcher-Docusaurus.git`
2. ✅ Your root `package.json` already has the git subtree commands configured:
   - `npm run docs:backup` - Push docs/docusaurus to the separate repository
   - `npm run docs:backup:force` - Force push (use with caution)

## Manual Setup Steps:

### 1. Add the Git remote for the docusaurus repository:

```bash
git remote add origin-docs https://github.com/Nick2bad4u/Uptime-Watcher-Docusaurus.git
```

### 2. Verify the remote was added:

```bash
git remote -v
```

You should see both `origin` (your main repo) and `origin-docs` (your docusaurus repo).

### 3. Test the setup by pushing your docs:

```bash
npm run docs:backup
```

## VS Code Setup:

### Option 1: Use VS Code Terminal

1. Open VS Code in your project root
2. Open the integrated terminal (Ctrl+\`)
3. Run the commands above

### Option 2: Use VS Code Git Integration

1. Open the Source Control panel (Ctrl+Shift+G)
2. Click the "..." menu in the Source Control panel
3. You can manage remotes from here, but command line is easier for subtree operations

## How it works:

- The `docs:backup` command uses `git subtree push` to push only the `docs/docusaurus` folder to the separate repository
- This keeps your documentation in sync with a standalone repository that can be deployed independently
- The main repository stays clean and the docs can have their own deployment pipeline

## Troubleshooting:

If you get an error about the remote already existing:

```bash
git remote remove origin-docs
git remote add origin-docs https://github.com/Nick2bad4u/Uptime-Watcher-Docusaurus.git
```

## Testing the setup:

1. Make a small change to a file in `docs/docusaurus`
2. Commit the change to your main repository
3. Run `npm run docs:backup`
4. Check the separate repository to see if the changes were pushed
