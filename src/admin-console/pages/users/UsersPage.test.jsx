import React from 'react';
import {
  act, render, screen, waitFor,
} from '@testing-library/react';
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

// Captured so a test can drive the filter callbacks without rendering the
// real dropdown.
const filtersProps = [];

jest.mock('./UsersFilters', () => /* eslint-disable react/prop-types */ function MockUsersFilters(props) {
  filtersProps.push(props);
  return <div data-testid="users-filters" />;
});

const tableProps = [];

jest.mock('./UsersTable', () => /* eslint-disable react/prop-types */ function MockUsersTable(props) {
  tableProps.push(props);
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

const lastFiltersProps = () => filtersProps[filtersProps.length - 1];

const lastTableProps = () => tableProps[tableProps.length - 1];

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

  beforeEach(() => { filtersProps.length = 0; tableProps.length = 0; });

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

  it('asks the endpoint for the selected status instead of filtering in the page', async () => {
    renderPage(['/']);

    expect(useUsers).toHaveBeenLastCalledWith(expect.objectContaining({ status: 'all' }));

    act(() => lastFiltersProps().onStatusFilterChange('on_leave'));

    await waitFor(() => expect(useUsers).toHaveBeenLastCalledWith(
      expect.objectContaining({ status: 'on_leave' }),
    ));
  });

  it('goes back to page 1 when the status changes', async () => {
    renderPage(['/']);

    act(() => lastFiltersProps().onStatusFilterChange('lapsed'));

    await waitFor(() => expect(useUsers).toHaveBeenLastCalledWith(
      expect.objectContaining({ status: 'lapsed', page: 1 }),
    ));
  });

  it('renders every row the endpoint returned, without a second filter pass', async () => {
    useUsers.mockReturnValue({
      data: {
        users: [
          { id: 1, name: 'Ali Raza', status: 'Active' },
          { id: 2, name: 'Sara Khan', status: 'On Leave' },
        ],
        total: 2,
      },
      isLoading: false,
      isError: false,
      error: null,
    });

    renderPage(['/']);

    await waitFor(() => expect(screen.getByTestId('users-table')).toBeInTheDocument());
    expect(lastTableProps().pageUsers).toHaveLength(2);
  });

  it('shows audit log view when ?view=audit-log is in URL', async () => {
    renderPage(['/?view=audit-log']);

    // AuditLogTable is shown
    await waitFor(() => expect(screen.getByTestId('audit-log-table')).toBeInTheDocument());

    // Users table is NOT shown
    expect(screen.queryByTestId('users-table')).not.toBeInTheDocument();
  });
});
