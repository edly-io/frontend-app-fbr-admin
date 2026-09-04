import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from 'react-intl';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UsersPage from './UsersPage';

// ── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('@edx/frontend-platform', () => ({
  getConfig: () => ({ LMS_BASE_URL: 'http://lms.test', ACCOUNT_PROFILE_URL: null }),
}));

// Mock the hooks used by UsersPage
jest.mock('./data/apiHooks', () => ({
  useUsers: jest.fn(),
  useSuperAdminAccessProbe: jest.fn(),
  useUserDetailMutation: jest.fn(),
  useUpdateUserStatus: jest.fn(),
}));

// Mock admin-console data api
jest.mock('../../data/api', () => ({
  getProfileMfeUserUrl: jest.fn(() => null),
}));

// Mock sub-components that have heavy dependencies or are not under test
jest.mock('./UsersToolbar', () => function MockUsersToolbar() {
  return <div data-testid="users-toolbar" />;
});

jest.mock('./UsersFilters', () => function MockUsersFilters() {
  return <div data-testid="users-filters" />;
});

jest.mock('./UsersTable', () => function MockUsersTable() {
  return <div data-testid="users-table" />;
});

jest.mock('../../components/user-modals/AddUserModal', () => function MockAddUserModal() {
  return <div data-testid="add-user-modal" />;
});

jest.mock('../../components/user-modals/BulkImportUsersModal', () => function MockBulkImportUsersModal() {
  return <div data-testid="bulk-import-modal" />;
});

jest.mock('../../components/user-modals/ViewUserModal', () => function MockViewUserModal() {
  return <div data-testid="view-user-modal" />;
});

// Mock AuditLogTable to keep it simple (tested separately)
jest.mock('../../../shared/AuditLogTable', () => function MockAuditLogTable() {
  return <div data-testid="audit-log-table">Audit Log Content</div>;
});

// ── Imports (after mocks) ─────────────────────────────────────────────────────

const {
  useUsers,
  useSuperAdminAccessProbe,
  useUserDetailMutation,
  useUpdateUserStatus,
} = require('./data/apiHooks');

// ── Helpers ──────────────────────────────────────────────────────────────────

const makeQueryClient = () => new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const renderPage = (initialEntries = ['/']) => render(
  <QueryClientProvider client={makeQueryClient()}>
    <IntlProvider locale="en">
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="*" element={<UsersPage />} />
        </Routes>
      </MemoryRouter>
    </IntlProvider>
  </QueryClientProvider>,
);

// ── Tests ────────────────────────────────────────────────────────────────────

describe('UsersPage', () => {
  beforeEach(() => {
    useUsers.mockReturnValue({
      data: { users: [], total: 0 },
      isLoading: false,
      isError: false,
      error: null,
    });
    useSuperAdminAccessProbe.mockReturnValue({ canViewSuperAdminTabs: false });
    useUserDetailMutation.mockReturnValue({ mutateAsync: jest.fn() });
    useUpdateUserStatus.mockReturnValue({ mutate: jest.fn() });
  });

  afterEach(() => jest.clearAllMocks());

  it('renders users list in default list view', async () => {
    renderPage(['/']);

    // The "Users" tab toggle button is rendered
    expect(screen.getByRole('button', { name: 'Users' })).toBeInTheDocument();
    // The "Audit Log" tab toggle button is rendered
    expect(screen.getByRole('button', { name: 'Audit Log' })).toBeInTheDocument();

    // In default list view, the users table (mocked) is shown
    await waitFor(() => expect(screen.getByTestId('users-table')).toBeInTheDocument());

    // Audit log is NOT shown in default list view
    expect(screen.queryByTestId('audit-log-table')).not.toBeInTheDocument();
  });

  it('shows audit log view when ?view=audit-log is in URL', async () => {
    renderPage(['/?view=audit-log']);

    // AuditLogTable is shown
    await waitFor(() => expect(screen.getByTestId('audit-log-table')).toBeInTheDocument());

    // Users table is NOT shown
    expect(screen.queryByTestId('users-table')).not.toBeInTheDocument();
  });
});
