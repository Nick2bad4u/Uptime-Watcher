## 📁 Recommended Folder Structure

```text
src/
  components/
    Header/
      Header.tsx                # Main app/global header (branding, nav, etc.)
      index.ts                  # (optional) for re-exports
    SiteDetails/
      SiteDetails.tsx           # Main details modal/panel
      SiteDetailsHeader.tsx     # Local header for the details panel (site name, status, screenshot, etc.)
      MonitorControls.tsx       # Controls for interval, check now, start/stop, monitor selector
      OverviewTab.tsx
      AnalyticsTab.tsx
      HistoryTab.tsx
      SettingsTab.tsx
      TimeRangeSelector.tsx
      ResponseTimeLineChart.tsx
      UptimeBarChart.tsx
      UptimeDoughnutChart.tsx
      helpers.ts                # Local utilities for SiteDetails
      index.ts                  # Re-export all subcomponents
    AddSiteForm/
      AddSiteForm.tsx
      index.ts
    StatusIndicator/
      StatusIndicator.tsx
      index.ts
    Themed/
      ThemedBox.tsx
      ThemedText.tsx
      ThemedButton.tsx
      ThemedInput.tsx
      ThemedSelect.tsx
      ThemedCard.tsx
      ThemedBadge.tsx
      ThemedProgress.tsx
      index.ts
    # ...other feature or UI component folders as needed
  hooks/
    useStore.ts
    useTheme.ts
    useSiteAnalytics.ts
    # ...other custom hooks
  theme/
    ThemeManager.ts
    components.tsx
    useTheme.ts
    useThemeClasses.ts
    useStatusColors.ts
    # ...theme utilities
  services/
    logger.ts
    chartConfig.ts
    api.ts
    # ...other backend/data services
  utils/
    format.ts
    analytics.ts
    status.ts
    time.ts
    # ...other shared utilities
  store.ts
  types.ts
  constants.ts
  index.css
  main.tsx
  App.tsx
```

---

## 📝 Refactor Plan (Key Points)

1. **Global Header**:
   - `Header/` is for the main app header only.
   - Used in `App.tsx` or your main layout, not inside `SiteDetails/`.

2. **SiteDetails**:
   - All logic and UI for the site details modal/panel lives in `SiteDetails/`.
   - `SiteDetailsHeader.tsx` is the local header for the details panel (not the global header).
   - Tabs (`OverviewTab`, `AnalyticsTab`, `HistoryTab`, `SettingsTab`) are their own files.
   - Controls and chart components are split for clarity and reusability.

3. **Themed Components**:
   - All theme-aware UI primitives (Box, Text, Button, etc.) live in `Themed/`.

4. **Hooks, Theme, Services, Utils**:
   - Custom hooks in `hooks/`.
   - Theme logic and hooks in `theme/`.
   - Data/services in `services/`.
   - Formatting and helpers in `utils/`.

5. **Index Files**:
   - Use `index.ts` in folders for easy re-exports and cleaner imports.

---

## 🚀 Benefits

- **Separation of concerns**: Global vs. local headers are clearly separated.
- **Scalability**: Easy to add new features, tabs, or UI elements.
- **Maintainability**: Each file/folder has a clear purpose.
- **Reusability**: Themed components and hooks are easy to use across the app.

---

If you want, I can generate the folder structure and stub files for you, or help extract the first subcomponent. Let me know how you’d like to proceed!

