import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ThemeManager } from '../theme/ThemeManager';
import { lightTheme, darkTheme } from '../theme/themes';

// Mock DOM environment
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('ThemeManager', () => {
  let themeManager: ThemeManager;
  let mockDocumentElement: any;
  let mockBodyClassList: any;

  beforeEach(() => {
    themeManager = ThemeManager.getInstance();
    
    // Mock document.documentElement
    mockDocumentElement = {
      style: {
        setProperty: vi.fn(),
        removeProperty: vi.fn(),
      },
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
      },
    };

    // Mock document.body
    mockBodyClassList = {
      add: vi.fn(),
      remove: vi.fn(),
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
      },
    };

    Object.defineProperty(global, 'document', {
      value: {
        documentElement: mockDocumentElement,
        body: mockBodyClassList,
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = ThemeManager.getInstance();
      const instance2 = ThemeManager.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });

  describe('applyTheme', () => {
    it('should apply light theme', () => {
      themeManager.applyTheme(lightTheme);
      
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalled();
      expect(mockBodyClassList.classList.add).toHaveBeenCalledWith('theme-light');
    });

    it('should apply dark theme', () => {
      themeManager.applyTheme(darkTheme);
      
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalled();
      expect(mockBodyClassList.classList.add).toHaveBeenCalledWith('theme-dark');
      expect(mockDocumentElement.classList.add).toHaveBeenCalledWith('dark');
    });

    it('should handle undefined document', () => {
      Object.defineProperty(global, 'document', {
        value: undefined,
        writable: true,
      });

      expect(() => {
        themeManager.applyTheme(lightTheme);
      }).not.toThrow();
    });
  });

  describe('getTheme', () => {
    it('should get light theme', () => {
      const theme = themeManager.getTheme('light');
      
      expect(theme).toBe(lightTheme);
    });

    it('should get dark theme', () => {
      const theme = themeManager.getTheme('dark');
      
      expect(theme).toBe(darkTheme);
    });

    it('should get system theme preference', () => {
      vi.mocked(window.matchMedia).mockReturnValue({
        matches: true,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      } as any);

      const theme = themeManager.getTheme('system');
      
      expect(theme).toBe(darkTheme);
    });
  });

  describe('getSystemThemePreference', () => {
    it('should return dark when user prefers dark mode', () => {
      vi.mocked(window.matchMedia).mockReturnValue({
        matches: true,
      } as any);

      const preference = themeManager.getSystemThemePreference();
      
      expect(preference).toBe('dark');
    });

    it('should return light when user prefers light mode', () => {
      vi.mocked(window.matchMedia).mockReturnValue({
        matches: false,
      } as any);

      const preference = themeManager.getSystemThemePreference();
      
      expect(preference).toBe('light');
    });

    it('should return light when window is undefined', () => {
      const originalWindow = global.window;
      // @ts-expect-error - intentionally deleting window for testing
      delete global.window;

      const preference = themeManager.getSystemThemePreference();
      
      expect(preference).toBe('light');

      global.window = originalWindow;
    });
  });

  describe('getAvailableThemes', () => {
    it('should return all available theme names including system', () => {
      const themes = themeManager.getAvailableThemes();
      
      expect(themes).toContain('light');
      expect(themes).toContain('dark');
      expect(themes).toContain('system');
    });
  });

  describe('isValidThemeName', () => {
    it('should validate correct theme names', () => {
      expect(themeManager.isValidThemeName('light')).toBe(true);
      expect(themeManager.isValidThemeName('dark')).toBe(true);
      expect(themeManager.isValidThemeName('system')).toBe(true);
    });

    it('should reject invalid theme names', () => {
      expect(themeManager.isValidThemeName('invalid')).toBe(false);
      expect(themeManager.isValidThemeName('')).toBe(false);
    });
  });

  describe('onSystemThemeChange', () => {
    it('should register listener for system theme changes', () => {
      const callback = vi.fn();
      const mockMediaQuery = {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      };
      
      vi.mocked(window.matchMedia).mockReturnValue(mockMediaQuery as any);

      const cleanup = themeManager.onSystemThemeChange(callback);
      
      expect(mockMediaQuery.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
      
      cleanup();
      expect(mockMediaQuery.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('should return no-op function when window is undefined', () => {
      const originalWindow = global.window;
      // @ts-expect-error - intentionally deleting window for testing
      delete global.window;

      const callback = vi.fn();
      const cleanup = themeManager.onSystemThemeChange(callback);
      
      expect(typeof cleanup).toBe('function');
      expect(() => cleanup()).not.toThrow();

      global.window = originalWindow;
    });
  });

  describe('createCustomTheme', () => {
    it('should create custom theme based on light theme', () => {
      const customTheme = themeManager.createCustomTheme(lightTheme, {
        colors: {
          ...lightTheme.colors,
          primary: {
            ...lightTheme.colors.primary,
            500: '#custom-color'
          }
        }
      });

      expect(customTheme.colors.primary['500']).toBe('#custom-color');
      expect(customTheme.name).toBe(lightTheme.name);
    });
  });

  describe('generateCSSVariables', () => {
    it('should generate CSS variables for theme', () => {
      const cssVariables = themeManager.generateCSSVariables(lightTheme);
      
      expect(cssVariables).toContain(':root {');
      expect(cssVariables).toContain('--color-');
      expect(cssVariables).toContain('--font-size-');
      expect(cssVariables).toContain('--spacing-');
    });
  });
});
