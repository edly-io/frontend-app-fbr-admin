import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

const getBaseUrl = () => `${getConfig().LMS_BASE_URL}/fbr/announcements/api/v1`;
const getProgramsUrl = () => `${getConfig().STUDIO_BASE_URL}/fbr/api/programs`;

// Announcements uses DefaultPagination → flat { count, next, previous, results }.
export const listAnnouncements = ({
  search = '', filter = '', page = 1, pageSize = 25, signal,
} = {}) => {
  const params = new URLSearchParams();
  if (search) { params.set('search', search); }
  if (filter) { params.set('filter', filter); }
  params.set('page', String(page));
  params.set('page_size', String(pageSize));
  return getAuthenticatedHttpClient().get(`${getBaseUrl()}/announcements/?${params.toString()}`, { signal });
};

export const createAnnouncement = (payload) => getAuthenticatedHttpClient().post(`${getBaseUrl()}/announcements/`, payload);

export const updateAnnouncement = (id, payload) => getAuthenticatedHttpClient().patch(`${getBaseUrl()}/announcements/${id}/`, payload);

export const deleteAnnouncement = (id) => getAuthenticatedHttpClient().delete(`${getBaseUrl()}/announcements/${id}/`);

export const sendAnnouncement = (id) => getAuthenticatedHttpClient().post(`${getBaseUrl()}/announcements/${id}/send/`);

export const uploadAttachment = (announcementId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return getAuthenticatedHttpClient().post(`${getBaseUrl()}/announcements/${announcementId}/attachments/`, formData);
};

export const deleteAttachment = (announcementId, attachmentId) => getAuthenticatedHttpClient().delete(`${getBaseUrl()}/announcements/${announcementId}/attachments/${attachmentId}/`);

export const previewRecipients = (scope, programKey = '', recipientTypes = []) => getAuthenticatedHttpClient().post(`${getBaseUrl()}/preview-recipients/`, {
  scope,
  program_key: programKey,
  recipient_types: recipientTypes,
});

export const getAnnouncementRecipients = (announcementId) => getAuthenticatedHttpClient().get(`${getBaseUrl()}/announcements/${announcementId}/recipients/`);

// Programs uses NamespacedPageNumberPagination → nested { pagination: { count, num_pages, ... }, results }.
export const listPrograms = ({
  search = '', page = 1, pageSize = 20, signal,
} = {}) => {
  const params = new URLSearchParams();
  if (search) { params.set('search', search); }
  params.set('page', String(page));
  params.set('page_size', String(pageSize));
  return getAuthenticatedHttpClient().get(`${getProgramsUrl()}/?${params.toString()}`, { signal });
};

export const getProgram = (programKey) => getAuthenticatedHttpClient().get(`${getProgramsUrl()}/${encodeURIComponent(programKey)}/`);
