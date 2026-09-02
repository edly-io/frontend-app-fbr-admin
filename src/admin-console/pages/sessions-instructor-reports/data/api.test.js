import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getSessionsInstructorReports, getInstructorSessionDetails } from './api';

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

const LIST_URL = 'http://lms.test/fbr/api/reports/instructors/';
const DETAIL_URL = 'http://lms.test/fbr/api/reports/instructors/detail/';

/** The query params of the request the call under test issued. */
const requestedQuery = () => Object.fromEntries(
  new URL(mockGet.mock.calls[0][0]).searchParams.entries(),
);

const requestedPath = () => {
  const url = new URL(mockGet.mock.calls[0][0]);
  return `${url.origin}${url.pathname}`;
};

// ── Listing ──────────────────────────────────────────────────────────────────

describe('getSessionsInstructorReports', () => {
  it('sends the applied date range as the from/to params the backend reads', async () => {
    mockGet.mockResolvedValue({ data: { count: 0, results: [] } });

    await getSessionsInstructorReports({
      program: 'program-v1:FBR+DST+2025-B',
      startDate: '2026-04-01',
      endDate: '2026-06-30',
      pageSize: 20,
    });

    expect(requestedPath()).toBe(LIST_URL);
    expect(requestedQuery()).toMatchObject({
      program: 'program-v1:FBR+DST+2025-B',
      from: '2026-04-01',
      to: '2026-06-30',
    });
  });
});

// ── Detail (session details Sheet) ───────────────────────────────────────────

describe('getInstructorSessionDetails', () => {
  beforeEach(() => {
    mockGet.mockResolvedValue({ data: { program_title: 'AML', courses: [] } });
  });

  it('sends program, instructor and the applied date range', async () => {
    await getInstructorSessionDetails({
      instructorId: '42',
      programKey: 'program-v1:FBR+DST+2025-B',
      startDate: '2026-04-01',
      endDate: '2026-06-30',
    });

    expect(requestedPath()).toBe(DETAIL_URL);
    expect(requestedQuery()).toEqual({
      program: 'program-v1:FBR+DST+2025-B',
      instructor: '42',
      from: '2026-04-01',
      to: '2026-06-30',
    });
  });

  it('omits the range when no date filter is applied', async () => {
    await getInstructorSessionDetails({ instructorId: '42', programKey: 'p1' });

    expect(requestedQuery()).toEqual({ program: 'p1', instructor: '42' });
  });

  it('sends a start date on its own', async () => {
    await getInstructorSessionDetails({
      instructorId: '42', programKey: 'p1', startDate: '2026-04-01', endDate: '',
    });

    expect(requestedQuery()).toEqual({
      program: 'p1', instructor: '42', from: '2026-04-01',
    });
  });

  it('sends an end date on its own', async () => {
    await getInstructorSessionDetails({
      instructorId: '42', programKey: 'p1', startDate: '', endDate: '2026-06-30',
    });

    expect(requestedQuery()).toEqual({
      program: 'p1', instructor: '42', to: '2026-06-30',
    });
  });

  it('maps the courses and their sessions', async () => {
    mockGet.mockResolvedValue({
      data: {
        program_title: 'Anti-Money Laundering',
        courses: [{
          course_title: 'Course A',
          sessions: [{
            id: 7, title: 'Session 1', duration_minutes: 90, start_time: '2026-05-02T05:00:00Z',
          }],
        }],
      },
    });

    const { courses, program } = await getInstructorSessionDetails({
      instructorId: '42', programKey: 'p1',
    });

    expect(program).toBe('Anti-Money Laundering');
    expect(courses[0].sessions[0]).toMatchObject({
      id: '7', title: 'Session 1', duration: 1.5, startDate: '2026-05-02T05:00:00Z',
    });
  });
});
