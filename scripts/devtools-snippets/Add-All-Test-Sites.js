/* eslint-disable */
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

    // @ts-expect-error -- For use after application is running
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
                    maxResponseTime: 500,
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
                    host: "example.com",
                    recordType: "A",
                    expectedValue: "93.184.216.34",
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
                    host: "example.com",
                    port: 443,
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
                    url: "wss://echo.websocket.events",
                    maxPongDelayMs: 5000,
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
                    url: "https://status.example.com/heartbeat",
                    heartbeatExpectedStatus: "ok",
                    heartbeatMaxDriftSeconds: 300,
                    heartbeatStatusField: "status",
                    heartbeatTimestampField: "timestamp",
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
                    primaryStatusUrl:
                        "https://primary.db.example.com/status.json",
                    replicaStatusUrl:
                        "https://replica.db.example.com/status.json",
                    replicationTimestampField: "metrics.replication.timestamp",
                    maxReplicationLagSeconds: 30,
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
            // @ts-expect-error -- For use after application is running
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
