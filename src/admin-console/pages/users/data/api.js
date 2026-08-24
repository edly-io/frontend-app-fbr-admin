import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import {
  getInitials, getPhotoUrl, getPaginatedResults, getUserDetail as fetchUserDetail,
} from '../../../data/api';
import { ROLE_LABELS, STATUS_LABELS } from '../constants';

export const BIODATA_USER_LIST_PATH = '/fbr/api/biodata/v1/users/';

export const getUsersUrl = () => `${getConfig().LMS_BASE_URL}${BIODATA_USER_LIST_PATH}`;

export const getRoleLabel = role => ROLE_LABELS[role] || role || 'Unassigned';

export const getStatusLabel = status => STATUS_LABELS[status] || status || 'Unknown';

export const mapProfileToUser = profile => ({
  id: profile.id,
  username: profile.username || '',
  name: profile.full_name || 'Unnamed user',
  email: profile.email || '',
  mobile: profile.mobile || '',
  photo: getPhotoUrl(profile.photo),
  initials: getInitials(profile.full_name),
  color: '#1B5E7A',
  status: getStatusLabel(profile.status),
  statusValue: profile.status,
  roles: Array.isArray(profile.roles) ? profile.roles : [],
  roleLabels: (Array.isArray(profile.roles) ? profile.roles : []).map(getRoleLabel),
  role: getRoleLabel((Array.isArray(profile.roles) ? profile.roles : [])[0]),
  batchNo: profile.batch?.name || profile.batch_no || '',
  batch: profile.batch || null,
  org: profile.batch?.name || profile.batch_no || '',
});

/**
 * Fetches a page of users. Preserves the exact query params used by the
 * original implementation: `page`, `page_size`, optional `role`, optional
 * `search`.
 */
export const getUsers = async ({
  page, pageSize, role, search,
}) => {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });

  if (role) { params.set('role', role); }
  if (search && search.trim()) { params.set('search', search.trim()); }

  const { data } = await getAuthenticatedHttpClient().get(`${getUsersUrl()}?${params.toString()}`);
  const results = getPaginatedResults(data);

  return {
    users: results.map(mapProfileToUser),
    total: typeof data?.count === 'number' ? data.count : results.length,
  };
};

/**
 * Probes whether the current caller is allowed to view the Super Admin /
 * Middle Admin tabs by issuing the exact same `?role=super_admin&page=1&page_size=1`
 * request the monolith used, and resolving true/false based on whether it
 * succeeds. No retries are attempted (a 403 is expected for non-super-admins).
 */
export const probeSuperAdminAccess = async () => {
  const params = new URLSearchParams({
    role: 'super_admin',
    page: '1',
    page_size: '1',
  });

  await getAuthenticatedHttpClient().get(`${getUsersUrl()}?${params.toString()}`);
  return true;
};

export const updateUserStatus = async (profileId, newStatus) => {
  const url = `${getConfig().LMS_BASE_URL}/fbr/api/biodata/v1/users/${profileId}/status/`;
  const { data } = await getAuthenticatedHttpClient().post(url, { status: newStatus });
  return data;
};

/**
 * Fetches full detail for a single user and merges it into the base user
 * object, mirroring the monolith's `fetchUserDetail` merge behavior. The
 * shared `getUserDetail` in `admin-console/data/api.js` only returns the raw
 * `{ user, data }` pair; the label re-mapping here is feature-specific
 * (depends on this feature's `ROLE_LABELS`/`STATUS_LABELS`).
 */
export const getUserDetail = async (user) => {
  const { data } = await fetchUserDetail(user);
  return {
    ...user,
    ...data,
    photo: getPhotoUrl(data.photo) || user.photo,
    initials: getInitials(data.full_name || user.name),
    color: user.color || '#1B5E7A',
    status: getStatusLabel(data.status) || user.status,
    roleLabels: Array.isArray(data.roles) ? data.roles.map(getRoleLabel) : user.roleLabels,
    batchNo: data.trainee_profile?.batch?.name || user.batchNo,
  };
};
