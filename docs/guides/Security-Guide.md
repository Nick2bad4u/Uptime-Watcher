# 🛡️ Security Guide

> **Navigation:** [📖 Docs Home](../) » [📘 Guides](../guides/) » **Security Guide**

Security considerations and best practices for Uptime Watcher.

## 🔒 Security Overview

Uptime Watcher is designed with security and privacy in mind. This guide outlines the security features, potential risks, and best practices for secure usage.

## 🎯 Security Principles

### Privacy by Design

- **Local data storage:** All monitoring data stays on your device
- **No telemetry:** No usage data or analytics collected
- **No accounts required:** No registration or cloud services
- **Open source:** Code is publicly auditable

### Security Features

- **Sandboxed execution:** Electron security features enabled
- **Input validation:** All user inputs are sanitized
- **Secure defaults:** Conservative security settings out of the box
- **Regular updates:** Security patches delivered via app updates

## 🔐 Data Security

### Local Data Storage

All application data is stored locally:

```text
# Storage locations by platform
Windows: %APPDATA%\uptime-watcher\
macOS:   ~/Library/Application Support/uptime-watcher/
Linux:   ~/.local/share/uptime-watcher/

# Data files
sites.db          # Site configurations and monitoring data
settings.json     # Application preferences
logs/            # Application logs
temp/            # Temporary files
```

### Data Encryption

**At Rest:**

- Database files use SQLite's built-in encryption (when available)
- Settings files are stored in JSON format (plain text)
- Logs may contain URLs but no sensitive authentication data

**In Transit:**

- HTTPS sites use TLS encryption
- HTTP sites send unencrypted requests (by design)
- No data transmitted to external services

### Sensitive Information Handling

```typescript
// What is stored vs what is not
interface StoredData {
  // ✅ Stored locally
  siteUrl: string;           // Monitored site URLs
  responseTime: number;      // Performance metrics
  statusHistory: Status[];   // Uptime history
  userSettings: Settings;    // App preferences
  
  // ❌ NOT stored
  userCredentials: never;    // No passwords stored
  personalInfo: never;       // No user data collected
  analyticsData: never;      // No usage tracking
  browserCookies: never;     // No session data
}
```

## 🌐 Network Security

### Outbound Connections

Uptime Watcher only makes network requests to:

1. **Monitored sites:** HTTP/HTTPS requests for uptime checking
2. **Update server:** Checking for app updates (optional)

### HTTP vs HTTPS

```typescript
// Security implications by protocol
const protocolSecurity = {
  https: {
    encryption: "✅ TLS encrypted",
    integrity: "✅ Data integrity verified", 
    privacy: "✅ URLs and data protected",
    recommendation: "Preferred for all sites"
  },
  http: {
    encryption: "❌ Unencrypted",
    integrity: "❌ No integrity verification",
    privacy: "❌ URLs visible to network observers", 
    recommendation: "Avoid when possible"
  }
};
```

### Network Monitoring Risks

**Minimal Risk Scenarios:**

- Monitoring public websites with HTTPS
- Internal network monitoring within trusted networks
- Development environment monitoring

**Higher Risk Scenarios:**

- Monitoring HTTP sites over public networks
- Monitoring sites with sensitive URLs or parameters
- Using on untrusted networks without VPN

## 🔒 Application Security

### Electron Security Features

```typescript
// Security configuration in main process
const securityConfig = {
  webSecurity: true,           // Enable web security
  nodeIntegration: false,      // Disable Node.js in renderer
  contextIsolation: true,      // Isolate contexts
  sandbox: true,              // Enable sandbox mode
  allowRunningInsecureContent: false,
  experimentalFeatures: false
};
```

### IPC Security

```typescript
// Secure IPC implementation
export const secureAPI = {
  // ✅ Whitelisted IPC channels
  allowedChannels: [
    'get-sites',
    'add-site', 
    'update-site',
    'delete-site',
    'get-settings',
    'update-settings'
  ],
  
  // ✅ Input validation on all channels
  validateInput: (channel: string, data: any) => {
    // Sanitize and validate all inputs
  }
};
```

### Code Injection Prevention

```typescript
// Input sanitization examples
class SecurityUtils {
  static sanitizeUrl(url: string): string {
    // Remove dangerous characters and validate format
    const sanitized = url.trim().toLowerCase();
    
    if (!sanitized.match(/^https?:\/\/.+/)) {
      throw new Error('Invalid URL format');
    }
    
    return sanitized;
  }
  
  static validateSiteName(name: string): string {
    // Prevent XSS in site names
    return name.replace(/<[^>]*>/g, '').trim();
  }
}
```

## 🚨 Potential Security Risks

### Low Risk

- **Local data access:** Data readable by other local applications
- **Network visibility:** HTTP requests visible on network
- **Update mechanism:** Potential for update server compromise

### Medium Risk

- **Malicious sites:** Monitoring compromised sites that serve malware
- **Network monitoring:** ISP or network admin visibility into monitored sites
- **File system permissions:** Other applications accessing data files

### Mitigation Strategies

```typescript
// Risk mitigation configuration
const securitySettings = {
  // Limit request exposure
  timeout: 30000,              // Fail fast on suspicious delays
  userAgent: 'Uptime-Watcher/1.0', // Identify legitimate requests
  
  // Note: Advanced features like custom headers, proxy settings,
  // and certificate validation are planned for future releases
};
```

## 🔧 Security Best Practices

### For Users

#### Site Selection

```typescript
// Secure site monitoring practices
const bestPractices = {
  preferred: [
    "https://api.example.com/health",    // HTTPS API endpoints
    "https://example.com/status",        // HTTPS status pages
    "https://example.com"                // HTTPS websites
  ],
  
  avoid: [
    "http://internal.company.com",       // HTTP over public internet
    "https://example.com/admin",         // Admin interfaces
    "https://example.com?token=secret"   // URLs with sensitive data
  ]
};
```

#### Network Security

1. **Use VPN on public networks** when monitoring internal sites
2. **Monitor HTTPS sites whenever possible**
3. **Avoid monitoring sensitive internal services** over public internet
4. **Review monitored URLs regularly** for exposed secrets

#### Data Protection

1. **Regular backups:** Export site configurations
2. **Secure deletion:** Properly delete app data when uninstalling
3. **Access control:** Use OS user permissions to protect data files
4. **Update regularly:** Install security updates promptly

### For Developers

#### Secure Development

```typescript
// Secure coding practices
class SecureDevelopment {
  // Always validate inputs
  static validateSiteData(site: any): Site {
    if (!site.url || typeof site.url !== 'string') {
      throw new Error('Invalid site URL');
    }
    
    return {
      id: this.generateSecureId(),
      url: this.sanitizeUrl(site.url),
      name: this.sanitizeName(site.name),
      interval: this.validateInterval(site.interval)
    };
  }
  
  // Use secure random generation
  static generateSecureId(): string {
    return crypto.randomUUID();
  }
}
```

#### Security Testing

```typescript
// Security test examples
describe('Security Tests', () => {
  test('prevents XSS in site names', () => {
    const maliciousName = '<script>alert("xss")</script>';
    const sanitized = SecurityUtils.validateSiteName(maliciousName);
    expect(sanitized).not.toContain('<script>');
  });
  
  test('validates URL format', () => {
    expect(() => {
      SecurityUtils.sanitizeUrl('javascript:alert("xss")');
    }).toThrow('Invalid URL format');
  });
});
```

## 🔍 Security Monitoring

### Audit Logging

```typescript
// Security-relevant events to log
interface SecurityEvent {
  timestamp: Date;
  type: 'auth' | 'network' | 'data' | 'error';
  severity: 'low' | 'medium' | 'high';
  message: string;
  metadata?: Record<string, any>;
}

// Examples
const securityEvents = [
  {
    type: 'network',
    severity: 'medium',
    message: 'SSL certificate validation failed',
    metadata: { url: 'https://expired.example.com' }
  },
  {
    type: 'data', 
    severity: 'low',
    message: 'Database file accessed',
    metadata: { operation: 'read', table: 'sites' }
  }
];
```

### Anomaly Detection

```typescript
// Monitor for suspicious activity
class SecurityMonitor {
  static detectAnomalies(events: SecurityEvent[]): Alert[] {
    const alerts = [];
    
    // Detect unusual network patterns
    const failureRate = this.calculateFailureRate(events);
    if (failureRate > 0.5) {
      alerts.push({
        type: 'high_failure_rate',
        message: 'Unusually high failure rate detected'
      });
    }
    
    // Detect potential scanning
    const rapidRequests = this.detectRapidRequests(events);
    if (rapidRequests) {
      alerts.push({
        type: 'rapid_requests',
        message: 'Potential automated scanning detected'
      });
    }
    
    return alerts;
  }
}
```

## 🚨 Incident Response

### Data Breach Response

If you suspect data compromise:

1. **Immediate Actions:**
   - Stop the application
   - Disconnect from network if needed
   - Document what happened

2. **Assessment:**
   - Check what data might be affected
   - Review logs for suspicious activity
   - Determine scope of potential access

3. **Recovery:**
   - Reset database if needed
   - Change any exposed credentials
   - Update site configurations

4. **Prevention:**
   - Update to latest version
   - Review security settings
   - Implement additional monitoring

### Reporting Security Issues

For security vulnerabilities:

1. **Do NOT create public issues** for security vulnerabilities
2. **Email security reports** to: [security@your-domain.com]
3. **Include details:** Steps to reproduce, impact assessment
4. **Allow time for fix** before public disclosure

## 🔐 Advanced Security

### Enterprise Deployments

For organizational use:

```typescript
// Enterprise security configuration (planned features)
const enterpriseConfig = {
  // Current settings
  timeout: 30000,
  userAgent: 'Uptime-Watcher/1.0',
  
  // Planned features for future releases:
  // - Network restrictions
  // - Proxy settings  
  // - Certificate management
  // - Audit logging
  // - Custom authentication
};
```

### Compliance Considerations

For regulated environments:

- **Data residency:** All data stored locally (compliant with most regulations)
- **Audit trails:** Comprehensive logging available
- **Access controls:** OS-level user permissions
- **Encryption:** Available for data at rest
- **Data deletion:** Complete removal possible

## 📚 Security Resources

### Documentation

- **[OWASP Electron Security](https://owasp.org/www-project-electron-security/)**
- **[Electron Security Best Practices](https://electronjs.org/docs/tutorial/security)**
- **[Node.js Security Guide](https://nodejs.org/en/docs/guides/security/)**

### Tools

- **Static Analysis:** ESLint security rules
- **Dependency Scanning:** npm audit
- **Certificate Testing:** SSL Labs, testssl.sh
- **Network Analysis:** Wireshark, tcpdump

### Updates

- **Security advisories:** Monitor project releases
- **Dependency updates:** Regular npm updates
- **Electron updates:** Follow Electron security releases

---

## See Also

- [🔧 Troubleshooting Guide](Troubleshooting.md) - Common issues and solutions
- [⚡ Performance Guide](Performance-Guide.md) - Optimization strategies
- [🚀 Developer Guide](Developer-Guide.md) - Development setup
- [📚 API Reference](../api/) - Technical documentation
- [❓ FAQ](FAQ.md) - Frequently asked questions

---

> **Related:** [📖 Documentation Home](../) | [📘 All Guides](../guides/)
