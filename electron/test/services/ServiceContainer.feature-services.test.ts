/**
 * @fileoverview ServiceContainer Feature Services Tests  
 * @description Focused tests for feature service creation in ServiceContainer
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { EventEmitter } from 'node:events';
import { ServiceContainer } from '../../services/ServiceContainer.js';

// Create mock TypedEventBus class that extends EventEmitter
class MockTypedEventBus extends EventEmitter {
    public emit(event: string, ...args: any[]): boolean {
        return super.emit(event, ...args);
    }
    public on(event: string, listener: (...args: any[]) => void): this {
        return super.on(event, listener);
    }
    public off(event: string, listener: (...args: any[]) => void): this {
        return super.off(event, listener);
    }
    public addMiddleware = vi.fn();
    public removeMiddleware = vi.fn();
    public clearMiddleware = vi.fn();
    public getMiddleware = vi.fn().mockReturnValue([]);
    public destroy = vi.fn();
}

// Mock the TypedEventBus module
vi.mock('../../events/TypedEventBus.js', () => ({
    TypedEventBus: MockTypedEventBus
}));

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
