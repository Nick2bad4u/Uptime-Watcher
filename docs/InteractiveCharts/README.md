---
schema: "../../config/schemas/doc-frontmatter.schema.json"
doc_title: "Interactive Architecture Charts"
summary: "Mermaid-based diagrams that visualize Uptime Watcher architecture, workflows, and data models."
created: "2026-02-09"
last_reviewed: "2026-02-09"
doc_category: "guide"
author: "Nick2bad4u"
tags:
 - "uptime-watcher"
 - "documentation"
 - "mermaid"
 - "architecture"
---

# Interactive Architecture Charts

This section contains the Mermaid diagrams used on the documentation site.

These pages are authored in the repository under `docs/InteractiveCharts/` and are **copied into the Docusaurus docs output** via the TypeDoc `projectDocuments` pipeline, so they appear alongside the generated API docs.

## Charts included

- [🏗️ System Architecture](./system-architecture.md)
- [🔄 Monitoring Workflows](./monitoring-workflows.md)
- [🗄️ Data Models](./data-models.md)
- [🚀 Deployment & Infrastructure](./deployment-infrastructure.md)
- [📊 Performance Metrics](./performance-metrics.md)
- [📣 Event System](./event-system.md)
- [🔌 IPC Communication](./ipc-communication.md)
- [🧩 Service Container](./service-container.md)
- [🧯 Error Handling](./error-handling.md)
- [🧪 Testing Architecture](./testing-architecture.md)
- [🧰 Engineering Tooling](./engineering-tooling.md)

## Notes

- Mermaid-heavy MDX pages that used to live under `docs/docusaurus/src/pages/` were migrated here so the diagrams have a single source of truth and can be included in the docs sidebar.
- If you add a new chart, prefer authoring it as a `.md` file with fenced `mermaid` blocks in this folder.
