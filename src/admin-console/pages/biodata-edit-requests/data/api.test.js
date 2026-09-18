import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getEditRequests } from './api';

jest.mock('@edx/frontend-platform', () => ({
  getConfig: () => ({ LMS_BASE_URL: 'http://lms.test' }),
}));

jest.mock('@edx/frontend-platform/auth');

const mockGet = jest.fn();

beforeEach(() => {
  getAuthenticatedHttpClient.mockReturnValue({ get: mockGet });
});

afterEach(() => jest.clearAllMocks());

const page = (results, envelope) => ({ data: { results, ...envelope } });

const rows = count => Array.from({ length: count }, (_, i) => ({ id: i + 1 }));

describe('getEditRequests total', () => {
  it('reads the count out of the pagination envelope', async () => {
    mockGet.mockResolvedValue(page(rows(5), { pagination: { count: 7, num_pages: 2 } }));

    const { requests, total } = await getEditRequests({ page: 1, pageSize: 5, statusFilter: 'all' });

    expect(requests).toHaveLength(5);
    expect(total).toBe(7);
  });

  it('still reads a flat count', async () => {
    mockGet.mockResolvedValue(page(rows(5), { count: 7 }));

    expect((await getEditRequests({ page: 1, pageSize: 5, statusFilter: 'all' })).total).toBe(7);
  });

  it('falls back to the rows in hand when no count is given', async () => {
    mockGet.mockResolvedValue(page(rows(3), {}));

    expect((await getEditRequests({ page: 1, pageSize: 5, statusFilter: 'all' })).total).toBe(3);
  });
});
