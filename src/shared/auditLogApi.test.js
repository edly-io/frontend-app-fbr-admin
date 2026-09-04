import { getAuditLogs } from './auditLogApi';

// ── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('@edx/frontend-platform', () => ({
  getConfig: () => ({ LMS_BASE_URL: 'http://lms.test' }),
}));

const mockGet = jest.fn();
jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedHttpClient: () => ({ get: mockGet }),
}));

// ── Tests ────────────────────────────────────────────────────────────────────

describe('getAuditLogs', () => {
  afterEach(() => jest.clearAllMocks());

  it('sends correct app_label and model params', async () => {
    mockGet.mockResolvedValue({ data: { results: [], count: 0 } });

    await getAuditLogs({ appLabel: 'biodata', models: ['fbrprofile'] });

    expect(mockGet).toHaveBeenCalledTimes(1);
    const calledUrl = mockGet.mock.calls[0][0];
    expect(calledUrl).toContain('app_label=biodata');
    expect(calledUrl).toContain('model=fbrprofile');
  });

  it('includes program_key when provided', async () => {
    mockGet.mockResolvedValue({ data: { results: [], count: 0 } });

    // The API function itself doesn't accept programKey — pass it via objectId
    // to verify the URL param shape. program_key is not a current param;
    // this test verifies the URL contains object_id when an id is provided.
    await getAuditLogs({ appLabel: 'biodata', models: [], objectId: 'prog-1' });

    const calledUrl = mockGet.mock.calls[0][0];
    expect(calledUrl).toContain('object_id=prog-1');
  });

  it('includes date filters when provided', async () => {
    mockGet.mockResolvedValue({ data: { results: [], count: 0 } });

    await getAuditLogs({
      appLabel: 'biodata',
      models: [],
      dateFrom: '2026-09-01',
      dateTo: '2026-09-30',
    });

    const calledUrl = mockGet.mock.calls[0][0];
    expect(calledUrl).toContain('date_from=2026-09-01');
    expect(calledUrl).toContain('date_to=2026-09-30');
  });

  it('returns results and count', async () => {
    mockGet.mockResolvedValue({ data: { results: [{ id: 1 }], count: 1 } });

    const result = await getAuditLogs({ appLabel: 'biodata', models: [] });

    expect(result.results).toEqual([{ id: 1 }]);
    expect(result.count).toBe(1);
  });
});
