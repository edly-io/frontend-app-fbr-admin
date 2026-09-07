import React from 'react';
import {
  render, screen, waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from 'react-intl';
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

const renderTable = (props = {}) => render(
  <IntlProvider locale="en">
    <AuditLogTable appLabel="biodata" {...props} />
  </IntlProvider>,
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
});
