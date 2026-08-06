import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getPaginatedResults } from '../../../data/api';
import { getFilenameFromContentDisposition } from '../../../utils/download';

const DEFAULT_EXPORT_FILENAME = 'sessions-report.csv';

export const INSTRUCTOR_REPORT_PATH = '/fbr/api/reports/instructors/';
export const REPORT_FILTERS_PATH = '/fbr/api/reports/filters/';
export const INSTRUCTOR_REPORT_DETAIL_PATH = '/fbr/api/reports/instructors/detail/';
export const INSTRUCTOR_REPORT_EXPORT_PATH = '/fbr/api/reports/instructors/export/';

export const getInstructorReportsUrl = () => `${getConfig().LMS_BASE_URL}${INSTRUCTOR_REPORT_PATH}`;
export const getReportFiltersUrl = () => `${getConfig().LMS_BASE_URL}${REPORT_FILTERS_PATH}`;
export const getInstructorReportDetailUrl = () => `${getConfig().LMS_BASE_URL}${INSTRUCTOR_REPORT_DETAIL_PATH}`;
export const getInstructorReportExportUrl = () => `${getConfig().LMS_BASE_URL}${INSTRUCTOR_REPORT_EXPORT_PATH}`;

const toHours = (durations) => (
  Math.round((durations.reduce((sum, minutes) => sum + minutes, 0) / 60) * 100) / 100
);

export const mapSessionsInstructorRow = (row) => ({
  id: `${row.instructor.id}-${row.program_key}`,
  instructorId: String(row.instructor.id),
  instructor: row.instructor.name,
  programKey: row.program_key,
  program: row.program_title,
  sessions: row.total_sessions,
  hours: row.total_hours,
  hoursByType: (row.hours_by_type || []).map(entry => ({
    sessionType: entry.session_type,
    label: entry.label,
    hours: toHours(entry.durations || []),
  })),
});

export const getSessionsInstructorReports = async ({
  program, instructor, city, startDate, endDate, page = 1, pageSize,
} = {}) => {
  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  if (program && program !== 'all') { params.set('program', program); }
  if (instructor && instructor !== 'all') { params.set('instructor', instructor); }
  if (city && city !== 'all') { params.set('city', city); }
  if (startDate) { params.set('start_date', startDate); }
  if (endDate) { params.set('end_date', endDate); }

  const { data } = await getAuthenticatedHttpClient().get(`${getInstructorReportsUrl()}?${params.toString()}`);
  const results = getPaginatedResults(data);

  return {
    rows: results.map(mapSessionsInstructorRow),
    count: data?.count || 0,
    kpis: {
      instructors: data?.kpis?.instructors || 0,
      sessions: data?.kpis?.sessions || 0,
      hours: data?.kpis?.hours || 0,
    },
  };
};

// ─── Session details Sheet (Program Key + Instructor ID in; courses and ──
// their sessions - Session Title, Duration, Session Start Date - out) ─────

export const mapSessionDetail = (session) => ({
  id: String(session.id),
  title: session.title,
  duration: session.duration_minutes != null
    ? Math.round((session.duration_minutes / 60) * 100) / 100
    : null,
  startDate: session.start_time,
});

export const mapCourseDetail = (course) => ({
  courseKey: course.course_key,
  courseName: course.course_title,
  sessions: (course.sessions || []).map(mapSessionDetail),
});

/**
 * Fetches the courses (and each course's sessions) behind one instructor's
 * session count for a given program row. Backs the right-side
 * `SessionDetailsSheet`.
 */
export const getInstructorSessionDetails = async ({ instructorId, programKey } = {}) => {
  const params = new URLSearchParams();
  if (programKey) { params.set('program', programKey); }
  if (instructorId) { params.set('instructor', instructorId); }

  const { data } = await getAuthenticatedHttpClient().get(
    `${getInstructorReportDetailUrl()}?${params.toString()}`,
  );
  const results = Array.isArray(data?.courses) ? data.courses : getPaginatedResults(data);

  return {
    instructor: data?.instructor_name || '',
    program: data?.program_title || '',
    courses: results.map(mapCourseDetail),
  };
};

/**
 * Downloads the Sessions Report as a CSV using the currently applied
 * filters. Returns the raw blob and the filename the backend assigned it
 * (via `Content-Disposition`), falling back to a default name if that
 * header is missing or malformed.
 */
export const exportSessionsInstructorReports = async ({
  program, instructor, city, startDate, endDate,
} = {}) => {
  const params = new URLSearchParams();
  if (program && program !== 'all') { params.set('program', program); }
  if (instructor && instructor !== 'all') { params.set('instructor', instructor); }
  if (city && city !== 'all') { params.set('city', city); }
  if (startDate) { params.set('from', startDate); }
  if (endDate) { params.set('to', endDate); }

  const { data, headers } = await getAuthenticatedHttpClient().get(
    `${getInstructorReportExportUrl()}?${params.toString()}`,
    { responseType: 'blob' },
  );

  return {
    blob: data,
    filename: getFilenameFromContentDisposition(headers?.['content-disposition'], DEFAULT_EXPORT_FILENAME),
  };
};

export const getReportFilters = async () => {
  const { data } = await getAuthenticatedHttpClient().get(getReportFiltersUrl());

  return {
    programs: (data?.programs || []).map(program => ({
      value: program.program_key,
      label: program.name,
    })),
    instructors: (data?.instructors || []).map(instructor => ({
      value: String(instructor.id),
      label: instructor.name,
    })),
    cities: (data?.cities || []).map(city => ({
      value: city.name,
      label: city.name,
    })),
  };
};
