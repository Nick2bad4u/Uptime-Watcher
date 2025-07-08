import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from '../components/Header/Header';

// Mock all dependencies
vi.mock('../stores', () => ({
  useSitesStore: () => ({
    sites: []
  }),
  useUIStore: () => ({
    setShowSettings: vi.fn()
  })
}));

vi.mock('../theme', () => ({
  ThemedBox: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  ThemedText: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  ThemedButton: ({ children, onClick, ...props }: any) => <button onClick={onClick} {...props}>{children}</button>,
  StatusIndicator: ({ count, label, ...props }: any) => <div {...props} data-testid={`status-${(label ?? 'unknown').toLowerCase()}`}>{count ?? 0}</div>,
  useTheme: () => ({
    isDark: false,
    toggleTheme: vi.fn()
  }),
  useAvailabilityColors: () => ({
    getAvailabilityColor: vi.fn()
  })
}));

vi.mock('./Header.css', () => ({}));

describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(<Header />);
    expect(screen.getByText('Uptime Watcher')).toBeInTheDocument();
  });

  it('should display status indicators', () => {
    render(<Header />);
    const statusElements = screen.getAllByTestId('status-unknown');
    expect(statusElements).toHaveLength(3); // up, down, pending
  });

  it('should show zero counts when no sites', () => {
    render(<Header />);
    const statusElements = screen.getAllByTestId('status-unknown');
    expect(statusElements).toHaveLength(3); // up, down, pending
    statusElements.forEach(element => {
      expect(element).toHaveTextContent('0');
    });
  });
});
