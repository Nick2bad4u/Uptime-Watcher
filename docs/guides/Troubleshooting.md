# 🔧 Troubleshooting Guide

> **Navigation:** [📖 Docs Home](../README.md) » [📘 Guides](../README.md#guides) » **Troubleshooting**

Common issues and their solutions for Uptime Watcher.

## 🚨 Common Issues

### Installation Problems

#### Node.js Version Issues

**Problem:** Getting errors during `npm install` or build process.

**Solution:**

```bash
# Check Node.js version
node --version

# Should be 18+ - if not, upgrade Node.js
# Download from: https://nodejs.org/
```

#### SQLite WASM Download Fails

**Problem:** `npm run download-sqlite3-wasm` fails or times out.

**Solution:**

```bash
# Clear npm cache
npm cache clean --force

# Retry download
npm run download-sqlite3-wasm

# Manual download if needed
curl -L https://github.com/sql-js/sql.js/releases/latest/download/sqljs-wasm.zip -o sqljs-wasm.zip
```

### Development Issues

#### Electron Won't Start

**Problem:** `npm run dev:electron` fails or crashes.

**Symptoms:**

- Black screen
- "Main process error" messages
- App crashes immediately

**Solutions:**

```bash
# 1. Rebuild Electron
npm run build:electron

# 2. Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# 3. Check for port conflicts
netstat -tulpn | grep :5173
```

#### Hot Reload Not Working

**Problem:** Changes to React components don't appear immediately.

**Solutions:**

```bash
# 1. Restart Vite dev server
npm run dev

# 2. Clear browser cache (Ctrl+Shift+R in Electron)

# 3. Check for TypeScript errors
npm run type-check
```

#### IPC Communication Errors

**Problem:** Frontend can't communicate with backend.

**Symptoms:**

- "IPC handler not found" errors
- Database operations fail
- Settings don't save

**Solutions:**

```typescript
// 1. Check preload script is loaded
console.log('window.electronAPI:', window.electronAPI);

// 2. Verify IPC channel names match
// In main process:
ipcMain.handle('get-sites', async () => { ... });

// In renderer:
window.electronAPI.getSites();
```

### Database Issues

#### Database File Corruption

**Problem:** App fails to start with database errors.

**Symptoms:**

- "Database is locked" errors
- App crashes on startup
- Data appears missing

**Solutions:**

```bash
# 1. Backup existing data
cp ~/.local/share/uptime-watcher/sites.db ~/.local/share/uptime-watcher/sites.db.backup

# 2. Try database repair
sqlite3 ~/.local/share/uptime-watcher/sites.db ".recover" > recovered.sql
sqlite3 new_sites.db < recovered.sql

# 3. Reset database (CAUTION: Data loss)
rm ~/.local/share/uptime-watcher/sites.db
# App will recreate on next start
```

#### Sites Not Monitoring

**Problem:** Sites show as "Unknown" or never update.

**Symptoms:**

- Status stuck on "Unknown"
- No response time data
- Last checked time doesn't update

**Solutions:**

```bash
# 1. Check network connectivity
ping google.com

# 2. Check firewall/antivirus blocking
# Temporarily disable to test

# 3. Try different monitoring intervals
# Set to 5 minutes in settings

# 4. Check site URL format
# Should include protocol: https://example.com
```

### Build & Distribution Issues

#### Build Fails

**Problem:** `npm run build` or `npm run dist` fails.

**Common Errors:**

```bash
# TypeScript compilation errors
npm run type-check

# ESLint errors
npm run lint

# Missing dependencies
npm install

# Outdated dependencies
npm audit fix
```

#### App Won't Install

**Problem:** Generated installer fails to install.

**Windows Solutions:**

```bash
# Run as administrator
# Disable Windows Defender temporarily
# Check for conflicting software
```

**macOS Solutions:**

```bash
# Allow apps from unidentified developers
sudo spctl --master-disable

# Or sign the app (for distribution)
codesign --force --deep --sign - "Uptime Watcher.app"
```

**Linux Solutions:**

```bash
# Install missing dependencies
sudo apt-get install libgtk-3-0 libxss1 libasound2

# Or use AppImage (no installation required)
chmod +x Uptime-Watcher-*.AppImage
./Uptime-Watcher-*.AppImage
```

## 🐛 Debugging Commands

### General Debugging

```bash
# Check application logs
# Windows: %APPDATA%\uptime-watcher\logs\
# macOS: ~/Library/Logs/uptime-watcher/
# Linux: ~/.local/share/uptime-watcher/logs/

# Enable debug mode
DEBUG=uptime-watcher:* npm run dev:electron

# Check Electron version compatibility
npx electron --version
```

### Frontend Debugging

```bash
# React Developer Tools
# Install browser extension

# Check console for errors
# F12 in Electron app

# Zustand devtools
# Add to store configuration
```

### Backend Debugging

```bash
# Main process debugging
# Add --inspect flag to Electron startup

# Database debugging
sqlite3 ~/.local/share/uptime-watcher/sites.db
.tables
.schema sites
SELECT * FROM sites LIMIT 5;
```

## 📝 Reporting Issues

### Before Reporting

1. **Check existing issues** on GitHub
2. **Try troubleshooting steps** above
3. **Test with minimal configuration**
4. **Gather relevant information**

### Information to Include

```markdown
**Environment:**

- OS: [Windows 11/macOS 14/Ubuntu 22.04]
- Node.js: [version]
- Electron: [version]
- App version: [version]

**Steps to Reproduce:**

1. Step one
2. Step two
3. Error occurs

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Logs:**
[Paste relevant log entries]

**Additional Context:**
Any other relevant information
```

### Log Locations

- **Windows:** `%APPDATA%\uptime-watcher\logs\`
- **macOS:** `~/Library/Logs/uptime-watcher/`
- **Linux:** `~/.local/share/uptime-watcher/logs/`

## 🆘 Emergency Recovery

### Complete Reset

**WARNING:** This will delete all data!

```bash
# 1. Close Uptime Watcher completely

# 2. Remove all app data
# Windows:
rmdir /s "%APPDATA%\uptime-watcher"

# macOS:
rm -rf ~/Library/Application\ Support/uptime-watcher

# Linux:
rm -rf ~/.local/share/uptime-watcher

# 3. Restart the app (will recreate fresh data)
```

### Safe Mode

If the app crashes on startup, try safe mode:

```bash
# Start with minimal configuration
npx electron . --safe-mode

# Or reset just the settings
rm ~/.local/share/uptime-watcher/settings.json
```

## 📞 Getting Help

### Self-Help Resources

1. **Search Documentation:** Check [docs](../README.md) first
2. **Search Issues:** Look in [GitHub Issues](https://github.com/your-repo/issues)
3. **Check Discussions:** Browse [GitHub Discussions](https://github.com/your-repo/discussions)

### Community Support

1. **Create Issue:** [New Bug Report](https://github.com/your-repo/issues/new?template=bug_report.md)
2. **Feature Request:** [New Feature Request](https://github.com/your-repo/issues/new?template=feature_request.md)
3. **Ask Questions:** [Start Discussion](https://github.com/your-repo/discussions)

### Developer Contact

- **GitHub:** [@Nick2bad4u](https://github.com/Nick2bad4u)
- **Issues:** Priority for bug reports and feature requests
- **Discussions:** Best for questions and general help

---

## See Also

- [🚀 Developer Guide](Developer-Guide.md) - Development setup and workflow
- [📚 API Reference](../api/README.md) - Technical API documentation
- [🏗️ Architecture Guide](../architecture/Project-Architecture-Guide.copilotmd) - System design
- [🎨 Theme Usage](Theme-Usage.md) - Theming and customization
- [📖 Documentation Guide](Documentation-Contribution.md) - Contributing to docs

---

> **Related:** [📖 Documentation Home](../README.md) | [📘 All Guides](../README.md#guides)
