import React from 'react';
import {
  render, screen, waitFor, fireEvent,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from 'react-intl';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuditLogTable from './AuditLogTable';

// ── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('@edx/frontend-platform', () => ({
  getConfig: () => ({ LMS_BASE_URL: 'http://lms.test' }),
}));

jest.mock('./auditLogApi', () => ({ getAuditLogs: jest.fn() }));
const { getAuditLogs } = require('./auditLogApi');

// Paragon DataTable uses ResizeObserver internally; stub it for jsdom
global.ResizeObserver = global.ResizeObserver || class {
  observe() {}

  unobserve() {}

  disconnect() {}
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const makeQueryClient = () => new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const renderTable = (props = {}) => render(
  <QueryClientProvider client={makeQueryClient()}>
    <IntlProvider locale="en">
      <AuditLogTable appLabel="biodata" {...props} />
    </IntlProvider>
  </QueryClientProvider>,
);

// ── Tests ────────────────────────────────────────────────────────────────────

describe('AuditLogTable', () => {
  afterEach(() => jest.clearAllMocks());

  it('renders empty state when no logs returned', async () => {
    getAuditLogs.mockResolvedValue({ results: [], count: 0 });
    renderTable();
    await waitFor(() => expect(screen.getByText('No activity recorded yet.')).toBeInTheDocument());
  });

  it('renders actor name from a log entry', async () => {
    getAuditLogs.mockResolvedValue({
      results: [
        {
          id: 1,
          timestamp: '2026-09-04T10:00:00Z',
          actor_name: 'superadmin',
          actor_role: 'super_admin',
          actor_email: 'superadmin@example.com',
          action: 'created',
          record_type: 'fbrprofile',
          object_repr: 'Test User',
          object_pk: '42',
          changes: {},
        },
      ],
      count: 1,
    });
    renderTable();
    await waitFor(() => expect(screen.getByText('superadmin')).toBeInTheDocument());
  });

  it('search input is rendered', async () => {
    getAuditLogs.mockResolvedValue({ results: [], count: 0 });
    renderTable();
    // The search input should appear immediately (it's not async-gated)
    const input = screen.getByPlaceholderText(/Search/i);
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe('INPUT');
  });

  it('action select dropdown renders', async () => {
    getAuditLogs.mockResolvedValue({ results: [], count: 0 });
    renderTable();
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    // Should have the "All actions" option
    expect(screen.getByText('All actions')).toBeInTheDocument();
  });

  it('date range "From" input updates state and queries the API with the ISO value', async () => {
    getAuditLogs.mockResolvedValue({ results: [], count: 0 });
    renderTable();
    const fromInput = screen.getByLabelText('From');
    fireEvent.change(fromInput, { target: { value: '01/09/2026' } });
    expect(fromInput.value).toBe('01/09/2026');
    await waitFor(() => {
      expect(getAuditLogs).toHaveBeenCalledWith(
        expect.objectContaining({ dateFrom: '2026-09-01' }),
      );
    });
  });

  it('date range "To" input disables calendar days before the "From" value', async () => {
    getAuditLogs.mockResolvedValue({ results: [], count: 0 });
    renderTable();
    const fromInput = screen.getByLabelText('From');
    fireEvent.change(fromInput, { target: { value: '10/09/2026' } });

    const toInput = screen.getByLabelText('To');
    fireEvent.focus(toInput);
    const disabledDay = await screen.findByText(
      '1',
      { selector: '.react-datepicker__day--disabled' },
    );
    expect(disabledDay).toBeInTheDocument();
  });
});
