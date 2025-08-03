import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock theme components
vi.mock('../../../../theme/components', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    ThemedBox: ({ children, ...props }: any) => <div data-testid="themed-box" {...props}>{children}</div>,
    ThemedText: ({ children, ...props }: any) => <span data-testid="themed-text" {...props}>{children}</span>,
  };
});

// Mock the SiteCard components
vi.mock('../SiteCardHeader', () => ({
  SiteCardHeader: () => <div data-testid="site-card-header">Site Header</div>
}));

vi.mock('../SiteCardStatus', () => ({
  SiteCardStatus: () => <div data-testid="site-card-status">Site Status</div>
}));

vi.mock('../SiteCardHistory', () => ({
  SiteCardHistory: () => <div data-testid="site-card-history">Site History</div>
}));

vi.mock('../SiteCardMetrics', () => ({
  SiteCardMetrics: () => <div data-testid="site-card-metrics">Site Metrics</div>
}));

vi.mock('../SiteCardFooter', () => ({
  SiteCardFooter: () => <div data-testid="site-card-footer">Site Footer</div>
}));

// Mock the theme components
vi.mock('../../../../theme/components', () => ({
  ThemedBox: ({ children }: { children: React.ReactNode }) => <div data-testid="themed-box">{children}</div>
}));

// Mock the hooks
vi.mock('../../../../hooks/site/useSite', () => ({
  useSite: vi.fn(() => {
    const mockSite = {
      id: 'test-site-1',
      identifier: 'test-site-1', 
      name: 'Test Site',
      monitoring: true,
      history: [],
      monitors: [{
        id: 'monitor-1',
        type: 'http',
        url: 'https://example.com',
        status: 'up',
        responseTime: 200,
        monitoring: true,
        checkInterval: 30000,
        timeout: 5000,
        retryAttempts: 3,
        history: [],
        activeOperations: []
      }]
    };
    
    return {
      // Site data
      site: mockSite,
      latestSite: mockSite, // This is what was missing!
      
      // Monitor data
      monitor: {
        id: 'monitor-1',
        type: 'http',
        url: 'https://example.com',
        status: 'up',
        responseTime: 200,
        monitoring: true,
        checkInterval: 30000,
        timeout: 5000,
        retryAttempts: 3,
        history: [],
        activeOperations: []
      },
      selectedMonitorId: 'monitor-1',
      
      // Status and metrics
      status: 'up',
      uptime: 99.5,
      responseTime: 200,
      checkCount: 100,
      filteredHistory: [],
      
      // UI state
      isLoading: false,
      isMonitoring: true,
      
      // Event handlers (mocked)
      handleStartMonitoring: vi.fn(),
      handleStartSiteMonitoring: vi.fn(),
      handleStopMonitoring: vi.fn(),
      handleStopSiteMonitoring: vi.fn()
    };
  })
}));

// Import the component after mocks
import { SiteCard } from '../../../../components/Dashboard/SiteCard/SiteCard';

describe('SiteCard Component', () => {
  const mockSite = {
    id: 'test-site-1',
    identifier: 'test-site-1',
    name: 'Test Site',
    monitoring: true,
    history: [],
    monitors: [{
      id: 'monitor-1',
      type: 'http',
      url: 'https://example.com',
      status: 'up',
      responseTime: 200,
      monitoring: true,
      checkInterval: 30000,
      timeout: 5000,
      retryAttempts: 3,
      history: [],
      activeOperations: []
    }]
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(<SiteCard site={mockSite} />);
    
    expect(screen.getByTestId('themed-box')).toBeInTheDocument();
    expect(screen.getByTestId('site-card-header')).toBeInTheDocument();
    expect(screen.getByTestId('site-card-status')).toBeInTheDocument();
    expect(screen.getByTestId('site-card-history')).toBeInTheDocument();
    expect(screen.getByTestId('site-card-metrics')).toBeInTheDocument();
    expect(screen.getByTestId('site-card-footer')).toBeInTheDocument();
  });

  it('should handle site with no monitors', () => {
    const siteWithoutMonitors = {
      ...mockSite,
      monitors: []
    };

    render(<SiteCard site={siteWithoutMonitors} />);
    
    expect(screen.getByTestId('site-card-header')).toBeInTheDocument();
  });

  it('should handle site with multiple monitors', () => {
    const siteWithMultipleMonitors = {
      ...mockSite,
      monitors: [
        mockSite.monitors[0],
        {
          id: 'monitor-2',
          type: 'port',
          host: 'example.com',
          port: 80,
          status: 'down',
          responseTime: -1,
          monitoring: true,
          checkInterval: 30000,
          timeout: 5000,
          retryAttempts: 3,
          history: [],
          activeOperations: []
        }
      ]
    };

    render(<SiteCard site={siteWithMultipleMonitors} />);
    
    expect(screen.getByTestId('site-card-header')).toBeInTheDocument();
  });
});
