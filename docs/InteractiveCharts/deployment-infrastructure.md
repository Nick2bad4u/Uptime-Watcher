---
schema: "../../config/schemas/doc-frontmatter.schema.json"
doc_title: "Deployment & Infrastructure"
summary: "Deployment architecture diagrams and release pipeline overview."
created: "2026-02-09"
last_reviewed: "2026-02-09"
doc_category: "guide"
author: "Nick2bad4u"
tags:
 - "uptime-watcher"
 - "deployment"
 - "ci"
 - "release"
 - "mermaid"
slug: "/deployment-infrastructure"
sidebar_label: "🚀 Deployment & Infrastructure"
---

# Deployment & Infrastructure

This page documents the _documentation site’s_ high-level deployment model (GitHub Pages) and how the desktop app is distributed.

It’s meant as a conceptual map for contributors so we keep build/release assumptions consistent.

## Deployment Architecture

```mermaid
graph TB
  subgraph "Client Environment"
    Desktop[Desktop Application<br/>Electron + React]
    LocalDB[(Local SQLite Database)]
    Config[Configuration Files]
  end

  subgraph "Distribution"
    GitHub[GitHub Releases]
    AutoUpdater[Auto Updater Service]
    CDN[Content Delivery Network]
  end

  Desktop --> LocalDB
  Desktop --> Config

  Desktop --> AutoUpdater
  AutoUpdater --> GitHub
  GitHub --> CDN
```
