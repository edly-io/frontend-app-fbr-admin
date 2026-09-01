import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { exportProgramReports, exportTraineeProgress } from './api';

jest.mock('@edx/frontend-platform', () => ({ getConfig: () => ({ LMS_BASE_URL: 'http://lms.test' }) }));
jest.mock('@edx/frontend-platform/auth', () => ({ getAuthenticatedHttpClient: jest.fn() }));

const csvBlob = () => new Blob(['Program\r\n'], { type: 'text/csv' });

const mockGet = (response) => {
  const get = jest.fn(async () => response);
  getAuthenticatedHttpClient.mockReturnValue({ get });
  return get;
};

const requestedUrl = (get) => new URL(get.mock.calls[0][0]);

beforeEach(() => jest.clearAllMocks());

describe('exportProgramReports', () => {
  it('asks the report endpoint itself for CSV, as a blob', async () => {
    const get = mockGet({ data: csvBlob(), headers: {} });

    await exportProgramReports();

    const url = requestedUrl(get);
    expect(url.pathname).toBe('/fbr/api/reports/program/');
    expect(url.searchParams.get('export')).toBe('csv');
    expect(get.mock.calls[0][1]).toEqual({ responseType: 'blob' });
  });

  it('sends the applied filters as the same params the table uses', async () => {
    const get = mockGet({ data: csvBlob(), headers: {} });

    await exportProgramReports({
      program: 'program-v1:FBR+STP+2026-A',
      city: 'Lahore',
      instructor: '15',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
    });

    const params = requestedUrl(get).searchParams;
    expect(params.get('program')).toBe('program-v1:FBR+STP+2026-A');
    expect(params.get('city')).toBe('Lahore');
    expect(params.get('instructor')).toBe('15');
    expect(params.get('from')).toBe('2026-01-01');
    expect(params.get('to')).toBe('2026-12-31');
  });

  it('omits the "all" sentinel the filter dropdowns use for an unset filter', async () => {
    const get = mockGet({ data: csvBlob(), headers: {} });

    await exportProgramReports({ program: 'all', city: 'all', instructor: 'all' });

    const params = requestedUrl(get).searchParams;
    expect(params.has('program')).toBe(false);
    expect(params.has('city')).toBe(false);
    expect(params.has('instructor')).toBe(false);
  });

  it('sends no pagination params, so the file covers every filtered program', async () => {
    const get = mockGet({ data: csvBlob(), headers: {} });

    await exportProgramReports({ city: 'Lahore' });

    const params = requestedUrl(get).searchParams;
    expect(params.has('page')).toBe(false);
    expect(params.has('page_size')).toBe(false);
  });

  it('takes the filename the backend assigned the stream', async () => {
    mockGet({
      data: csvBlob(),
      headers: { 'content-disposition': 'attachment; filename="program-report-20260831.csv"' },
    });

    const { filename } = await exportProgramReports();

    expect(filename).toBe('program-report-20260831.csv');
  });

  it('falls back to a default name when the header is missing', async () => {
    mockGet({ data: csvBlob(), headers: {} });

    expect((await exportProgramReports()).filename).toBe('program-report.csv');
  });

  it('returns the streamed blob untouched', async () => {
    const blob = csvBlob();
    mockGet({ data: blob, headers: {} });

    expect((await exportProgramReports()).blob).toBe(blob);
  });
});

describe('exportTraineeProgress', () => {
  it('asks the trainee-progress endpoint itself for CSV, with the panel’s params', async () => {
    const get = mockGet({ data: csvBlob(), headers: {} });

    await exportTraineeProgress('program-v1:FBR+STP+2026-A', '15');

    const url = requestedUrl(get);
    expect(url.pathname).toBe('/fbr/api/reports/program/trainee-progress/');
    expect(url.searchParams.get('program')).toBe('program-v1:FBR+STP+2026-A');
    expect(url.searchParams.get('trainee')).toBe('15');
    expect(url.searchParams.get('export')).toBe('csv');
    expect(get.mock.calls[0][1]).toEqual({ responseType: 'blob' });
  });

  it('takes the filename the backend assigned the stream', async () => {
    mockGet({
      data: csvBlob(),
      headers: {
        'content-disposition':
          'attachment; filename="tax-administration-fundamentals-adeel-farooq-progress.csv"',
      },
    });

    const { filename } = await exportTraineeProgress('program-1', '15');

    expect(filename).toBe('tax-administration-fundamentals-adeel-farooq-progress.csv');
  });

  it('falls back to a default name when the header is missing', async () => {
    mockGet({ data: csvBlob(), headers: {} });

    expect((await exportTraineeProgress('program-1', '15')).filename).toBe('trainee-progress.csv');
  });
});
