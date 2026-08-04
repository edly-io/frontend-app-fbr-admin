import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getPaginatedResults } from '../../../data/api';

export const BIODATA_USER_UNREGISTERED_PATH = '/fbr/api/biodata/v1/users/unregistered/';

export const getUnregisteredUsersUrl = () => `${getConfig().LMS_BASE_URL}${BIODATA_USER_UNREGISTERED_PATH}`;

export const getSignupApprovals = async ({ page, pageSize, search }) => {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });
  if (search && search.trim()) { params.set('search', search.trim()); }

  const { data } = await getAuthenticatedHttpClient().get(`${getUnregisteredUsersUrl()}?${params.toString()}`);
  const results = getPaginatedResults(data);

  return {
    approvals: results,
    total: typeof data?.count === 'number' ? data.count : results.length,
  };
};
