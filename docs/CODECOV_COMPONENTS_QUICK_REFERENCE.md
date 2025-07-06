# Codecov Components Quick Reference

## Component ID Reference

| Component ID                | Display Name             | Coverage Target | Main Focus            |
| --------------------------- | ------------------------ | --------------- | --------------------- |
| `frontend_ui_components`    | UI Components            | 80%/75%         | React components      |
| `frontend_state_management` | State Management         | 85%/80%         | Zustand stores        |
| `frontend_services`         | Frontend Services        | 80%/75%         | Business logic        |
| `frontend_hooks`            | React Hooks              | 80%/75%         | Custom hooks          |
| `frontend_utils`            | Frontend Utils           | 85%/80%         | Pure functions        |
| `backend_core_services`     | Core Backend Services    | 90%/85%         | Backend services      |
| `backend_managers`          | Domain Managers          | 90%/85%         | High-level managers   |
| `backend_orchestrator`      | Uptime Orchestrator      | 95%/90%         | Core monitoring       |
| `backend_utils`             | Backend Utils            | 85%/80%         | Backend utilities     |
| `database_layer`            | Database Layer           | 95%/90%         | Database operations   |
| `monitoring_engine`         | Monitoring Engine        | 90%/85%         | Monitoring logic      |
| `ipc_communication`         | IPC Communication        | 90%/85%         | Frontend-backend comm |
| `site_management`           | Site Management          | 85%/80%         | Site CRUD operations  |
| `settings_configuration`    | Settings & Configuration | 85%/80%         | App configuration     |
| `dashboard_analytics`       | Dashboard & Analytics    | 80%/75%         | Dashboard & stats     |
| `error_handling`            | Error Handling           | 90%/85%         | Error management      |
| `theme_system`              | Theme System             | 75%/70%         | App theming           |
| `type_definitions`          | Type Definitions         | 70%/65%         | TypeScript types      |
| `constants`                 | Constants                | 70%/65%         | Application constants |

## Path Patterns

### Frontend Components

- `src/components/**` - All React components
- `src/stores/**` - Zustand state management
- `src/services/**` - Frontend business logic
- `src/hooks/**` - Custom React hooks
- `src/utils/**` - Frontend utilities

### Backend Components

- `electron/services/**` - All backend services
- `electron/managers/**` - Domain managers
- `electron/UptimeOrchestrator.ts` - Core orchestrator
- `electron/utils/**` - Backend utilities
- `electron/preload.ts` - IPC preload script

### Cross-Cutting Components

- `**/error*` - Error handling files
- `**/types/**` - Type definition files
- `src/types.ts`, `electron/types.ts` - Main type files
- `src/constants.ts`, `electron/constants.ts` - Constants

## Coverage Targets Explained

- **Project Coverage**: Overall coverage for the component
- **Patch Coverage**: Coverage for new changes in PRs

Format: `Project%/Patch%`

## High-Priority Components (90%+ Coverage)

1. **Uptime Orchestrator** (95%/90%) - Core monitoring functionality
2. **Database Layer** (95%/90%) - Data persistence
3. **Backend Services** (90%/85%) - Critical infrastructure
4. **Domain Managers** (90%/85%) - Business logic orchestration
5. **Monitoring Engine** (90%/85%) - Core feature implementation
6. **IPC Communication** (90%/85%) - Frontend-backend bridge
7. **Error Handling** (90%/85%) - User experience critical

## Medium-Priority Components (80-89% Coverage)

1. **Frontend State Management** (85%/80%) - Application state
2. **Frontend Utils** (85%/80%) - Pure utility functions
3. **Backend Utils** (85%/80%) - Backend helpers
4. **Site Management** (85%/80%) - Core feature UI/logic
5. **Settings Configuration** (85%/80%) - App configuration
6. **UI Components** (80%/75%) - User interface
7. **Frontend Services** (80%/75%) - Business logic
8. **React Hooks** (80%/75%) - Reusable logic
9. **Dashboard Analytics** (80%/75%) - Data visualization

## Lower-Priority Components (70-79% Coverage)

1. **Theme System** (75%/70%) - Styling and theming
2. **Type Definitions** (70%/65%) - TypeScript interfaces
3. **Constants** (70%/65%) - Application constants

## Usage in Pull Requests

When you create a PR, you'll see:

- Component-specific coverage changes
- Status checks for each component
- Coverage impact breakdown by functional area
- Recommendations for testing focus areas

## Enabling Component Analytics

1. Go to your Codecov dashboard
2. Navigate to the Components tab
3. Click "Enable Component Analytics"
4. Wait for historical data backfill
5. Start monitoring component coverage trends

## Best Practices

- Focus testing effort on high-priority components
- Use component coverage to identify undertested areas
- Cross-reference component coverage with feature development
- Adjust targets based on real-world testing difficulty
- Monitor trends to catch coverage regression early
