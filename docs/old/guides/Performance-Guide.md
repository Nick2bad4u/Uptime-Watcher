# ⚡ Performance Optimization Guide

> **Navigation:** [📖 Docs Home](../README) » [📘 Guides](../README.md#guides) » **Performance Guide**

Tips and best practices for optimizing Uptime Watcher performance.

## 🎯 Overview

Uptime Watcher is designed to be lightweight and efficient, but monitoring many sites or using short intervals can impact performance. This guide helps you optimize the app for your specific needs.

## 📊 Performance Factors

### Primary Factors

1. **Number of monitored sites** - More sites = more resources
2. **Check intervals** - Shorter intervals = higher CPU usage
3. **Network latency** - Slow responses affect overall performance
4. **System resources** - Available RAM and CPU capacity
5. **Database size** - Historical data accumulation over time

### Secondary Factors

1. **Background applications** - Other software competing for resources
2. **Network quality** - Unstable connections cause retries
3. **Site complexity** - Heavy sites take longer to load
4. **Error handling** - Failed requests require additional processing

## 🚀 Optimization Strategies

### 1. Monitoring Configuration

#### Optimal Check Intervals

```typescript
// Recommended intervals by use case
const intervals = {
  critical: "1 minute",     // Payment systems, core APIs
  important: "5 minutes",   // Main websites, services
  monitoring: "15 minutes", // Status pages, dashboards
  development: "30 minutes" // Dev/staging environments
};
```

#### Site Grouping Strategy

```typescript
// Group sites by priority and adjust intervals accordingly
const siteGroups = {
  production: {
    interval: "2 minutes",
    sites: ["api.example.com", "app.example.com"]
  },
  staging: {
    interval: "10 minutes", 
    sites: ["staging.example.com", "test.example.com"]
  },
  monitoring: {
    interval: "30 minutes",
    sites: ["status.example.com", "docs.example.com"]
  }
};
```

### 2. Resource Management

#### Memory Optimization

- **Limit historical data:** Keep only necessary data points
- **Regular cleanup:** Remove old/unused sites
- **Database maintenance:** Periodic optimization
- **Close unused tabs:** Minimize Electron renderer overhead

#### CPU Optimization

- **Increase intervals:** Use longer check periods when possible
- **Batch operations:** Group similar tasks together
- **Idle optimization:** Reduce activity when user is away
- **Background throttling:** Lower priority for background tasks

### 3. Network Optimization

#### Request Efficiency

```typescript
// Example: Optimized site checking
interface SiteCheckOptions {
  timeout: number;        // 10-30 seconds recommended
  userAgent: string;      // Consistent user agent
}

const optimizedOptions: SiteCheckOptions = {
  timeout: 15000,         // 15 second timeout
  userAgent: 'Uptime-Watcher/1.0'
};
```

#### Concurrent Request Management

```typescript
// Limit concurrent requests to prevent overwhelming
const performanceConfig = {
  maxConcurrentChecks: 10,     // Max simultaneous requests
  requestDelay: 100,           // Delay between requests (ms)
  retryDelay: 5000,           // Delay before retry (ms)
  maxRetries: 2               // Maximum retry attempts
};
```

### 4. Database Optimization

#### Data Retention Strategy

```sql
-- Example: Automatic data cleanup
DELETE FROM response_times 
WHERE timestamp < datetime('now', '-30 days');

DELETE FROM status_changes 
WHERE timestamp < datetime('now', '-90 days');

-- Keep only essential historical data
DELETE FROM detailed_logs 
WHERE timestamp < datetime('now', '-7 days');
```

#### Index Optimization

```sql
-- Ensure proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_response_times_site_timestamp 
ON response_times(site_id, timestamp);

CREATE INDEX IF NOT EXISTS idx_status_changes_site_timestamp 
ON status_changes(site_id, timestamp);
```

## 🔧 Configuration Examples

### Lightweight Configuration

For minimal resource usage:

```json
{
  "monitoring": {
    "defaultInterval": "15 minutes",
    "maxConcurrentChecks": 5,
    "timeout": 10000
  },
  "data": {
    "retentionDays": 14,
    "maxResponseTimeEntries": 1000
  },
  "ui": {
    "updateFrequency": "30 seconds",
    "chartAnimations": false,
    "autoRefresh": false
  }
}
```

### Balanced Configuration

For general use:

```json
{
  "monitoring": {
    "defaultInterval": "5 minutes",
    "maxConcurrentChecks": 10,
    "timeout": 15000
  },
  "data": {
    "retentionDays": 30,
    "maxResponseTimeEntries": 5000
  },
  "ui": {
    "updateFrequency": "10 seconds",
    "chartAnimations": true,
    "autoRefresh": true
  }
}
```

### High-Performance Configuration

For monitoring many sites:

```json
{
  "monitoring": {
    "defaultInterval": "2 minutes",
    "maxConcurrentChecks": 20,
    "timeout": 20000,
    "staggeredChecks": true
  },
  "data": {
    "retentionDays": 60,
    "maxResponseTimeEntries": 10000,
    "compressionEnabled": true
  },
  "ui": {
    "updateFrequency": "5 seconds",
    "chartAnimations": true,
    "autoRefresh": true,
    "virtualScrolling": true
  }
}
```

## 📈 Performance Monitoring

### Built-in Metrics

Monitor these performance indicators:

```typescript
interface PerformanceMetrics {
  // System metrics
  memoryUsage: number;        // MB
  cpuUsage: number;          // Percentage
  responseTime: number;       // Average response time
  
  // Application metrics
  activeSites: number;        // Currently monitored
  checksPerMinute: number;    // Request frequency
  errorRate: number;         // Failed checks percentage
  
  // Database metrics
  databaseSize: number;       // MB
  queryTime: number;         // Average query time
  recordCount: number;       // Total records
}
```

### Performance Alerts

Set up alerts for performance issues:

```typescript
const performanceThresholds = {
  memoryUsage: 500,          // MB - Alert if over 500MB
  cpuUsage: 80,             // % - Alert if over 80%
  avgResponseTime: 10000,    // ms - Alert if over 10s
  errorRate: 20,            // % - Alert if over 20% errors
  databaseSize: 1000        // MB - Alert if over 1GB
};
```

## 🛠️ Troubleshooting Performance Issues

### High Memory Usage

**Symptoms:**

- App becomes sluggish
- System slowdown
- Memory warnings

**Solutions:**

1. **Reduce data retention:**

   ```bash
   # In app settings
   Data Retention: 14 days (instead of 30+)
   Max Response Time Entries: 1000 (instead of 5000+)
   ```

2. **Optimize database:**

   ```sql
   VACUUM;  -- Reclaim unused space
   REINDEX; -- Rebuild indexes
   ```

3. **Restart the app periodically** to clear memory leaks

### High CPU Usage

**Symptoms:**

- Fan noise increases
- System becomes unresponsive
- App feels slow

**Solutions:**

1. **Increase check intervals:**

   ```bash
   # Change from 1 minute to 5 minutes
   Monitoring Interval: 5 minutes
   ```

2. **Reduce concurrent checks:**

   ```bash
   # Lower concurrent requests
   Max Concurrent Checks: 5 (instead of 20)
   ```

3. **Remove unnecessary sites** from monitoring

### Slow Response Times

**Symptoms:**

- Sites take long to update
- Status changes are delayed
- UI feels unresponsive

**Solutions:**

1. **Check network connectivity:**

   ```bash
   ping google.com
   traceroute example.com
   ```

2. **Increase timeouts:**

   ```bash
   # In settings
   Request Timeout: 30 seconds (instead of 10)
   ```

3. **Use HEAD requests** instead of GET when possible

### Database Performance Issues

**Symptoms:**

- App startup is slow
- Data queries take too long
- Frequent "database locked" errors

**Solutions:**

1. **Database maintenance:**

   ```sql
   -- Run periodically
   VACUUM;
   ANALYZE;
   REINDEX;
   ```

2. **Reduce data retention:**

   ```bash
   # Keep less historical data
   Response Time Data: 7 days
   Status Change Data: 30 days
   ```

3. **Consider database reset** for corrupted files

## 🎛️ Advanced Optimization

### Custom Monitoring Strategies

#### Intelligent Intervals

```typescript
// Adjust intervals based on site reliability
class AdaptiveMonitoring {
  calculateInterval(site: Site): number {
    const reliability = site.uptimePercentage;
    
    if (reliability > 99.9) {
      return 15 * 60; // 15 minutes for very reliable sites
    } else if (reliability > 99.0) {
      return 5 * 60;  // 5 minutes for reliable sites
    } else {
      return 2 * 60;  // 2 minutes for unreliable sites
    }
  }
}
```

#### Load Distribution

```typescript
// Distribute checks across time to avoid spikes
class LoadDistribution {
  staggerChecks(sites: Site[]): Site[] {
    const delayPerSite = 1000; // 1 second between sites
    
    return sites.map((site, index) => ({
      ...site,
      nextCheck: Date.now() + (index * delayPerSite)
    }));
  }
}
```

### Caching Strategies

```typescript
// Cache responses to reduce redundant requests
interface CacheConfig {
  ttl: number;              // Time to live (seconds)
  maxSize: number;          // Maximum cache entries
  strategy: 'lru' | 'fifo'; // Eviction strategy
}

const cacheConfig: CacheConfig = {
  ttl: 300,        // 5 minutes
  maxSize: 1000,   // 1000 entries
  strategy: 'lru'  // Least recently used
};
```

## 📊 Performance Benchmarks

### Typical Performance Characteristics

| Sites | Interval | Memory | CPU | Network |
|-------|----------|--------|-----|---------|
| 10    | 5 min    | 150MB  | 2%  | Low     |
| 50    | 5 min    | 250MB  | 5%  | Medium  |
| 100   | 5 min    | 400MB  | 10% | Medium  |
| 200   | 5 min    | 600MB  | 20% | High    |
| 500   | 5 min    | 1GB    | 40% | High    |

### Scaling Recommendations

```typescript
// Recommended configurations by scale
const scalingGuide = {
  small: {        // 1-25 sites
    interval: "5 minutes",
    concurrent: 5,
    retention: "30 days"
  },
  medium: {       // 25-100 sites
    interval: "10 minutes", 
    concurrent: 10,
    retention: "30 days"
  },
  large: {        // 100-500 sites
    interval: "15 minutes",
    concurrent: 20,
    retention: "14 days"
  },
  enterprise: {   // 500+ sites
    interval: "30 minutes",
    concurrent: 50,
    retention: "7 days"
  }
};
```

## 📝 Performance Checklist

### Daily Maintenance

- [ ] Check memory usage
- [ ] Review error rates
- [ ] Verify all sites are responding
- [ ] Monitor CPU usage during peak times

### Weekly Maintenance

- [ ] Clean up old/unused sites
- [ ] Review and adjust check intervals
- [ ] Check database size and performance
- [ ] Update site configurations as needed

### Monthly Maintenance

- [ ] Database vacuum and optimization
- [ ] Performance metrics review
- [ ] Configuration optimization
- [ ] Update check for performance improvements

## 📞 Performance Support

If you experience persistent performance issues:

1. **Check system resources** - Ensure adequate RAM/CPU
2. **Review configuration** - Use recommended settings
3. **Update the app** - Latest versions have optimizations
4. **Report issues** - Help improve performance for everyone

---

## See Also

- [🔧 Troubleshooting Guide](Troubleshooting) - Common issues and solutions
- [🚀 Developer Guide](Developer-Guide) - Development setup and workflow
- [📚 API Reference](../api/README) - Technical documentation
- [🏗️ Architecture Guide](../architecture/Project-Architecture-Guide.copilotmd) - System design
- [❓ FAQ](FAQ) - Frequently asked questions

---

> **Related:** [📖 Documentation Home](../README) | [📘 All Guides](../README.md#guides)
