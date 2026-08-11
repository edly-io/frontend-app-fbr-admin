import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

const getBaseUrl = () => `${getConfig().LMS_BASE_URL}/fbr/announcements/api/v1`;

export const listAnnouncements = () => getAuthenticatedHttpClient().get(`${getBaseUrl()}/announcements/`);

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
