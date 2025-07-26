import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TypedEventBus } from '../../events/TypedEventBus';

// Create a simple test event map
interface TestEvents extends Record<string, unknown> {
  'test-event': { data: string };
  'another-event': { value: number };
}

describe('TypedEventBus', () => {
  let eventBus: TypedEventBus<TestEvents>;

  beforeEach(() => {
    eventBus = new TypedEventBus<TestEvents>();
  });

  describe('basic functionality', () => {
    it('should create an instance without error', () => {
      expect(eventBus).toBeInstanceOf(TypedEventBus);
    });

    it('should emit and listen to events', () => {
      const listener = vi.fn();
      
      eventBus.on('test-event', listener);
      eventBus.emit('test-event', { data: 'test' });
      
      expect(listener).toHaveBeenCalledWith({ data: 'test' });
    });

    it('should support multiple listeners for the same event', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      
      eventBus.on('test-event', listener1);
      eventBus.on('test-event', listener2);
      eventBus.emit('test-event', { data: 'test' });
      
      expect(listener1).toHaveBeenCalledWith({ data: 'test' });
      expect(listener2).toHaveBeenCalledWith({ data: 'test' });
    });

    it('should remove listeners', () => {
      const listener = vi.fn();
      
      eventBus.on('test-event', listener);
      eventBus.off('test-event', listener);
      eventBus.emit('test-event', { data: 'test' });
      
      expect(listener).not.toHaveBeenCalled();
    });

    it('should support once listeners', () => {
      const listener = vi.fn();
      
      eventBus.once('test-event', listener);
      eventBus.emit('test-event', { data: 'test1' });
      eventBus.emit('test-event', { data: 'test2' });
      
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith({ data: 'test1' });
    });

    it('should handle different event types', () => {
      const testListener = vi.fn();
      const anotherListener = vi.fn();
      
      eventBus.on('test-event', testListener);
      eventBus.on('another-event', anotherListener);
      
      eventBus.emit('test-event', { data: 'test' });
      eventBus.emit('another-event', { value: 42 });
      
      expect(testListener).toHaveBeenCalledWith({ data: 'test' });
      expect(anotherListener).toHaveBeenCalledWith({ value: 42 });
    });
  });

  describe('error handling', () => {
    it('should handle listener errors gracefully', () => {
      const errorListener = vi.fn(() => {
        throw new Error('Listener error');
      });
      const normalListener = vi.fn();

      eventBus.on('test-event', errorListener);
      eventBus.on('test-event', normalListener);

      // Should not throw even if a listener throws
      expect(() => {
        eventBus.emit('test-event', { data: 'test' });
      }).not.toThrow();

      expect(errorListener).toHaveBeenCalled();
      expect(normalListener).toHaveBeenCalled();
    });
  });

  describe('event introspection', () => {
    it('should provide listener count', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      eventBus.on('test-event', listener1);
      eventBus.on('test-event', listener2);

      expect(eventBus.listenerCount('test-event')).toBe(2);
    });

    it('should provide event names', () => {
      eventBus.on('test-event', vi.fn());
      eventBus.on('another-event', vi.fn());

      const eventNames = eventBus.eventNames();
      expect(eventNames).toContain('test-event');
      expect(eventNames).toContain('another-event');
    });

    it('should provide max listeners setting', () => {
      const maxListeners = eventBus.getMaxListeners();
      expect(typeof maxListeners).toBe('number');
      expect(maxListeners).toBeGreaterThan(0);
    });

    it('should allow setting max listeners', () => {
      eventBus.setMaxListeners(20);
      expect(eventBus.getMaxListeners()).toBe(20);
    });
  });

  describe('edge cases', () => {
    it('should handle emitting events with no listeners', () => {
      expect(() => {
        eventBus.emit('test-event', { data: 'test' });
      }).not.toThrow();
    });

    it('should handle removing non-existent listeners', () => {
      const listener = vi.fn();
      expect(() => {
        eventBus.off('test-event', listener);
      }).not.toThrow();
    });
  });

  describe('cleanup', () => {
    it('should remove all listeners', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      eventBus.on('test-event', listener1);
      eventBus.on('another-event', listener2);

      eventBus.removeAllListeners();

      eventBus.emit('test-event', { data: 'test' });
      eventBus.emit('another-event', { value: 42 });

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
    });

    it('should remove listeners for specific event', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      eventBus.on('test-event', listener1);
      eventBus.on('another-event', listener2);

      eventBus.removeAllListeners('test-event');

      eventBus.emit('test-event', { data: 'test' });
      eventBus.emit('another-event', { value: 42 });

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });
  });

  describe('typed methods', () => {
    it('should support typed emit and on methods', () => {
      const listener = vi.fn();
      
      eventBus.onTyped('test-event', listener);
      eventBus.emitTyped('test-event', { data: 'typed-test' });
      
      expect(listener).toHaveBeenCalledWith({ data: 'typed-test' });
    });

    it('should support typed once method', () => {
      const listener = vi.fn();
      
      eventBus.onceTyped('test-event', listener);
      eventBus.emitTyped('test-event', { data: 'once-test' });
      eventBus.emitTyped('test-event', { data: 'once-test2' });
      
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith({ data: 'once-test' });
    });

    it('should support typed off method', () => {
      const listener = vi.fn();
      
      eventBus.onTyped('test-event', listener);
      eventBus.offTyped('test-event', listener);
      eventBus.emitTyped('test-event', { data: 'off-test' });
      
      expect(listener).not.toHaveBeenCalled();
    });
  });
});
