import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getPaginatedResults } from '../../../data/api';
import { getFilenameFromContentDisposition } from '../../../utils/download';

const DEFAULT_EXPORT_FILENAME = 'attendance-report.csv';

export const ATTENDANCE_REPORT_PATH = '/fbr/api/reports/trainees/';
export const REPORT_FILTERS_PATH = '/fbr/api/reports/filters/';
export const ATTENDANCE_REPORT_DETAIL_PATH = '/fbr/api/reports/trainees/detail/';
export const ATTENDANCE_REPORT_EXPORT_PATH = '/fbr/api/reports/trainees/export/';

export const getAttendanceReportsUrl = () => `${getConfig().LMS_BASE_URL}${ATTENDANCE_REPORT_PATH}`;
export const getReportFiltersUrl = () => `${getConfig().LMS_BASE_URL}${REPORT_FILTERS_PATH}`;
export const getAttendanceReportDetailUrl = () => `${getConfig().LMS_BASE_URL}${ATTENDANCE_REPORT_DETAIL_PATH}`;
export const getAttendanceReportExportUrl = () => `${getConfig().LMS_BASE_URL}${ATTENDANCE_REPORT_EXPORT_PATH}`;

export const mapAttendanceRow = (row) => ({
  id: `${row.trainee?.id}-${row.program_key}`,
  learnerId: row.trainee?.id != null ? String(row.trainee.id) : '',
  learner: row.trainee?.name || '',
  avatarValue: row.trainee?.avatar || undefined,
  programKey: row.program_key,
  program: row.program_title,
  attended: row.attended,
  totalSessions: row.total_sessions,
  attendancePercentage: row.attendance_rate,
  breakdown: {
    present: row.counts?.present || 0,
    absent: row.counts?.absent || 0,
    leave: row.counts?.leave || 0,
    pending: row.counts?.pending || 0,
  },
});

export const getAttendanceReports = async ({
  program, instructor, city, startDate, endDate, page = 1, pageSize,
} = {}) => {
  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  if (program && program !== 'all') { params.set('program', program); }
  if (instructor && instructor !== 'all') { params.set('instructor', instructor); }
  if (city && city !== 'all') { params.set('city', city); }
  if (startDate) { params.set('from', startDate); }
  if (endDate) { params.set('to', endDate); }

  const { data } = await getAuthenticatedHttpClient().get(`${getAttendanceReportsUrl()}?${params.toString()}`);
  const results = getPaginatedResults(data);

  return {
    rows: results.map(mapAttendanceRow),
    count: data?.count || 0,
    kpis: {
      learners: data?.kpis?.trainees || 0,
      avgAttendance: data?.kpis?.avg_attendance_rate || 0,
      sessionsTracked: data?.kpis?.sessions || 0,
    },
  };
};

// ─── Attendance details Sheet (Program Key + Trainee ID in; courses and ──
// their sessions - Session Title, Session Type, Session Start Date, ───────
// Attendance Status - out) ─────────────────────────────────────────────────

export const mapAttendanceSession = (session) => ({
  id: String(session.id),
  title: session.title,
  sessionType: session.session_type || '',
  sessionDate: session.session_date || session.start_time,
  status: session.attendance_status || session.status,
});

export const mapAttendanceCourse = (course) => ({
  courseKey: course.course_key,
  courseName: course.course_title,
  sessions: (course.sessions || []).map(mapAttendanceSession),
});

export const mapAttendanceSummary = (summary = {}) => ({
  present: summary.present || 0,
  absent: summary.absent || 0,
  leave: summary.leave || 0,
  pending: summary.pending || 0,
  total: summary.total || 0,
  attendanceRate: summary.attendance_rate || 0,
});

/**
 * Fetches the courses (and each course's sessions, with a Present/Absent/
 * Leave/Pending attendance status) behind one learner's attendance count for
 * a given program row, plus the aggregate `summary` counts shown above the
 * course list. Backs the right-side `AttendanceDetailsSheet`.
 */
export const getAttendanceDetails = async ({ learnerId, programKey } = {}) => {
  const params = new URLSearchParams();
  if (programKey) { params.set('program', programKey); }
  if (learnerId) { params.set('trainee', learnerId); }

  const { data } = await getAuthenticatedHttpClient().get(
    `${getAttendanceReportDetailUrl()}?${params.toString()}`,
  );
  const results = Array.isArray(data?.courses) ? data.courses : getPaginatedResults(data);

  return {
    learner: data?.trainee_name || data?.trainee?.name || '',
    program: data?.program_title || '',
    summary: mapAttendanceSummary(data?.summary),
    courses: results.map(mapAttendanceCourse),
  };
};

/**
 * Downloads the Attendance Report as a CSV using the currently applied
 * filters. Returns the raw blob and the filename the backend assigned it
 * (via `Content-Disposition`), falling back to a default name if that
 * header is missing or malformed.
 */
export const exportAttendanceReports = async ({
  program, instructor, city, startDate, endDate,
} = {}) => {
  const params = new URLSearchParams();
  if (program && program !== 'all') { params.set('program', program); }
  if (instructor && instructor !== 'all') { params.set('instructor', instructor); }
  if (city && city !== 'all') { params.set('city', city); }
  if (startDate) { params.set('from', startDate); }
  if (endDate) { params.set('to', endDate); }

  const { data, headers } = await getAuthenticatedHttpClient().get(
    `${getAttendanceReportExportUrl()}?${params.toString()}`,
    { responseType: 'blob' },
  );

  return {
    blob: data,
    filename: getFilenameFromContentDisposition(headers?.['content-disposition'], DEFAULT_EXPORT_FILENAME),
  };
};

export const getAttendanceReportFilters = async () => {
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
