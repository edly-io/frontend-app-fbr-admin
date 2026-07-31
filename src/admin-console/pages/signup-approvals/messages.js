import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  breadcrumbLeaf: {
    id: 'fbrAdmin.signupApprovals.breadcrumb',
    defaultMessage: 'Signup Approvals',
    description: 'Breadcrumb leaf label for the Signup Approvals page.',
  },
  pageTitle: {
    id: 'fbrAdmin.signupApprovals.title',
    defaultMessage: 'Signup Approvals',
    description: 'Page title for the Signup Approvals page.',
  },
  pageSubtitle: {
    id: 'fbrAdmin.signupApprovals.subtitle',
    defaultMessage: 'Review pending sign-up requests and assign each user a role before granting access.',
    description: 'Subtitle shown below the Signup Approvals page title.',
  },
  refresh: {
    id: 'fbrAdmin.signupApprovals.refresh',
    defaultMessage: 'Refresh',
    description: 'Button label to refresh the signup approvals list.',
  },
  refreshedToast: {
    id: 'fbrAdmin.signupApprovals.toast.refreshed',
    defaultMessage: 'Approvals refreshed',
    description: 'Toast notification shown after manually refreshing the signup approvals list.',
  },
  searchPlaceholder: {
    id: 'fbrAdmin.signupApprovals.search.placeholder',
    defaultMessage: 'Search by username, email or name...',
    description: 'Placeholder for the Signup Approvals search input.',
  },
  pendingCount: {
    id: 'fbrAdmin.signupApprovals.count',
    defaultMessage: '{count} pending',
    description: 'Count of pending signup approvals.',
  },
  assignRoleButton: {
    id: 'fbrAdmin.signupApprovals.assignRole',
    defaultMessage: 'Assign Role',
    description: 'Button label to open the assign role modal for a pending signup.',
  },
  pendingApprovalBadge: {
    id: 'fbrAdmin.signupApprovals.badge.pendingApproval',
    defaultMessage: 'Pending Approval',
    description: 'Badge label shown next to a pending signup approval identity.',
  },
  joinedOn: {
    id: 'fbrAdmin.signupApprovals.joinedOn',
    defaultMessage: 'Joined {date}',
    description: 'Label showing when a pending user joined.',
  },
  unknownDate: {
    id: 'fbrAdmin.signupApprovals.unknownDate',
    defaultMessage: '—',
    description: 'Placeholder dash shown when the join date is unavailable.',
  },
  loading: {
    id: 'fbrAdmin.signupApprovals.loading',
    defaultMessage: 'Loading approvals...',
    description: 'Loading state shown while signup approvals are being fetched.',
  },
  emptyState: {
    id: 'fbrAdmin.signupApprovals.empty',
    defaultMessage: 'No pending approval requests.',
    description: 'Empty state shown when there are no pending signup approvals.',
  },
  loadError: {
    id: 'fbrAdmin.signupApprovals.error.load',
    defaultMessage: 'Unable to load sign-in approvals.',
    description: 'Fallback error message when signup approvals fail to load.',
  },
});

export default messages;
