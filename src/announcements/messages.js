import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  bannerLimitReached: {
    id: 'fbrAdmin.createAnnouncementModal.bannerLimitReached',
    defaultMessage: 'Maximum 2 active banners reached. Banner channel is unavailable until an existing banner expires.',
    description: 'Warning shown in the Create Announcement modal when two banners are already active, so the Banner channel cannot be selected.',
  },
});

export default messages;
