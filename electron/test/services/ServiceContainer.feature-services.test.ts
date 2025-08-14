/**
 * @fileoverview ServiceContainer Feature Services Tests  
 * @description Focused tests for feature service creation in ServiceContainer
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { ServiceContainer } from '../../services/ServiceContainer.js';

// Mock the TypedEventBus module with factory function
vi.mock('../../events/TypedEventBus.js', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, unicorn/prefer-module -- Required for mock
    const { EventEmitter } = require("node:events");
    
    return {
        TypedEventBus: vi.fn().mockImplementation((name?: string) => {
            // Create an actual EventEmitter instance
            // eslint-disable-next-line unicorn/prefer-event-target -- Required for Node.js EventEmitter compatibility
            const eventEmitter = new EventEmitter();
            
            // Add TypedEventBus-specific methods
            return Object.assign(eventEmitter, {
                onTyped: vi.fn(),
                emitTyped: vi.fn().mockResolvedValue(undefined),
                busId: name || "test-bus",
                destroy: vi.fn(),
            });
        }),
    };
});

// Mock simple feature services
vi.mock('../../services/notifications/NotificationService.js', () => ({
    NotificationService: vi.fn()
}));

vi.mock('../../services/updater/AutoUpdaterService.js', () => ({
    AutoUpdaterService: vi.fn()
}));

vi.mock('../../services/window/WindowService.js', () => ({
    WindowService: vi.fn()
}));

describe('ServiceContainer - Feature Services', () => {
    let container: ServiceContainer;

    beforeEach(() => {
        ServiceContainer.resetForTesting();
        container = ServiceContainer.getInstance();
    });

    afterEach(() => {
        ServiceContainer.resetForTesting();
    });

    describe('Notification Services', () => {
        it('should create NotificationService singleton', () => {
            expect(() => {
                container.getNotificationService();
            }).not.toThrow();
        });

        it('should create NotificationService with default settings', () => {
            expect(() => {
                container.getNotificationService();
            }).not.toThrow();
        });

        it('should maintain NotificationService singleton pattern', () => {
            const notification1 = container.getNotificationService();
            const notification2 = container.getNotificationService();
            expect(notification1).toBe(notification2);
        });
    });

    describe('Auto Updater Services', () => {
        it('should create AutoUpdaterService singleton', () => {
            expect(() => {
                container.getAutoUpdaterService();
            }).not.toThrow();
        });

        it('should handle AutoUpdaterService initialization', () => {
            const updater = container.getAutoUpdaterService();
            expect(updater).toBeDefined();
        });
    });

    describe('Window Services', () => {
        it('should create WindowService singleton', () => {
            expect(() => {
                container.getWindowService();
            }).not.toThrow();
        });

        it('should maintain WindowService singleton pattern', () => {
            const window1 = container.getWindowService();
            const window2 = container.getWindowService();
            expect(window1).toBe(window2);
        });
    });

    describe('Feature Service Integration', () => {
        it('should create all feature services without conflicts', () => {
            expect(() => {
                container.getNotificationService();
                container.getAutoUpdaterService(); 
                container.getWindowService();
            }).not.toThrow();
        });

        it('should handle service creation without configuration', () => {
            expect(() => {
                container.getNotificationService();
                container.getAutoUpdaterService();
                container.getWindowService();
            }).not.toThrow();
        });

        it('should maintain service independence', () => {
            const notification = container.getNotificationService();
            const updater = container.getAutoUpdaterService();
            const window = container.getWindowService();

            expect(notification).not.toBe(updater);
            expect(updater).not.toBe(window);
            expect(notification).not.toBe(window);
        });
    });

    describe('Service Error Handling', () => {
        it('should handle repeated service creation calls', () => {
            expect(() => {
                for (let i = 0; i < 3; i++) {
                    container.getNotificationService();
                    container.getAutoUpdaterService();
                    container.getWindowService();
                }
            }).not.toThrow();
        });

        it('should maintain service references across multiple calls', () => {
            const notification1 = container.getNotificationService();
            const notification2 = container.getNotificationService();
            const notification3 = container.getNotificationService();

            expect(notification1).toBe(notification2);
            expect(notification2).toBe(notification3);
        });
    });
});
