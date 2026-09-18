import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getSignupApprovals } from './api';

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

describe('getSignupApprovals total', () => {
  it('reads the count out of the pagination envelope', async () => {
    mockGet.mockResolvedValue(page(rows(5), { pagination: { count: 12, num_pages: 3 } }));

    const { approvals, total } = await getSignupApprovals({ page: 1, pageSize: 5, search: '' });

    expect(approvals).toHaveLength(5);
    expect(total).toBe(12);
  });

  it('still reads a flat count', async () => {
    mockGet.mockResolvedValue(page(rows(5), { count: 12 }));

    expect((await getSignupApprovals({ page: 1, pageSize: 5, search: '' })).total).toBe(12);
  });

  it('falls back to the rows in hand when no count is given', async () => {
    mockGet.mockResolvedValue(page(rows(2), {}));

    expect((await getSignupApprovals({ page: 1, pageSize: 5, search: '' })).total).toBe(2);
  });
});
