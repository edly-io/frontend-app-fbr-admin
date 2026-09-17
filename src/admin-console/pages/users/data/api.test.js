import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getUsers } from './api';

// ── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('@edx/frontend-platform', () => ({
  getConfig: () => ({ LMS_BASE_URL: 'http://lms.test' }),
}));

jest.mock('@edx/frontend-platform/auth');

const mockGet = jest.fn();

beforeEach(() => {
  getAuthenticatedHttpClient.mockReturnValue({ get: mockGet });
  mockGet.mockResolvedValue({ data: { results: [], pagination: { count: 0 } } });
});

afterEach(() => jest.clearAllMocks());

// ── Helpers ──────────────────────────────────────────────────────────────────

const requestedQuery = () => Object.fromEntries(
  new URL(mockGet.mock.calls[0][0]).searchParams.entries(),
);

const listUsers = (overrides = {}) => getUsers({ page: 1, pageSize: 10, ...overrides });

// ── Tests ────────────────────────────────────────────────────────────────────

describe('getUsers status filter', () => {
  it('sends the selected status to the list endpoint', async () => {
    await listUsers({ status: 'on_leave' });

    expect(new URL(mockGet.mock.calls[0][0]).pathname).toBe('/fbr/api/biodata/v1/users/');
    expect(requestedQuery()).toEqual({ page: '1', page_size: '10', status: 'on_leave' });
  });

  it('omits the "all" sentinel', async () => {
    await listUsers({ status: 'all' });

    expect(requestedQuery()).toEqual({ page: '1', page_size: '10' });
  });

  it('omits the param when no status is given', async () => {
    await listUsers();

    expect(requestedQuery()).toEqual({ page: '1', page_size: '10' });
  });

  it('sends status alongside role and search', async () => {
    await listUsers({ status: 'active', role: 'instructor', search: ' Zoya ' });

    expect(requestedQuery()).toEqual({
      page: '1',
      page_size: '10',
      role: 'instructor',
      status: 'active',
      search: 'Zoya',
    });
  });

  it('reads the filtered total off the paginated envelope', async () => {
    mockGet.mockResolvedValue({
      data: {
        results: [{ id: 1, full_name: 'Ali Raza', status: 'active' }],
        pagination: { count: 1 },
      },
    });

    const { users, total } = await listUsers({ status: 'active' });

    expect(total).toBe(1);
    expect(users[0]).toMatchObject({ status: 'Active', statusValue: 'active' });
  });
});
