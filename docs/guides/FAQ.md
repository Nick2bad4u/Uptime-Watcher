# ❓ Frequently Asked Questions (FAQ)

> **Navigation:** [📖 Docs Home](../README) » [📘 Guides](../README.md#guides) » **FAQ**

Common questions and answers about Uptime Watcher.

## 🚀 Getting Started

### What is Uptime Watcher?

Uptime Watcher is a desktop application that monitors the availability and response times of websites. It runs on Windows, macOS, and Linux, providing real-time notifications when sites go down or come back online.

### What are the system requirements?

- **Operating System:** Windows 10+, macOS 10.15+, or Linux (most distributions)
- **Memory:** 4GB RAM minimum, 8GB recommended
- **Storage:** 500MB free space
- **Network:** Internet connection for monitoring sites

### How do I install Uptime Watcher?

1. Download the installer for your platform from [Releases](https://github.com/Nick2bad4u/Uptime-Watcher/releases)
2. Run the installer and follow the setup wizard
3. Launch the application from your applications folder or start menu

### Is Uptime Watcher free?

Yes, Uptime Watcher is completely free and open-source under the MIT license.

## 🔧 Usage Questions

### How many sites can I monitor?

There's no hard limit, but for optimal performance:

- **Light usage:** 1-50 sites
- **Moderate usage:** 50-200 sites
- **Heavy usage:** 200+ sites (may require adjusting check intervals)

### What monitoring intervals are available?

You can set monitoring intervals from:

- **Minimum:** 5 seconds
- **Maximum:** 30 days
- **Recommended:** 5 minutes for most use cases

### Does it work with HTTPS sites?

Yes, Uptime Watcher supports both HTTP and HTTPS protocols. HTTPS sites are fully supported with proper SSL certificate validation.

### Can I monitor sites behind authentication?

Authentication support is planned for future releases. Currently, only sites accessible without authentication are supported.

### Does it monitor localhost/internal sites?

Yes, you can monitor:

- Local development servers (`http://localhost:3000`)
- Internal network services (`http://192.168.1.100`)
- Intranet sites

## 📊 Data and Storage

### Where is my data stored?

Data is stored locally on your device:

- **Windows:** `%APPDATA%\uptime-watcher\`
- **macOS:** `~/Library/Application Support/uptime-watcher/`
- **Linux:** `~/.local/share/uptime-watcher/`

### Is my data sent to external servers?

No, all monitoring and data storage happens locally on your device. The app only makes HTTP requests to the sites you're monitoring.

### How long is historical data kept?

By default:

- **Response time data:** 30 days
- **Status changes:** 90 days
- **Settings:** Indefinitely until manually cleared

You can adjust these settings in the app preferences.

### Can I export my data?

Yes, you can export:

- Site configurations (JSON format)
- Historical data (CSV format)
- Settings backup (JSON format)

Export options are available in Settings → Data Management.

## 🔔 Notifications

### What types of notifications are available?

- **Desktop notifications:** Native OS notifications
- **System tray alerts:** Icon color changes and tooltips
- **In-app notifications:** Visual indicators in the interface

### Can I customize notification settings?

Yes, you can configure:

- **When to notify:** Down only, up only, or both
- **Notification frequency:** Immediate, daily digest, or disabled
- **Sound alerts:** Enable/disable notification sounds
- **Quiet hours:** Disable notifications during specific times

### Why am I not receiving notifications?

Check these common issues:

1. **OS permissions:** Ensure the app has notification permissions
2. **Notification settings:** Verify notifications are enabled in app settings
3. **Focus modes:** Check if OS focus/do-not-disturb mode is active
4. **Network connectivity:** Ensure the app can reach monitored sites

## 🎨 Customization

### Can I change the app theme?

Yes, Uptime Watcher supports:

- **Light theme:** Clean, bright interface
- **Dark theme:** Easy on the eyes for low-light environments
- **System theme:** Automatically matches your OS theme setting

### Can I customize the interface?

Current customization options include:

- **Theme selection:** Light/dark/system
- **Dashboard layout:** Grid or list view
- **Chart types:** Line charts, bar charts, or simple indicators
- **Time ranges:** Various historical data views

More customization options are planned for future releases.

## 🔧 Technical Questions

### What technology stack is used?

- **Frontend:** React + TypeScript + Tailwind CSS
- **Desktop Framework:** Electron
- **Database:** SQLite (via sql.js WASM)
- **State Management:** Zustand
- **Build Tool:** Vite

### Can I contribute to the project?

Absolutely! Contributions are welcome:

1. **Bug reports:** [Create an issue](https://github.com/Nick2bad4u/Uptime-Watcher/issues)
2. **Feature requests:** [Start a discussion](https://github.com/Nick2bad4u/Uptime-Watcher/discussions)
3. **Code contributions:** [Submit a pull request](https://github.com/Nick2bad4u/Uptime-Watcher/pulls)
4. **Documentation:** Help improve guides and API docs

See the [Contributing Guide](../guides/Developer-Guide.md#contributing) for details.

### How do I build from source?

```bash
# Clone the repository
git clone https://github.com/Nick2bad4u/Uptime-Watcher/uptime-watcher.git
cd uptime-watcher

# Install dependencies
npm install

# Download SQLite WASM
npm run download-sqlite3-wasm

# Start development
npm run dev

# Build for production
npm run build && npm run dist
```

### Can I run it on a server?

Uptime Watcher is designed as a desktop application. For server monitoring, consider:

- **Headless mode:** Planned for future releases
- **Alternative tools:** Nagios, Zabbix, or Prometheus for server environments

## 🛡️ Security and Privacy

### Is my monitoring data secure?

Yes:

- **Local storage:** All data stays on your device
- **No telemetry:** The app doesn't send usage data anywhere
- **No accounts:** No registration or cloud services required
- **Open source:** Code is publicly auditable

### What network requests does the app make?

The app only makes HTTP/HTTPS requests to:

1. **Sites you're monitoring:** For uptime checks
2. **Update servers:** When checking for app updates (optional)

No other network requests are made.

### Can I use it offline?

Partial offline functionality:

- **View historical data:** ✅ Available offline
- **Modify settings:** ✅ Available offline
- **Add/edit sites:** ✅ Available offline
- **Active monitoring:** ❌ Requires internet connection

## 🐛 Troubleshooting

### The app won't start

Common solutions:

1. **Restart your computer** and try again
2. **Run as administrator** (Windows) or with sudo (Linux)
3. **Check antivirus software** - add app to exceptions
4. **Reinstall the application** with a fresh download

### Sites show as "Unknown" status

This usually indicates:

1. **Network connectivity issues:** Check your internet connection
2. **Firewall blocking:** Ensure the app can make outbound requests
3. **Invalid URL format:** URLs should include protocol (https://)
4. **Site blocking requests:** Some sites block automated requests

### High CPU usage

To reduce CPU usage:

1. **Increase check intervals:** Use 5+ minutes instead of 30 seconds
2. **Reduce monitored sites:** Remove unused or duplicate sites
3. **Close other applications:** Free up system resources
4. **Check for updates:** Newer versions may have performance improvements

### Database errors

If you see database errors:

1. **Restart the app** - often resolves temporary issues
2. **Check disk space** - ensure adequate free storage
3. **Reset database** - see [Troubleshooting Guide](Troubleshooting.md#database-issues)

## 📱 Platform-Specific

### Windows

#### Windows Defender flags the app as suspicious

This is common with new Electron apps. The installer is not yet code-signed. You can:

1. Add an exception in Windows Defender
2. Download from official sources only
3. Build from source code if concerned

#### App doesn't start after Windows update

Try reinstalling the app or running Windows compatibility troubleshooter.

### macOS

#### "App can't be opened because it's from an unidentified developer"

Right-click the app and select "Open" to bypass Gatekeeper, or run:

```bash
sudo spctl --master-disable
```

#### Permission errors on macOS

The app may need permissions for:

- **Network access:** Usually granted automatically
- **Notifications:** Check System Preferences → Notifications

### Linux

#### Missing dependencies error

Install required libraries:

```bash
# Ubuntu/Debian
sudo apt-get install libgtk-3-0 libxss1 libasound2

# CentOS/RHEL
sudo yum install gtk3 libXScrnSaver alsa-lib

# Fedora
sudo dnf install gtk3 libXScrnSaver alsa-lib
```

#### AppImage won't run

Make it executable:

```bash
chmod +x Uptime-Watcher-*.AppImage
./Uptime-Watcher-*.AppImage
```

## 💡 Tips and Best Practices

### Monitoring Strategy

1. **Start small:** Begin with 5-10 critical sites
2. **Use appropriate intervals:** 5 minutes for most sites, 1 minute for critical services
3. **Group related sites:** Use descriptive names and organize logically
4. **Monitor from user perspective:** Use end-user URLs, not server endpoints

### Performance Optimization

1. **Adjust check intervals:** Longer intervals = less resource usage
2. **Monitor fewer sites:** Quality over quantity
3. **Close when not needed:** App continues monitoring in system tray
4. **Regular maintenance:** Periodically clean up old/unused sites

### Reliability Tips

1. **Test URLs first:** Verify sites are accessible before adding
2. **Use HTTPS when available:** More secure and often more reliable
3. **Monitor CDN endpoints:** Some sites use multiple endpoints
4. **Check during maintenance:** Temporarily disable monitoring during planned maintenance

## 📞 Still Need Help?

If your question isn't answered here:

1. **Check the guides:** Browse other [documentation](../README)
2. **Search existing issues:** Look through [GitHub Issues](https://github.com/Nick2bad4u/Uptime-Watcher/issues)
3. **Ask the community:** Start a [GitHub Discussion](https://github.com/Nick2bad4u/Uptime-Watcher/discussions)
4. **Report a bug:** Create a [new issue](https://github.com/Nick2bad4u/Uptime-Watcher/issues/new)

---

## See Also

- [🚀 Developer Guide](Developer-Guide/) - Setup and development workflow
- [🔧 Troubleshooting Guide](Troubleshooting/) - Common issues and solutions
- [📚 API Reference](../api/README) - Technical documentation
- [🏗️ Architecture Guide](../architecture/Project-Architecture-Guide.copilotmd) - System design
- [📖 Documentation Guide](Documentation-Contribution/) - Contributing to docs

---

> **Related:** [📖 Documentation Home](../README) | [📘 All Guides](../README.md#guides)
