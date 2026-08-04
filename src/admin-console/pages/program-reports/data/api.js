import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getPaginatedResults } from '../../../data/api';

export const PROGRAM_REPORT_PATH = '/fbr/api/reports/program/';
export const PROGRAM_REPORT_USERS_PATH = '/fbr/api/reports/program/users/';
export const REPORT_FILTERS_PATH = '/fbr/api/reports/filters/';

export const getProgramReportsUrl = () => `${getConfig().LMS_BASE_URL}${PROGRAM_REPORT_PATH}`;
export const getProgramPeopleUrl = () => `${getConfig().LMS_BASE_URL}${PROGRAM_REPORT_USERS_PATH}`;
export const getReportFiltersUrl = () => `${getConfig().LMS_BASE_URL}${REPORT_FILTERS_PATH}`;

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
 * city name, instructor id). `count` is the total row count across all
 * pages, used by the caller to derive the DataTable's page count.
 */
export const getProgramReports = async ({
  program, city, instructor, page = 1, pageSize,
} = {}) => {
  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  if (program && program !== 'all') { params.set('program', program); }
  if (city && city !== 'all') { params.set('city', city); }
  if (instructor && instructor !== 'all') { params.set('instructor', instructor); }

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

/**
 * Fetches the Program/Instructor/City filter dropdown options from the
 * dedicated filters endpoint. City options use the city *name* as their
 * `value` (not id) to match `getProgramReports`'s `city` param, which the
 * backend matches against `city__name` exactly.
 */
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
