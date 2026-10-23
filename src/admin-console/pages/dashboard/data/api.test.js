import { getConfig } from '@edx/frontend-platform';

import {
  getProgramRequestsUrl,
  getSessionAttendanceUrl,
  getSubstituteRequestsUrl,
} from './api';

jest.mock('@edx/frontend-platform', () => ({
  getConfig: jest.fn(),
}));

const withBase = (base) => {
  getConfig.mockReturnValue({ AUTHORING_BASE_URL: base });
};

describe('dashboard URL builders — Studio', () => {
  afterEach(() => jest.clearAllMocks());

  it('builds the program-requests URL on the leaves tab', () => {
    withBase('https://apps.test');
    expect(getProgramRequestsUrl('K')).toBe(
      'https://apps.test/authoring/programs/K/requests/leaves',
    );
  });

  it('builds the substitute-requests URL', () => {
    withBase('https://apps.test');
    expect(getSubstituteRequestsUrl('K')).toBe(
      'https://apps.test/authoring/programs/K/requests/substitute-requests',
    );
  });

  it('builds the session-attendance URL with a course_id', () => {
    withBase('https://apps.test');
    expect(getSessionAttendanceUrl('K', 5, 'C')).toBe(
      'https://apps.test/authoring/programs/K/attendance/sessions/5?course_id=C',
    );
  });

  it('uses the __none__ sentinel when the session has no course', () => {
    withBase('https://apps.test');
    expect(getSessionAttendanceUrl('K', 5, null)).toBe(
      'https://apps.test/authoring/programs/K/attendance/sessions/5?course_id=__none__',
    );
  });

  it('tolerates a trailing slash on AUTHORING_BASE_URL', () => {
    withBase('https://apps.test/');
    expect(getProgramRequestsUrl('K')).toBe(
      'https://apps.test/authoring/programs/K/requests/leaves',
    );
    expect(getSubstituteRequestsUrl('K')).toBe(
      'https://apps.test/authoring/programs/K/requests/substitute-requests',
    );
    expect(getSessionAttendanceUrl('K', 5, 'C')).toBe(
      'https://apps.test/authoring/programs/K/attendance/sessions/5?course_id=C',
    );
  });

  it('leaves `:` and `+` raw in the path and still encodes the course query', () => {
    withBase('https://apps.test');
    expect(
      getSessionAttendanceUrl('program-v1:ORG+PROG+2026', 7, 'course-v1:ORG+C+R'),
    ).toBe(
      'https://apps.test/authoring/programs/program-v1:ORG+PROG+2026/attendance/sessions/7'
      + '?course_id=course-v1%3AORG%2BC%2BR',
    );
  });

  it('returns null when AUTHORING_BASE_URL is unset so rows render as plain text', () => {
    getConfig.mockReturnValue({});
    expect(getProgramRequestsUrl('K')).toBeNull();
    expect(getSubstituteRequestsUrl('K')).toBeNull();
    expect(getSessionAttendanceUrl('K', 5, 'C')).toBeNull();
  });
});
