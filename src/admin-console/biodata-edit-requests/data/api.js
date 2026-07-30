import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getPaginatedResults } from '../../data/api';

export const BIODATA_EDIT_REQUESTS_PATH = '/fbr/api/biodata/v1/edit-requests/';

export const getEditRequestsUrl = () => `${getConfig().LMS_BASE_URL}${BIODATA_EDIT_REQUESTS_PATH}`;
export const getEditRequestResolveUrl = id => `${getConfig().LMS_BASE_URL}${BIODATA_EDIT_REQUESTS_PATH}${id}/resolve/`;

export const getEditRequests = async ({ page, pageSize, statusFilter }) => {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });
  if (statusFilter !== 'all') { params.set('status', statusFilter); }

  const { data } = await getAuthenticatedHttpClient().get(`${getEditRequestsUrl()}?${params.toString()}`);
  const results = getPaginatedResults(data);

  return {
    requests: results,
    total: typeof data?.count === 'number' ? data.count : results.length,
  };
};

export const resolveEditRequest = async ({ requestId, adminNote }) => {
  const { data } = await getAuthenticatedHttpClient().post(
    getEditRequestResolveUrl(requestId),
    { admin_note: adminNote || '' },
  );
  return data;
};
