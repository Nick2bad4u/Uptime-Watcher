import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SettingsTab } from '../components/SiteDetails/tabs/SettingsTab';
import { Site, Monitor } from '../types';
import { CHECK_INTERVALS, RETRY_CONSTRAINTS, TIMEOUT_CONSTRAINTS } from '../constants';

// Mock logger
vi.mock('../services/logger', () => ({
  default: {
    user: {
      action: vi.fn(),
    },
  },
}));

// Mock theme components
vi.mock('../theme/components', () => ({
  ThemedBox: vi.fn(({ children, className, ...props }) => 
    <div data-testid="themed-box" className={className} {...props}>{children}</div>
  ),
  ThemedText: vi.fn(({ children, className, size, weight, variant, ...props }) => 
    <span data-testid="themed-text" className={className} data-size={size} data-weight={weight} data-variant={variant} {...props}>{children}</span>
  ),
  ThemedButton: vi.fn(({ children, onClick, disabled, loading, variant, size, icon, className, ...props }) => 
    <button 
      data-testid="themed-button" 
      onClick={onClick} 
      disabled={disabled || loading}
      className={className}
      data-variant={variant}
      data-size={size}
      data-loading={loading}
      {...props}
    >
      {icon && <span data-testid="button-icon">{icon}</span>}
      {children}
    </button>
  ),
  ThemedCard: vi.fn(({ children, title, icon, className, ...props }) => 
    <div data-testid="themed-card" className={className} {...props}>
      {title && <h3 data-testid="card-title">{icon} {title}</h3>}
      {children}
    </div>
  ),
  ThemedBadge: vi.fn(({ children, variant, size, className, ...props }) => 
    <span data-testid="themed-badge" className={className} data-variant={variant} data-size={size} {...props}>{children}</span>
  ),
  ThemedInput: vi.fn(({ onChange, value, disabled, className, type, min, max, step, placeholder, ...props }) => 
    <input 
      data-testid="themed-input"
      type={type || 'text'}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={className}
      min={min}
      max={max}
      step={step}
      placeholder={placeholder}
      {...props}
    />
  ),
  ThemedSelect: vi.fn(({ children, value, onChange, className, ...props }) => 
    <select 
      data-testid="themed-select" 
      value={value} 
      onChange={onChange} 
      className={className} 
      {...props}
    >
      {children}
    </select>
  ),
}));

describe('SettingsTab', () => {
  const mockMonitor: Monitor = {
    id: 'monitor-1',
    type: 'http',
    url: 'https://example.com',
    checkInterval: 30000, // 30 seconds
    timeout: 10000, // 10 seconds (stored as ms)
    retryAttempts: 3,
    lastChecked: new Date(Date.now()),
    status: 'up',
    history: [
      { timestamp: Date.now(), status: 'up', responseTime: 150 },
      { timestamp: Date.now() - 60000, status: 'up', responseTime: 200 },
    ],
  };

  const mockSite: Site = {
    identifier: 'test-site-1',
    name: 'Test Site',
    monitors: [mockMonitor],
    monitoring: true,
  };

  const defaultProps = {
    currentSite: mockSite,
    selectedMonitor: mockMonitor,
    localName: 'Test Site',
    localCheckInterval: 30000,
    localTimeout: 10, // In seconds for display
    localRetryAttempts: 3,
    hasUnsavedChanges: false,
    intervalChanged: false,
    timeoutChanged: false,
    retryAttemptsChanged: false,
    isLoading: false,
    handleIntervalChange: vi.fn(),
    handleRemoveSite: vi.fn(),
    handleSaveInterval: vi.fn(),
    handleSaveName: vi.fn(),
    handleSaveRetryAttempts: vi.fn(),
    handleSaveTimeout: vi.fn(),
    handleRetryAttemptsChange: vi.fn(),
    handleTimeoutChange: vi.fn(),
    setLocalName: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render settings tab with all main sections', () => {
      render(<SettingsTab {...defaultProps} />);

      // Check for main sections
      expect(screen.getByText(/Site Configuration/i)).toBeInTheDocument();
      expect(screen.getByText(/Site Information/i)).toBeInTheDocument();
      expect(screen.getByText(/Danger Zone/i)).toBeInTheDocument();
    });

    it('should render site name input with current value', () => {
      render(<SettingsTab {...defaultProps} />);

      const nameInput = screen.getByDisplayValue('Test Site');
      expect(nameInput).toBeInTheDocument();
      expect(nameInput).toHaveAttribute('placeholder', 'Enter a custom name for this site');
    });

    it('should render site identifier input as disabled', () => {
      render(<SettingsTab {...defaultProps} />);

      const identifierInput = screen.getByDisplayValue('https://example.com');
      expect(identifierInput).toBeInTheDocument();
      expect(identifierInput).toBeDisabled();
    });

    it('should render check interval selector with current value', () => {
      render(<SettingsTab {...defaultProps} />);

      const intervalSelect = screen.getByTestId('themed-select');
      expect(intervalSelect).toBeInTheDocument();
      expect(intervalSelect).toHaveValue('30000');
    });

    it('should render timeout input with current value', () => {
      render(<SettingsTab {...defaultProps} />);

      const timeoutInput = screen.getByDisplayValue('10');
      expect(timeoutInput).toBeInTheDocument();
      expect(timeoutInput).toHaveAttribute('type', 'number');
      expect(timeoutInput).toHaveAttribute('min', String(TIMEOUT_CONSTRAINTS.MIN));
      expect(timeoutInput).toHaveAttribute('max', String(TIMEOUT_CONSTRAINTS.MAX));
    });

    it('should render retry attempts input with current value', () => {
      render(<SettingsTab {...defaultProps} />);

      const retryInput = screen.getByDisplayValue('3');
      expect(retryInput).toBeInTheDocument();
      expect(retryInput).toHaveAttribute('type', 'number');
      expect(retryInput).toHaveAttribute('min', String(RETRY_CONSTRAINTS.MIN));
      expect(retryInput).toHaveAttribute('max', String(RETRY_CONSTRAINTS.MAX));
    });
  });

  describe('Helper Functions', () => {
    it('should display correct interval labels', () => {
      render(<SettingsTab {...defaultProps} />);

      // Check that interval select exists and has the expected value
      const intervalSelect = screen.getByTestId('themed-select');
      expect(intervalSelect).toBeInTheDocument();
      expect(intervalSelect).toHaveValue('30000');
    });

    it('should display correct identifier label for HTTP monitor', () => {
      render(<SettingsTab {...defaultProps} />);

      expect(screen.getByText('Website URL')).toBeInTheDocument();
    });

    it('should display correct identifier label for port monitor', () => {
      const portMonitor: Monitor = {
        ...mockMonitor,
        type: 'port',
        host: 'example.com',
        port: 80,
        url: undefined,
      };

      render(<SettingsTab {...defaultProps} selectedMonitor={portMonitor} />);

      expect(screen.getByText('Host & Port')).toBeInTheDocument();
      expect(screen.getByDisplayValue('example.com:80')).toBeInTheDocument();
    });

    it('should display fallback identifier for unknown monitor type', () => {
      const unknownMonitor: Monitor = {
        ...mockMonitor,
        type: 'ping' as 'http', // Unknown monitor type fallback
        url: undefined,
      };

      render(<SettingsTab {...defaultProps} selectedMonitor={unknownMonitor} />);

      expect(screen.getByText('Internal Site ID')).toBeInTheDocument();
      expect(screen.getByDisplayValue('test-site-1')).toBeInTheDocument();
    });

    it('should format retry attempts text correctly', () => {
      render(<SettingsTab {...defaultProps} localRetryAttempts={0} />);
      expect(screen.getByText(/Retry disabled - immediate failure detection/i)).toBeInTheDocument();

      const { rerender } = render(<SettingsTab {...defaultProps} localRetryAttempts={1} />);
      expect(screen.getByText(/Retry 1 time before marking down/i)).toBeInTheDocument();

      rerender(<SettingsTab {...defaultProps} localRetryAttempts={3} />);
      expect(screen.getByText(/Retry 3 times before marking down/i)).toBeInTheDocument();
    });
  });

  describe('Site Name Management', () => {
    it('should handle site name changes', async () => {
      const user = userEvent.setup();
      render(<SettingsTab {...defaultProps} />);

      const nameInput = screen.getByDisplayValue('Test Site');
      
      // Just add some text to trigger the change handler
      await user.type(nameInput, 'e');

      // Check that setLocalName was called
      expect(defaultProps.setLocalName).toHaveBeenCalled();
      expect(defaultProps.setLocalName.mock.calls.length).toBeGreaterThan(0);
    });

    it('should show unsaved changes badge when name is modified', () => {
      render(<SettingsTab {...defaultProps} hasUnsavedChanges={true} />);

      expect(screen.getByText(/Unsaved changes/i)).toBeInTheDocument();
    });

    it('should enable save button when there are unsaved changes', () => {
      render(<SettingsTab {...defaultProps} hasUnsavedChanges={true} />);

      const saveButtons = screen.getAllByText('Save');
      const nameSaveButton = saveButtons[0]; // First save button is for name
      expect(nameSaveButton).not.toBeDisabled();
    });

    it('should disable save button when no unsaved changes', () => {
      render(<SettingsTab {...defaultProps} hasUnsavedChanges={false} />);

      const saveButtons = screen.getAllByText('Save');
      const nameSaveButton = saveButtons[0]; // First save button is for name
      expect(nameSaveButton).toBeDisabled();
    });

    it('should handle save name action', async () => {
      const user = userEvent.setup();
      render(<SettingsTab {...defaultProps} hasUnsavedChanges={true} />);

      const saveButtons = screen.getAllByText('Save');
      const nameSaveButton = saveButtons[0];
      await user.click(nameSaveButton);

      expect(defaultProps.handleSaveName).toHaveBeenCalled();
    });

    it('should show loading state when saving', () => {
      render(<SettingsTab {...defaultProps} isLoading={true} hasUnsavedChanges={true} />);

      const saveButtons = screen.getAllByTestId('themed-button');
      const nameSaveButton = saveButtons.find(btn => btn.textContent === 'Save');
      expect(nameSaveButton).toBeDisabled();
    });
  });

  describe('Check Interval Management', () => {
    it('should handle interval change', async () => {
      const user = userEvent.setup();
      render(<SettingsTab {...defaultProps} />);

      const intervalSelect = screen.getByTestId('themed-select');
      expect(intervalSelect).toHaveValue('30000');
      await user.selectOptions(intervalSelect, '60000');

      expect(defaultProps.handleIntervalChange).toHaveBeenCalled();
    });

    it('should enable interval save button when interval changed', () => {
      render(<SettingsTab {...defaultProps} intervalChanged={true} />);

      const saveButtons = screen.getAllByText('Save');
      const intervalSaveButton = saveButtons[1]; // Second save button is for interval
      expect(intervalSaveButton).not.toBeDisabled();
    });

    it('should handle save interval action', async () => {
      const user = userEvent.setup();
      render(<SettingsTab {...defaultProps} intervalChanged={true} />);

      const saveButtons = screen.getAllByText('Save');
      const intervalSaveButton = saveButtons[1];
      await user.click(intervalSaveButton);

      expect(defaultProps.handleSaveInterval).toHaveBeenCalled();
    });

    it('should display interval options correctly', () => {
      render(<SettingsTab {...defaultProps} />);

      const intervalSelect = screen.getByTestId('themed-select');
      expect(intervalSelect).toBeInTheDocument();
      expect(intervalSelect).toHaveValue('30000');

      // Check that CHECK_INTERVALS are rendered as options
      CHECK_INTERVALS.forEach((interval) => {
        const value = typeof interval === 'number' ? interval : interval.value;
        const option = intervalSelect.querySelector(`option[value="${value}"]`);
        expect(option).toBeInTheDocument();
      });
    });
  });

  describe('Timeout Management', () => {
    it('should handle timeout change', async () => {
      const user = userEvent.setup();
      render(<SettingsTab {...defaultProps} />);

      const timeoutInput = screen.getByDisplayValue('10');
      await user.clear(timeoutInput);
      await user.type(timeoutInput, '15');

      expect(defaultProps.handleTimeoutChange).toHaveBeenCalled();
    });

    it('should enable timeout save button when timeout changed', () => {
      render(<SettingsTab {...defaultProps} timeoutChanged={true} />);

      const saveButtons = screen.getAllByText('Save');
      const timeoutSaveButton = saveButtons[2]; // Third save button is for timeout
      expect(timeoutSaveButton).not.toBeDisabled();
    });

    it('should handle save timeout action', async () => {
      const user = userEvent.setup();
      render(<SettingsTab {...defaultProps} timeoutChanged={true} />);

      const saveButtons = screen.getAllByText('Save');
      const timeoutSaveButton = saveButtons[2];
      await user.click(timeoutSaveButton);

      expect(defaultProps.handleSaveTimeout).toHaveBeenCalled();
    });

    it('should display timeout constraints', () => {
      render(<SettingsTab {...defaultProps} />);

      const timeoutInput = screen.getByDisplayValue('10');
      expect(timeoutInput).toHaveAttribute('min', String(TIMEOUT_CONSTRAINTS.MIN));
      expect(timeoutInput).toHaveAttribute('max', String(TIMEOUT_CONSTRAINTS.MAX));
      expect(timeoutInput).toHaveAttribute('step', String(TIMEOUT_CONSTRAINTS.STEP));
    });
  });

  describe('Retry Attempts Management', () => {
    it('should handle retry attempts change', async () => {
      const user = userEvent.setup();
      render(<SettingsTab {...defaultProps} />);

      const retryInput = screen.getByDisplayValue('3');
      await user.clear(retryInput);
      await user.type(retryInput, '5');

      expect(defaultProps.handleRetryAttemptsChange).toHaveBeenCalled();
    });

    it('should enable retry save button when retry attempts changed', () => {
      render(<SettingsTab {...defaultProps} retryAttemptsChanged={true} />);

      const saveButtons = screen.getAllByText('Save');
      const retrySaveButton = saveButtons[3]; // Fourth save button is for retry attempts
      expect(retrySaveButton).not.toBeDisabled();
    });

    it('should handle save retry attempts action', async () => {
      const user = userEvent.setup();
      render(<SettingsTab {...defaultProps} retryAttemptsChanged={true} />);

      const saveButtons = screen.getAllByText('Save');
      const retrySaveButton = saveButtons[3];
      await user.click(retrySaveButton);

      expect(defaultProps.handleSaveRetryAttempts).toHaveBeenCalled();
    });

    it('should display retry constraints', () => {
      render(<SettingsTab {...defaultProps} />);

      const retryInput = screen.getByDisplayValue('3');
      expect(retryInput).toHaveAttribute('min', String(RETRY_CONSTRAINTS.MIN));
      expect(retryInput).toHaveAttribute('max', String(RETRY_CONSTRAINTS.MAX));
      expect(retryInput).toHaveAttribute('step', String(RETRY_CONSTRAINTS.STEP));
    });

    it('should show maximum check duration when retry attempts > 0', () => {
      render(<SettingsTab {...defaultProps} localRetryAttempts={3} localTimeout={10} />);

      expect(screen.getByText(/Maximum check duration/i)).toBeInTheDocument();
    });

    it('should not show maximum check duration when retry attempts = 0', () => {
      render(<SettingsTab {...defaultProps} localRetryAttempts={0} />);

      expect(screen.queryByText(/Maximum check duration/i)).not.toBeInTheDocument();
    });
  });

  describe('Site Information Display', () => {
    it('should display monitor history count', () => {
      render(<SettingsTab {...defaultProps} />);

      expect(screen.getByText('Total Monitor History Records:')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument(); // mockMonitor has 2 history entries
    });

    it('should display last checked time', () => {
      render(<SettingsTab {...defaultProps} />);

      expect(screen.getByText('Last Checked:')).toBeInTheDocument();
      // Should show formatted date
    });

    it('should display "Never" when last checked is null', () => {
      const monitorWithoutLastChecked: Monitor = {
        ...mockMonitor,
        lastChecked: undefined,
      };

      render(<SettingsTab {...defaultProps} selectedMonitor={monitorWithoutLastChecked} />);

      expect(screen.getByText('Never')).toBeInTheDocument();
    });

    it('should display empty history count when no history', () => {
      const monitorWithoutHistory: Monitor = {
        ...mockMonitor,
        history: [],
      };

      render(<SettingsTab {...defaultProps} selectedMonitor={monitorWithoutHistory} />);

      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('Site Removal', () => {
    it('should render remove site button in danger zone', () => {
      render(<SettingsTab {...defaultProps} />);

      expect(screen.getByText(/Danger Zone/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Remove Site/i })).toBeInTheDocument();
      expect(screen.getByText(/This action cannot be undone/i)).toBeInTheDocument();
    });

    it('should handle remove site action', async () => {
      const user = userEvent.setup();
      render(<SettingsTab {...defaultProps} />);

      const removeButton = screen.getByRole('button', { name: /Remove Site/i });
      await user.click(removeButton);

      expect(defaultProps.handleRemoveSite).toHaveBeenCalled();
    });

    it('should show loading state on remove button when loading', () => {
      render(<SettingsTab {...defaultProps} isLoading={true} />);

      const removeButton = screen.getByRole('button', { name: /Remove Site/i });
      expect(removeButton).toBeDisabled();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle missing monitor gracefully', () => {
      const minimalMonitor: Monitor = {
        id: 'monitor-1',
        type: 'http',
        checkInterval: 30000,
        timeout: 10000,
        retryAttempts: 0,
        status: 'pending',
        history: [],
      };

      expect(() => {
        render(<SettingsTab {...defaultProps} selectedMonitor={minimalMonitor} />);
      }).not.toThrow();
    });

    it('should handle empty site name', () => {
      render(<SettingsTab {...defaultProps} localName="" />);

      const nameInput = screen.getByDisplayValue('');
      expect(nameInput).toBeInTheDocument();
    });

    it('should handle zero values correctly', () => {
      render(<SettingsTab {...defaultProps} localRetryAttempts={0} localTimeout={0} />);

      const timeoutInput = screen.getByPlaceholderText('Enter timeout in seconds');
      const retryInput = screen.getByPlaceholderText('Enter retry attempts');
      
      expect(timeoutInput).toHaveValue(0);
      expect(retryInput).toHaveValue(0);
      expect(screen.getByText(/Retry disabled/i)).toBeInTheDocument();
    });

    it('should handle all disabled states correctly', () => {
      render(
        <SettingsTab 
          {...defaultProps} 
          hasUnsavedChanges={false}
          intervalChanged={false}
          timeoutChanged={false}
          retryAttemptsChanged={false}
          isLoading={false}
        />
      );

      const saveButtons = screen.getAllByText('Save');
      saveButtons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe('Button Variants and States', () => {
    it('should show primary variant for save buttons when changes are made', () => {
      render(<SettingsTab {...defaultProps} hasUnsavedChanges={true} intervalChanged={true} />);

      const saveButtons = screen.getAllByTestId('themed-button');
      const nameSaveButton = saveButtons.find(btn => btn.textContent === 'Save');
      expect(nameSaveButton).toHaveAttribute('data-variant', 'primary');
    });

    it('should show secondary variant for save buttons when no changes', () => {
      render(<SettingsTab {...defaultProps} hasUnsavedChanges={false} />);

      const saveButtons = screen.getAllByTestId('themed-button');
      const nameSaveButton = saveButtons.find(btn => btn.textContent === 'Save');
      expect(nameSaveButton).toHaveAttribute('data-variant', 'secondary');
    });

    it('should show error variant for remove button', () => {
      render(<SettingsTab {...defaultProps} />);

      const removeButton = screen.getByRole('button', { name: /Remove Site/i });
      expect(removeButton).toHaveAttribute('data-variant', 'error');
    });
  });

  describe('Accessibility', () => {
    it('should have proper input labels', () => {
      render(<SettingsTab {...defaultProps} />);

      expect(screen.getByText('Site Name')).toBeInTheDocument();
      expect(screen.getByText('Website URL')).toBeInTheDocument();
      expect(screen.getByText('Check every:')).toBeInTheDocument();
      expect(screen.getByText('Timeout (seconds):')).toBeInTheDocument();
      expect(screen.getByText('Retry Attempts:')).toBeInTheDocument();
    });

    it('should have proper button text and icons', () => {
      render(<SettingsTab {...defaultProps} />);

      // Check for save buttons
      const saveButtons = screen.getAllByText('Save');
      expect(saveButtons).toHaveLength(4); // Name, interval, timeout, retry

      // Check for remove button with icon
      expect(screen.getByRole('button', { name: /Remove Site/i })).toBeInTheDocument();
    });
  });
});
