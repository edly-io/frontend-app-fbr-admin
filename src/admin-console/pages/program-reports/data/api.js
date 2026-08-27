import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getPaginatedResults } from '../../../data/api';

export const PROGRAM_REPORT_PATH = '/fbr/api/reports/program/';
export const PROGRAM_REPORT_USERS_PATH = '/fbr/api/reports/program/users/';
export const PROGRAM_OVERVIEW_PATH = '/fbr/api/reports/program/overview/';
export const PROGRAM_TRAINEE_PROGRESS_PATH = '/fbr/api/reports/program/trainee-progress/';

export const getProgramReportsUrl = () => `${getConfig().LMS_BASE_URL}${PROGRAM_REPORT_PATH}`;
export const getProgramPeopleUrl = () => `${getConfig().LMS_BASE_URL}${PROGRAM_REPORT_USERS_PATH}`;
export const getProgramOverviewUrl = () => `${getConfig().LMS_BASE_URL}${PROGRAM_OVERVIEW_PATH}`;
export const getProgramTraineeProgressUrl = () => `${getConfig().LMS_BASE_URL}${PROGRAM_TRAINEE_PROGRESS_PATH}`;

const nullableValue = (value) => (value === null || value === undefined ? '—' : value);

export const mapProgramRow = (row) => ({
  id: row.program_key,
  programKey: row.program_key,
  program: row.program_title,
  city: row.program_city || '',
  instructorCount: row.instructor_count || 0,
  certificateCount: row.certificates_awarded || 0,
  enrolled: row.trainee_count || 0,
  completed: nullableValue(row.completed),
  avgScore: nullableValue(row.avg_score),
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
export const getProgramReports = async ({
  program, city, instructor, startDate, endDate, page = 1, pageSize,
} = {}) => {
  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  if (program && program !== 'all') { params.set('program', program); }
  if (city && city !== 'all') { params.set('city', city); }
  if (instructor && instructor !== 'all') { params.set('instructor', instructor); }
  if (startDate) { params.set('from', startDate); }
  if (endDate) { params.set('to', endDate); }

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
 * Fetches the instructors + certified trainees for one program, shaped for
 * `UserIdentity`/the People Sheet/the PDF export. Requested via `all=1` so a
 * single request backs both consumers (they share the react-query cache).
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
