import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getAttendanceReports, getAttendanceDetails } from './api';

// ── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('@edx/frontend-platform', () => ({
  getConfig: () => ({ LMS_BASE_URL: 'http://lms.test' }),
}));

jest.mock('@edx/frontend-platform/auth');

const mockGet = jest.fn();

beforeEach(() => {
  getAuthenticatedHttpClient.mockReturnValue({ get: mockGet });
});

afterEach(() => jest.clearAllMocks());

// ── Helpers ──────────────────────────────────────────────────────────────────

const LIST_URL = 'http://lms.test/fbr/api/reports/trainees/';
const DETAIL_URL = 'http://lms.test/fbr/api/reports/trainees/detail/';

/** The query params of the request the call under test issued. */
const requestedQuery = () => Object.fromEntries(
  new URL(mockGet.mock.calls[0][0]).searchParams.entries(),
);

const requestedPath = () => {
  const url = new URL(mockGet.mock.calls[0][0]);
  return `${url.origin}${url.pathname}`;
};

// ── Listing ──────────────────────────────────────────────────────────────────

describe('getAttendanceReports', () => {
  it('sends the applied date range as the from/to params the backend reads', async () => {
    mockGet.mockResolvedValue({ data: { count: 0, results: [] } });

    await getAttendanceReports({
      program: 'program-v1:FBR+STP+2026-B',
      startDate: '2026-04-01',
      endDate: '2026-06-30',
      pageSize: 20,
    });

    expect(requestedPath()).toBe(LIST_URL);
    expect(requestedQuery()).toMatchObject({
      program: 'program-v1:FBR+STP+2026-B',
      from: '2026-04-01',
      to: '2026-06-30',
    });
  });
});

// ── Detail (attendance details Sheet) ────────────────────────────────────────

describe('getAttendanceDetails', () => {
  beforeEach(() => {
    mockGet.mockResolvedValue({ data: { program_title: 'STP', courses: [] } });
  });

  it('sends program, trainee and the applied date range', async () => {
    await getAttendanceDetails({
      learnerId: '67',
      programKey: 'program-v1:FBR+STP+2026-B',
      startDate: '2026-04-01',
      endDate: '2026-06-30',
    });

    expect(requestedPath()).toBe(DETAIL_URL);
    expect(requestedQuery()).toEqual({
      program: 'program-v1:FBR+STP+2026-B',
      trainee: '67',
      from: '2026-04-01',
      to: '2026-06-30',
    });
  });

  it('omits the range when no date filter is applied', async () => {
    await getAttendanceDetails({ learnerId: '67', programKey: 'p1' });

    expect(requestedQuery()).toEqual({ program: 'p1', trainee: '67' });
  });

  it('sends a start date on its own', async () => {
    await getAttendanceDetails({
      learnerId: '67', programKey: 'p1', startDate: '2026-04-01', endDate: '',
    });

    expect(requestedQuery()).toEqual({ program: 'p1', trainee: '67', from: '2026-04-01' });
  });

  it('sends an end date on its own', async () => {
    await getAttendanceDetails({
      learnerId: '67', programKey: 'p1', startDate: '', endDate: '2026-06-30',
    });

    expect(requestedQuery()).toEqual({ program: 'p1', trainee: '67', to: '2026-06-30' });
  });

  it('maps the filtered summary and the courses', async () => {
    mockGet.mockResolvedValue({
      data: {
        program_title: 'Standard Training Programme',
        trainee: { name: 'Ali Raza' },
        summary: {
          present: 2, absent: 0, leave: 0, pending: 0, total: 2, attendance_rate: 100,
        },
        courses: [{
          course_title: 'Course A',
          sessions: [{
            id: 7, title: 'Session 1', session_type: 'session', start_time: '2026-05-02T05:00:00Z', status: 'present',
          }],
        }],
      },
    });

    const { summary, courses, learner } = await getAttendanceDetails({
      learnerId: '67', programKey: 'p1', startDate: '2026-05-01', endDate: '2026-05-31',
    });

    expect(learner).toBe('Ali Raza');
    expect(summary).toMatchObject({ present: 2, total: 2, attendanceRate: 100 });
    expect(courses[0].sessions[0]).toMatchObject({ id: '7', status: 'present' });
  });
});
