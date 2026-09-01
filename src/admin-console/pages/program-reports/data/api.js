import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getPaginatedResults } from '../../../data/api';
import { getFilenameFromContentDisposition } from '../../../utils/download';

export const PROGRAM_REPORT_PATH = '/fbr/api/reports/program/';
export const PROGRAM_REPORT_USERS_PATH = '/fbr/api/reports/program/users/';
export const PROGRAM_OVERVIEW_PATH = '/fbr/api/reports/program/overview/';
export const PROGRAM_TRAINEE_PROGRESS_PATH = '/fbr/api/reports/program/trainee-progress/';

export const getProgramReportsUrl = () => `${getConfig().LMS_BASE_URL}${PROGRAM_REPORT_PATH}`;
export const getProgramPeopleUrl = () => `${getConfig().LMS_BASE_URL}${PROGRAM_REPORT_USERS_PATH}`;
export const getProgramOverviewUrl = () => `${getConfig().LMS_BASE_URL}${PROGRAM_OVERVIEW_PATH}`;
export const getProgramTraineeProgressUrl = () => `${getConfig().LMS_BASE_URL}${PROGRAM_TRAINEE_PROGRESS_PATH}`;

// `?export=csv` switches the report endpoints to a streaming CSV of the same
// data (see `ProgramReportView` / `ProgramTraineeProgressView`).
const CSV_EXPORT_PARAMS = { export: 'csv' };
const DEFAULT_PROGRAM_EXPORT_FILENAME = 'program-report.csv';
const DEFAULT_TRAINEE_PROGRESS_EXPORT_FILENAME = 'trainee-progress.csv';
const DEFAULT_PROGRAM_PEOPLE_EXPORT_FILENAME = 'program-summary.csv';

/**
 * The report endpoint's query params for a filter selection. `program`/`city`/
 * `instructor` map onto the backend's exact-match params ('all' is the
 * dropdowns' own "unset" sentinel and is simply omitted); `startDate`/`endDate`
 * are sent as `from`/`to`, which the backend range-filters programs by
 * run-window overlap on. Shared by the table read and the CSV export so the two
 * can never disagree about what is being filtered.
 */
const programReportParams = ({
  program, city, instructor, startDate, endDate,
} = {}, extra = {}) => {
  const params = new URLSearchParams(extra);
  if (program && program !== 'all') { params.set('program', program); }
  if (city && city !== 'all') { params.set('city', city); }
  if (instructor && instructor !== 'all') { params.set('instructor', instructor); }
  if (startDate) { params.set('from', startDate); }
  if (endDate) { params.set('to', endDate); }
  return params;
};

export const mapProgramRow = (row) => ({
  id: row.program_key,
  programKey: row.program_key,
  program: row.program_title,
  description: row.description || '',
  city: row.program_city || '',
  // Kept as the backend's raw ISO `YYYY-MM-DD` so the DataTable's existing
  // sort stays chronological; the cell formats it for display.
  startDate: row.start_date || '',
  endDate: row.end_date || '',
  instructorCount: row.instructor_count || 0,
  certificateCount: row.certificates_awarded || 0,
  enrolled: row.trainee_count || 0,
  status: row.program_status,
});

export const mapPerson = (person) => ({
  id: String(person.id),
  name: person.name,
  role: person.role,
  avatarValue: person.avatar || undefined,
});

/**
 * Fetches one page of Program Report rows + KPIs for the given
 * Program/Instructor/City filter selection. `program`/`city`/`instructor`
 * map directly onto the backend's exact-match query params (program_key,
 * city name, instructor id). `startDate`/`endDate` are sent as `from`/`to`,
 * which the backend range-filters programs by run-window overlap on. `count`
 * is the total row count across all pages, used by the caller to derive the
 * DataTable's page count.
 */
export const getProgramReports = async ({ page = 1, pageSize, ...filters } = {}) => {
  const params = programReportParams(filters, {
    page: String(page), page_size: String(pageSize),
  });

  const { data } = await getAuthenticatedHttpClient().get(`${getProgramReportsUrl()}?${params.toString()}`);
  const results = getPaginatedResults(data);

  return {
    rows: results.map(mapProgramRow),
    count: data?.count || 0,
    kpis: {
      programCount: data?.kpis?.programs || 0,
      certificatesAwarded: data?.kpis?.certificates_awarded || 0,
    },
  };
};

/**
 * Downloads the Program Report as a CSV using the currently applied filters -
 * the same `GET .../program/` the table reads, with `?export=csv`. The backend
 * streams the file over the identical filtered queryset and ignores pagination,
 * so the download always covers every program the filtered table can page
 * through, not just the page in view.
 *
 * Returns the raw blob and the filename the backend assigned it (via
 * `Content-Disposition`), falling back to a default name if that header is
 * missing or malformed.
 */
export const exportProgramReports = async (filters = {}) => {
  const params = programReportParams(filters, CSV_EXPORT_PARAMS);
  const { data, headers } = await getAuthenticatedHttpClient().get(
    `${getProgramReportsUrl()}?${params.toString()}`,
    { responseType: 'blob' },
  );

  return {
    blob: data,
    filename: getFilenameFromContentDisposition(
      headers?.['content-disposition'],
      DEFAULT_PROGRAM_EXPORT_FILENAME,
    ),
  };
};

/**
 * Downloads one trainee's per-course grade and progress as a CSV - the same
 * `GET .../program/trainee-progress/` the panel reads, with `?export=csv`, so
 * the file matches what the panel is showing.
 */
export const exportTraineeProgress = async (programKey, traineeId) => {
  const params = new URLSearchParams({
    program: programKey, trainee: traineeId, ...CSV_EXPORT_PARAMS,
  });
  const { data, headers } = await getAuthenticatedHttpClient().get(
    `${getProgramTraineeProgressUrl()}?${params.toString()}`,
    { responseType: 'blob' },
  );

  return {
    blob: data,
    filename: getFilenameFromContentDisposition(
      headers?.['content-disposition'],
      DEFAULT_TRAINEE_PROGRESS_EXPORT_FILENAME,
    ),
  };
};

/**
 * Downloads one program's summary sheet as a CSV - the same
 * `GET .../program/users/` the People Sheet reads, with `?export=csv`. The
 * backend writes the program's name and participant count, its courses, and its
 * instructors with their session counts; no group selector is needed.
 */
export const exportProgramPeople = async (programKey) => {
  const params = new URLSearchParams({ program: programKey, ...CSV_EXPORT_PARAMS });
  const { data, headers } = await getAuthenticatedHttpClient().get(
    `${getProgramPeopleUrl()}?${params.toString()}`,
    { responseType: 'blob' },
  );

  return {
    blob: data,
    filename: getFilenameFromContentDisposition(
      headers?.['content-disposition'],
      DEFAULT_PROGRAM_PEOPLE_EXPORT_FILENAME,
    ),
  };
};

/**
 * Fetches the instructors + certified trainees for one program, shaped for
 * `UserIdentity`/the People Sheet. Requested via `all=1` so one request backs
 * both groups' sheets (they share the react-query cache).
 */
export const getProgramPeople = async (programKey) => {
  const params = new URLSearchParams({ program: programKey, all: '1' });
  const { data } = await getAuthenticatedHttpClient().get(`${getProgramPeopleUrl()}?${params.toString()}`);

  return {
    instructors: (data?.instructors || []).map(mapPerson),
    certified: (data?.certified || []).map(mapPerson),
  };
};

const mapOverviewPerson = (person) => ({
  id: String(person.id),
  name: person.name,
  email: person.email,
});

/**
 * Fetches one program's header, instructors, and trainee roster for the
 * Program Reports table's expanded row - `GET .../program/overview/`.
 */
export const getProgramOverview = async (programKey) => {
  const params = new URLSearchParams({ program: programKey });
  const { data } = await getAuthenticatedHttpClient().get(`${getProgramOverviewUrl()}?${params.toString()}`);

  return {
    programKey: data?.program_key,
    totalEnrolments: data?.total_enrolments || 0,
    instructors: (data?.instructors || []).map(mapOverviewPerson),
    trainees: (data?.trainees || []).map(person => ({ ...mapOverviewPerson(person), batch: person.batch })),
  };
};

const mapTraineeCourse = (course) => ({
  courseId: course.course_id,
  courseTitle: course.course_title,
  grade: {
    percent: course.grade?.percent ?? null,
    passingGrade: course.grade?.passing_grade ?? null,
    passed: course.grade?.passed ?? null,
    letterGrade: course.grade?.letter_grade ?? null,
    available: Boolean(course.grade?.available),
  },
  progress: {
    percent: course.progress?.percent ?? null,
    complete: course.progress?.complete ?? null,
    total: course.progress?.total ?? null,
    available: Boolean(course.progress?.available),
  },
});

/**
 * Fetches one trainee's edX grade + progress for every course in a program,
 * for the right-side Trainee Progress Sheet - `GET .../program/trainee-progress/`.
 * `traineeId` is the LMS user id returned by the overview endpoint.
 */
export const getTraineeProgress = async (programKey, traineeId) => {
  const params = new URLSearchParams({ program: programKey, trainee: traineeId });
  const { data } = await getAuthenticatedHttpClient().get(`${getProgramTraineeProgressUrl()}?${params.toString()}`);

  return {
    programTitle: data?.program_title || '',
    trainee: {
      id: data?.trainee?.id != null ? String(data.trainee.id) : '',
      name: data?.trainee?.name || '',
      email: data?.trainee?.email || '',
    },
    courses: (data?.courses || []).map(mapTraineeCourse),
  };
};
