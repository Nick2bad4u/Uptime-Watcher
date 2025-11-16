---
title: "Chrome DevTools Snippets for Testing"
summary: "Chrome DevTools snippets for adding, listing, and removing test sites in the Uptime Watcher renderer."
created: "2025-10-27"
last_reviewed: "2025-11-15"
category: "guide"
author: "Nick2bad4u"
tags:
  - "uptime-watcher"
  - "devtools"
  - "snippets"
  - "testing"
  - "sites"
---

# Chrome DevTools Snippets for Testing

This document contains useful Chrome DevTools snippets for testing the Uptime Watcher application.

## How to Use These Snippets

1. Open Chrome DevTools (F12 or Right-click → Inspect)
2. Go to the **Sources** tab
3. Click on **Snippets** in the left sidebar (you may need to click the `>>` menu to find it)
4. Click **+ New snippet**
5. Give it a name (e.g., "Add Test Sites" or "Remove All Sites")
6. Paste the code from below
7. Right-click the snippet and select **Run** (or press Ctrl+Enter / Cmd+Enter)

## Snippet 1: Add Test Sites (One of Each Monitor Type)

This snippet adds one site for each supported monitor type with realistic test configurations.

```javascript
/**
 * Add Test Sites - Creates one site for each monitor type
 *
 * Creates test sites with the following monitor types:
 *
 * - HTTP
 * - HTTP Keyword
 * - HTTP Status
 * - HTTP Header
 * - HTTP JSON
 * - HTTP Latency
 * - Port
 * - Ping
 * - DNS
 * - SSL
 * - WebSocket Keepalive
 * - Server Heartbeat
 * - Replication
 * - CDN Edge Consistency
 */
(async () => {
 console.log("🚀 Starting to add test sites...");

 if (!window.electronAPI?.sites?.addSite) {
  console.error("❌ electronAPI.sites.addSite not available");
  return;
 }

 const baseTimestamp = Date.now();
 const sites = [
  {
   identifier: `test-http-${baseTimestamp}`,
   name: "Test HTTP Monitor",
   monitoring: false,
   monitors: [
    {
     id: `monitor-http-${baseTimestamp}`,
     type: "http",
     url: "https://example.com",
     checkInterval: 60000,
     timeout: 10000,
     retryAttempts: 3,
     monitoring: false,
     status: "pending",
     responseTime: 0,
     history: [],
    },
   ],
  },
  {
   identifier: `test-http-keyword-${baseTimestamp}`,
   name: "Test HTTP Keyword Monitor",
   monitoring: false,
   monitors: [
    {
     id: `monitor-http-keyword-${baseTimestamp}`,
     type: "http-keyword",
     url: "https://example.com",
     bodyKeyword: "Example Domain",
     checkInterval: 60000,
     timeout: 10000,
     retryAttempts: 3,
     monitoring: false,
     status: "pending",
     responseTime: 0,
     history: [],
    },
   ],
  },
  {
   identifier: `test-http-status-${baseTimestamp}`,
   name: "Test HTTP Status Monitor",
   monitoring: false,
   monitors: [
    {
     id: `monitor-http-status-${baseTimestamp}`,
     type: "http-status",
     url: "https://example.com",
     expectedStatusCode: 200,
     checkInterval: 60000,
     timeout: 10000,
     retryAttempts: 3,
     monitoring: false,
     status: "pending",
     responseTime: 0,
     history: [],
    },
   ],
  },
  {
   identifier: `test-http-header-${baseTimestamp}`,
   name: "Test HTTP Header Monitor",
   monitoring: false,
   monitors: [
    {
     id: `monitor-http-header-${baseTimestamp}`,
     type: "http-header",
     url: "https://example.com",
     headerName: "content-type",
     expectedHeaderValue: "text/html",
     checkInterval: 60000,
     timeout: 10000,
     retryAttempts: 3,
     monitoring: false,
     status: "pending",
     responseTime: 0,
     history: [],
    },
   ],
  },
  {
   identifier: `test-http-json-${baseTimestamp}`,
   name: "Test HTTP JSON Monitor",
   monitoring: false,
   monitors: [
    {
     id: `monitor-http-json-${baseTimestamp}`,
     type: "http-json",
     url: "https://api.example.com/status",
     jsonPath: "$.status",
     expectedJsonValue: "ok",
     checkInterval: 60000,
     timeout: 10000,
     retryAttempts: 3,
     monitoring: false,
     status: "pending",
     responseTime: 0,
     history: [],
    },
   ],
  },
  {
   identifier: `test-http-latency-${baseTimestamp}`,
   name: "Test HTTP Latency Monitor",
   monitoring: false,
   monitors: [
    {
     id: `monitor-http-latency-${baseTimestamp}`,
     type: "http-latency",
     url: "https://example.com",
     latencyThreshold: 500,
     checkInterval: 60000,
     timeout: 10000,
     retryAttempts: 3,
     monitoring: false,
     status: "pending",
     responseTime: 0,
     history: [],
    },
   ],
  },
  {
   identifier: `test-port-${baseTimestamp}`,
   name: "Test Port Monitor",
   monitoring: false,
   monitors: [
    {
     id: `monitor-port-${baseTimestamp}`,
     type: "port",
     host: "example.com",
     port: 443,
     checkInterval: 60000,
     timeout: 10000,
     retryAttempts: 3,
     monitoring: false,
     status: "pending",
     responseTime: 0,
     history: [],
    },
   ],
  },
  {
   identifier: `test-ping-${baseTimestamp}`,
   name: "Test Ping Monitor",
   monitoring: false,
   monitors: [
    {
     id: `monitor-ping-${baseTimestamp}`,
     type: "ping",
     host: "8.8.8.8",
     checkInterval: 60000,
     timeout: 10000,
     retryAttempts: 3,
     monitoring: false,
     status: "pending",
     responseTime: 0,
     history: [],
    },
   ],
  },
  {
   identifier: `test-dns-${baseTimestamp}`,
   name: "Test DNS Monitor",
   monitoring: false,
   monitors: [
    {
     id: `monitor-dns-${baseTimestamp}`,
     type: "dns",
     hostname: "example.com",
     recordType: "A",
     checkInterval: 60000,
     timeout: 10000,
     retryAttempts: 3,
     monitoring: false,
     status: "pending",
     responseTime: 0,
     history: [],
    },
   ],
  },
  {
   identifier: `test-ssl-${baseTimestamp}`,
   name: "Test SSL Certificate Monitor",
   monitoring: false,
   monitors: [
    {
     id: `monitor-ssl-${baseTimestamp}`,
     type: "ssl",
     hostname: "example.com",
     certificateWarningDays: 30,
     checkInterval: 86400000, // 24 hours
     timeout: 10000,
     retryAttempts: 3,
     monitoring: false,
     status: "pending",
     responseTime: 0,
     history: [],
    },
   ],
  },
  {
   identifier: `test-websocket-${baseTimestamp}`,
   name: "Test WebSocket Monitor",
   monitoring: false,
   monitors: [
    {
     id: `monitor-websocket-${baseTimestamp}`,
     type: "websocket-keepalive",
     url: "wss://echo.websocket.org",
     pingMessage: "ping",
     expectedPongMessage: "ping",
     checkInterval: 60000,
     timeout: 10000,
     retryAttempts: 3,
     monitoring: false,
     status: "pending",
     responseTime: 0,
     history: [],
    },
   ],
  },
  {
   identifier: `test-heartbeat-${baseTimestamp}`,
   name: "Test Server Heartbeat Monitor",
   monitoring: false,
   monitors: [
    {
     id: `monitor-heartbeat-${baseTimestamp}`,
     type: "server-heartbeat",
     serverIdentifier: "test-server-01",
     heartbeatInterval: 60000,
     missedHeartbeatThreshold: 3,
     checkInterval: 60000,
     timeout: 10000,
     retryAttempts: 3,
     monitoring: false,
     status: "pending",
     responseTime: 0,
     history: [],
    },
   ],
  },
  {
   identifier: `test-replication-${baseTimestamp}`,
   name: "Test Replication Lag Monitor",
   monitoring: false,
   monitors: [
    {
     id: `monitor-replication-${baseTimestamp}`,
     type: "replication",
     primaryHost: "primary.db.example.com",
     replicaHost: "replica.db.example.com",
     lagThreshold: 5000,
     checkInterval: 60000,
     timeout: 10000,
     retryAttempts: 3,
     monitoring: false,
     status: "pending",
     responseTime: 0,
     history: [],
    },
   ],
  },
  {
   identifier: `test-cdn-${baseTimestamp}`,
   name: "Test CDN Edge Consistency Monitor",
   monitoring: false,
   monitors: [
    {
     id: `monitor-cdn-${baseTimestamp}`,
     type: "cdn-edge-consistency",
     baselineUrl: "https://origin.example.com/test",
     edgeLocations:
      "https://edge1.cdn.example.com/test\nhttps://edge2.cdn.example.com/test",
     checkInterval: 300000, // 5 minutes
     timeout: 15000,
     retryAttempts: 3,
     monitoring: false,
     status: "pending",
     responseTime: 0,
     history: [],
    },
   ],
  },
 ];

 let successCount = 0;
 let failCount = 0;

 for (const site of sites) {
  try {
   await window.electronAPI.sites.addSite(site);
   console.log(`✅ Added: ${site.name} (${site.monitors[0].type})`);
   successCount++;
  } catch (error) {
   console.error(`❌ Failed to add ${site.name}:`, error);
   failCount++;
  }
 }

 console.log(`\n📊 Summary:`);
 console.log(`   ✅ Successfully added: ${successCount} sites`);
 console.log(`   ❌ Failed: ${failCount} sites`);
 console.log(`\n🎉 Done! Check your dashboard for the new test sites.`);
})();
```

## Snippet 2: Remove All Sites

This snippet removes all sites from the application. **Use with caution!**

```javascript
/**
 * Remove All Sites - Deletes all sites from the database
 *
 * ⚠️ WARNING: This action cannot be undone! This will delete ALL sites and
 * their monitoring history.
 */
(async () => {
 console.log("🗑️  Starting to remove all sites...");

 if (!window.electronAPI?.sites?.deleteAllSites) {
  console.error("❌ electronAPI.sites.deleteAllSites not available");
  return;
 }

 // Confirm before deletion
 const confirmDelete = confirm(
  "⚠️ WARNING: This will delete ALL sites and their data!\n\n" +
   "This action CANNOT be undone.\n\n" +
   "Are you sure you want to continue?"
 );

 if (!confirmDelete) {
  console.log("❌ Operation cancelled by user");
  return;
 }

 try {
  const deletedCount = await window.electronAPI.sites.deleteAllSites();
  console.log(`✅ Successfully deleted ${deletedCount} site(s)`);
  console.log("🎉 All sites have been removed from the database");
 } catch (error) {
  console.error("❌ Failed to delete sites:", error);
 }
})();
```

## Snippet 3: Add Minimal Test Sites (Quick Testing)

A simpler version that adds just a few basic sites for quick testing.

```javascript
/**
 * Add Minimal Test Sites - Adds 3 basic sites for quick testing
 */
(async () => {
 console.log("🚀 Adding minimal test sites...");

 if (!window.electronAPI?.sites?.addSite) {
  console.error("❌ electronAPI.sites.addSite not available");
  return;
 }

 const timestamp = Date.now();
 const sites = [
  {
   identifier: `quick-http-${timestamp}`,
   name: "Quick HTTP Test",
   monitoring: false,
   monitors: [
    {
     id: `monitor-http-${timestamp}`,
     type: "http",
     url: "https://example.com",
     checkInterval: 60000,
     timeout: 10000,
     retryAttempts: 3,
     monitoring: false,
     status: "pending",
     responseTime: 0,
     history: [],
    },
   ],
  },
  {
   identifier: `quick-port-${timestamp}`,
   name: "Quick Port Test",
   monitoring: false,
   monitors: [
    {
     id: `monitor-port-${timestamp}`,
     type: "port",
     host: "example.com",
     port: 443,
     checkInterval: 60000,
     timeout: 10000,
     retryAttempts: 3,
     monitoring: false,
     status: "pending",
     responseTime: 0,
     history: [],
    },
   ],
  },
  {
   identifier: `quick-ping-${timestamp}`,
   name: "Quick Ping Test",
   monitoring: false,
   monitors: [
    {
     id: `monitor-ping-${timestamp}`,
     type: "ping",
     host: "8.8.8.8",
     checkInterval: 60000,
     timeout: 10000,
     retryAttempts: 3,
     monitoring: false,
     status: "pending",
     responseTime: 0,
     history: [],
    },
   ],
  },
 ];

 let count = 0;
 for (const site of sites) {
  try {
   await window.electronAPI.sites.addSite(site);
   console.log(`✅ Added: ${site.name}`);
   count++;
  } catch (error) {
   console.error(`❌ Failed to add ${site.name}:`, error);
  }
 }

 console.log(`\n✅ Added ${count} test site(s)`);
})();
```

## Snippet 4: List All Sites

View all currently configured sites in the console.

```javascript
/**
 * List All Sites - Displays all sites and their monitors
 */
(async () => {
 console.log("📋 Fetching all sites...");

 if (!window.electronAPI?.sites?.getSites) {
  console.error("❌ electronAPI.sites.getSites not available");
  return;
 }

 try {
  const sites = await window.electronAPI.sites.getSites();

  console.log(`\n📊 Total sites: ${sites.length}\n`);

  if (sites.length === 0) {
   console.log("ℹ️  No sites configured");
   return;
  }

  sites.forEach((site, index) => {
   console.log(`${index + 1}. ${site.name} (${site.identifier})`);
   console.log(`   Monitoring: ${site.monitoring ? "✅" : "❌"}`);
   console.log(`   Monitors: ${site.monitors.length}`);

   site.monitors.forEach((monitor, mIndex) => {
    console.log(
     `      ${mIndex + 1}. ${monitor.type} - ${monitor.status || "pending"}`
    );
    if (monitor.url) console.log(`         URL: ${monitor.url}`);
    if (monitor.host)
     console.log(
      `         Host: ${monitor.host}${monitor.port ? ":" + monitor.port : ""}`
     );
   });
   console.log("");
  });
 } catch (error) {
  console.error("❌ Failed to fetch sites:", error);
 }
})();
```

## Tips

- **Run snippets while the app is open**: Make sure the Uptime Watcher application is running and you have DevTools open on the renderer window
- **Check console output**: All snippets provide detailed console output about what they're doing
- **Timestamps**: The "Add Test Sites" snippets use timestamps to ensure unique identifiers
- **Monitoring is disabled**: All test sites are created with `monitoring: false` to prevent automatic checks from starting immediately
- **Test safely**: Use "Add Minimal Test Sites" for quick testing, and save the full suite for comprehensive testing

## Troubleshooting

If the snippets don't work:

1. Make sure you're in the **renderer process** (main app window), not the main process
2. Check that `window.electronAPI` is available by typing it in the console
3. Verify the application is fully loaded before running snippets
4. Check the console for error messages that explain what went wrong
