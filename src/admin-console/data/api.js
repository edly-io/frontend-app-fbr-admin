import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

// ─── Shared bootstrap + cross-feature endpoints ────────────────────────────
//
// These endpoints are shared by more than one feature folder (Users and
// Signup Approvals both use the Add/Assign flow and bulk import), so they
// live at the admin-console level rather than under a single feature.

export const BIODATA_USER_ME_PATH = '/fbr/api/biodata/v1/users/me/';
export const BIODATA_USER_CITIES_PATH = '/fbr/api/biodata/v1/users/cities/';
export const BIODATA_USER_BATCHES_PATH = '/fbr/api/biodata/v1/users/batches/';
export const BIODATA_USER_ADMIN_CREATE_PATH = '/fbr/api/biodata/v1/users/admins/';
export const BIODATA_USER_INSTRUCTOR_CREATE_PATH = '/fbr/api/biodata/v1/users/instructors/';
export const BIODATA_USER_TRAINEE_CREATE_PATH = '/fbr/api/biodata/v1/users/trainees/';
export const BIODATA_USER_BULK_IMPORT_SAMPLE_PATH = '/fbr/api/biodata/v1/users/bulk-import/sample/';
export const BIODATA_USER_BULK_IMPORT_PATH = '/fbr/api/biodata/v1/users/bulk-import/';

export const getLmsUrl = path => `${getConfig().LMS_BASE_URL}${path}`;

export const getBiodataUserDetailUrl = id => `${getConfig().LMS_BASE_URL}/fbr/api/biodata/v1/users/${id}/`;
export const getBiodataAssignRoleUrl = id => `${getConfig().LMS_BASE_URL}/fbr/api/biodata/v1/users/${id}/assign-role/`;
export const getBiodataBulkImportSampleUrl = role => `${getConfig().LMS_BASE_URL}${BIODATA_USER_BULK_IMPORT_SAMPLE_PATH}?role=${encodeURIComponent(role)}`;
export const getBiodataBulkImportUrl = () => `${getConfig().LMS_BASE_URL}${BIODATA_USER_BULK_IMPORT_PATH}`;

export const getProfileCreatePath = (role) => {
  if (['super_admin', 'middle_admin', 'data_admin'].includes(role)) {
    return BIODATA_USER_ADMIN_CREATE_PATH;
  }
  if (role === 'instructor') { return BIODATA_USER_INSTRUCTOR_CREATE_PATH; }
  return BIODATA_USER_TRAINEE_CREATE_PATH;
};

// ─── Generic helpers shared across feature data layers ─────────────────────

export const getPaginatedResults = (data) => {
  if (Array.isArray(data?.results)) {
    return data.results;
  }

  if (Array.isArray(data)) {
    return data;
  }

  return [];
};

export const getInitials = (name) => (
  (name || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase()
);

export const getPhotoUrl = (photo) => {
  if (!photo) { return null; }
  if (/^https?:\/\//.test(photo)) { return photo; }
  return `${getConfig().LMS_BASE_URL}${photo.startsWith('/') ? '' : '/'}${photo}`;
};

export const getProfileMfeUserUrl = (userId) => {
  if (!userId) { return null; }

  const configuredProfileUrl = getConfig().ACCOUNT_PROFILE_URL;
  const fallbackBaseUrl = (() => {
    const lmsBaseUrl = getConfig().LMS_BASE_URL;
    if (!lmsBaseUrl) {
      return null;
    }

    const lmsUrl = new URL(lmsBaseUrl);
    return `${lmsUrl.protocol}//apps.${lmsUrl.hostname}:1995/profile/`;
  })();

  const baseUrl = configuredProfileUrl
    ? `${configuredProfileUrl.replace(/\/?$/, '/')}`
    : fallbackBaseUrl;

  if (!baseUrl) { return null; }

  const url = new URL('u/', baseUrl);
  url.searchParams.set('for_user', String(userId));
  return url.toString();
};

// ─── Report filters (shared across the report pages) ───────────────────────

export const REPORT_FILTERS_PATH = '/fbr/api/reports/filters/';

export const getReportFiltersUrl = () => `${getConfig().LMS_BASE_URL}${REPORT_FILTERS_PATH}`;

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

// ─── Bootstrap data (caller profile / cities / batches) ────────────────────

export const getCallerProfile = async () => {
  const { data } = await getAuthenticatedHttpClient().get(getLmsUrl(BIODATA_USER_ME_PATH));
  return data;
};

export const getCities = async () => {
  const { data } = await getAuthenticatedHttpClient().get(getLmsUrl(BIODATA_USER_CITIES_PATH));
  return data;
};

export const getBatches = async () => {
  const { data } = await getAuthenticatedHttpClient().get(getLmsUrl(BIODATA_USER_BATCHES_PATH));
  return data;
};

/**
 * Loads the shared bootstrap data used to drive the Add User / Bulk Import
 * modals (caller profile + creatable roles, available cities, available
 * batches). Mirrors the original `Promise.all` all-or-nothing behavior: if
 * any of the three requests fail, all three fall back to their defaults.
 */
export const getAdminConsoleBootstrap = async () => {
  try {
    const [profileData, cityData, batchData] = await Promise.all([
      getCallerProfile(),
      getCities(),
      getBatches(),
    ]);

    return {
      callerProfile: {
        ...profileData,
        roles: Array.isArray(profileData?.roles) ? profileData.roles : [],
        creatable_roles: Array.isArray(profileData?.creatable_roles)
          ? profileData.creatable_roles
          : ['instructor', 'trainee'],
      },
      cities: Array.isArray(cityData) ? cityData : [],
      batches: Array.isArray(batchData) ? batchData : [],
    };
  } catch (error) {
    return {
      callerProfile: { roles: [], city: null, creatable_roles: ['instructor', 'trainee'] },
      cities: [],
      batches: [],
    };
  }
};

// ─── User detail (used to populate the View/Edit flows) ────────────────────

export const getUserDetail = async (user) => {
  const { data } = await getAuthenticatedHttpClient().get(getBiodataUserDetailUrl(user.id));
  return { user, data };
};

// ─── Add User / Bulk Import mutations (shared by Users + Signup Approvals) ─

export const createUserProfile = async ({ role, payload }) => {
  const { data } = await getAuthenticatedHttpClient().post(getLmsUrl(getProfileCreatePath(role)), payload);
  return data;
};

export const assignUserRole = async ({ assignmentUserId, payload }) => {
  const { data } = await getAuthenticatedHttpClient().post(getBiodataAssignRoleUrl(assignmentUserId), payload);
  return data;
};

export const bulkImportUsers = async ({ role, file, dryRun }) => {
  const formData = new FormData();
  formData.append('role', role);
  formData.append('dry_run', dryRun ? 'true' : 'false');
  formData.append('file', file);

  const { data } = await getAuthenticatedHttpClient().post(getBiodataBulkImportUrl(), formData);
  return data;
};

export const downloadBulkImportSample = async (role) => {
  const { data } = await getAuthenticatedHttpClient().get(getBiodataBulkImportSampleUrl(role), {
    responseType: 'blob',
  });
  return data;
};
