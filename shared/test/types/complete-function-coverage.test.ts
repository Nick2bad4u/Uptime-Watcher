import { describe, it, expect } from 'vitest';
import * as chartConfig from '../../types/chartConfig';
import * as themeConfig from '../../types/themeConfig';
import * as database from '../../types/database';
import * as validation from '../../types/validation';

describe('Types Complete Function Coverage', () => {
  describe('chartConfig module', () => {
    it('should call hasPlugins function', () => {
      const result1 = chartConfig.hasPlugins({ plugins: {} });
      const result2 = chartConfig.hasPlugins(null);
      const result3 = chartConfig.hasPlugins({ notPlugins: true });
      
      expect(result1).toBe(true);
      expect(result2).toBe(false);
      expect(result3).toBe(false);
    });

    it('should call hasScales function', () => {
      const result1 = chartConfig.hasScales({ scales: {} });
      const result2 = chartConfig.hasScales(null);
      const result3 = chartConfig.hasScales({ notScales: true });
      
      expect(result1).toBe(true);
      expect(result2).toBe(false);
      expect(result3).toBe(false);
    });
  });

  describe('themeConfig module', () => {
    it('should call isColorPalette function', () => {
      const validPalette = { 
        primary: '#000', 
        secondary: '#fff', 
        error: '#f00', 
        info: '#00f', 
        success: '#0f0', 
        warning: '#ff0' 
      };
      const result1 = themeConfig.isColorPalette(validPalette);
      const result2 = themeConfig.isColorPalette({});
      const result3 = themeConfig.isColorPalette(null);
      
      expect(result1).toBe(true);
      expect(result2).toBe(false);
      expect(result3).toBe(false);
    });

    it('should call isThemeConfig function', () => {
      const validTheme = { 
        colors: {}, 
        spacing: {}, 
        animation: {},
        borderRadius: {},
        components: {},
        shadows: {},
        typography: {}
      };
      const result1 = themeConfig.isThemeConfig(validTheme);
      const result2 = themeConfig.isThemeConfig({});
      const result3 = themeConfig.isThemeConfig(null);
      
      expect(result1).toBe(true);
      expect(result2).toBe(false);
      expect(result3).toBe(false);
    });
  });

  describe('database module', () => {
    it('should call isValidHistoryRow function', () => {
      const validRow = { monitorId: 'monitor1', status: 'up', timestamp: 123456 };
      const result1 = database.isValidHistoryRow(validRow);
      const result2 = database.isValidHistoryRow({});
      const result3 = database.isValidHistoryRow(null);
      
      expect(result1).toBe(true);
      expect(result2).toBe(false);
      expect(result3).toBe(false);
    });

    it('should call isValidMonitorRow function', () => {
      const validRow = { id: 1, site_identifier: 'site1', type: 'http' };
      const result1 = database.isValidMonitorRow(validRow);
      const result2 = database.isValidMonitorRow({});
      
      expect(result1).toBe(true);
      expect(result2).toBe(false);
    });

    it('should call isValidSettingsRow function', () => {
      const validRow = { key: 'setting1', value: 'value1' };
      const result1 = database.isValidSettingsRow(validRow);
      const result2 = database.isValidSettingsRow({});
      
      expect(result1).toBe(true);
      expect(result2).toBe(false);
    });

    it('should call isValidSiteRow function', () => {
      const validRow = { identifier: 'site1', name: 'Test Site' };
      const result1 = database.isValidSiteRow(validRow);
      const result2 = database.isValidSiteRow({});
      
      expect(result1).toBe(true);
      expect(result2).toBe(false);
    });

    it('should call safeGetRowProperty function', () => {
      const row = { name: 'test', id: 123 };
      const result1 = database.safeGetRowProperty(row, 'name', 'default');
      const result2 = database.safeGetRowProperty(row, 'missing', 'default');
      
      expect(result1).toBe('test');
      expect(result2).toBe('default');
    });
  });

  describe('validation module', () => {
    it('should call createFailureResult function', () => {
      const result = validation.createFailureResult(['Error 1', 'Error 2']);
      expect(result.success).toBe(false);
      expect(result.errors).toEqual(['Error 1', 'Error 2']);
    });

    it('should call createSuccessResult function', () => {
      const result = validation.createSuccessResult();
      expect(result.success).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should call isValidationResult function', () => {
      const validResult = { success: true, errors: [] };
      const result1 = validation.isValidationResult(validResult);
      const result2 = validation.isValidationResult({});
      const result3 = validation.isValidationResult(null);
      
      expect(result1).toBe(true);
      expect(result2).toBe(false);
      expect(result3).toBe(false);
    });
  });
});
