import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  pageTitle: {
    id: 'fbrAdmin.biodataEditRequests.title',
    defaultMessage: 'Biodata Edit Request',
    description: 'Page title / breadcrumb leaf for the Biodata Edit Requests page.',
  },
  pageSubtitle: {
    id: 'fbrAdmin.biodataEditRequests.subtitle',
    defaultMessage: 'Review trainee biodata edit requests and mark them resolved after making required updates.',
    description: 'Subtitle shown below the Biodata Edit Requests page title.',
  },
  refresh: {
    id: 'fbrAdmin.biodataEditRequests.refresh',
    defaultMessage: 'Refresh',
    description: 'Button label to refresh the biodata edit requests list.',
  },
  statusFilterLabel: {
    id: 'fbrAdmin.biodataEditRequests.statusFilter.label',
    defaultMessage: 'Status: {status}',
    description: 'Status filter dropdown toggle label showing the current filter value.',
  },
  statusFilterAll: {
    id: 'fbrAdmin.biodataEditRequests.statusFilter.all',
    defaultMessage: 'All',
    description: 'Status filter dropdown option showing all edit requests.',
  },
  statusPending: {
    id: 'fbrAdmin.biodataEditRequests.statusFilter.pending',
    defaultMessage: 'Pending',
    description: 'Status filter dropdown option / badge label for pending edit requests.',
  },
  statusResolved: {
    id: 'fbrAdmin.biodataEditRequests.statusFilter.resolved',
    defaultMessage: 'Resolved',
    description: 'Status filter dropdown option / badge label for resolved edit requests.',
  },
  requestsCount: {
    id: 'fbrAdmin.biodataEditRequests.count',
    defaultMessage: '{count} requests',
    description: 'Count of biodata edit requests shown next to the status filter.',
  },
  columnProfile: {
    id: 'fbrAdmin.biodataEditRequests.column.profile',
    defaultMessage: 'PROFILE',
    description: 'Table column header for the requesting profile.',
  },
  columnMessage: {
    id: 'fbrAdmin.biodataEditRequests.column.message',
    defaultMessage: 'MESSAGE',
    description: 'Table column header for the edit request message.',
  },
  columnStatus: {
    id: 'fbrAdmin.biodataEditRequests.column.status',
    defaultMessage: 'STATUS',
    description: 'Table column header for the edit request status.',
  },
  columnRequested: {
    id: 'fbrAdmin.biodataEditRequests.column.requested',
    defaultMessage: 'REQUESTED',
    description: 'Table column header for the request creation date.',
  },
  columnResolvedBy: {
    id: 'fbrAdmin.biodataEditRequests.column.resolvedBy',
    defaultMessage: 'RESOLVED BY',
    description: 'Table column header for who resolved the request.',
  },
  columnAdminNote: {
    id: 'fbrAdmin.biodataEditRequests.column.adminNote',
    defaultMessage: 'ADMIN NOTE',
    description: 'Table column header for the admin resolution note.',
  },
  columnAction: {
    id: 'fbrAdmin.biodataEditRequests.column.action',
    defaultMessage: 'ACTION',
    description: 'Table column header for row actions.',
  },
  loading: {
    id: 'fbrAdmin.biodataEditRequests.loading',
    defaultMessage: 'Loading requests...',
    description: 'Loading state shown while biodata edit requests are being fetched.',
  },
  emptyState: {
    id: 'fbrAdmin.biodataEditRequests.empty',
    defaultMessage: 'No biodata edit requests found.',
    description: 'Empty state shown when there are no biodata edit requests.',
  },
  adminNotePlaceholder: {
    id: 'fbrAdmin.biodataEditRequests.adminNote.placeholder',
    defaultMessage: 'Optional note',
    description: 'Placeholder for the admin note textarea on a pending edit request.',
  },
  resolveButton: {
    id: 'fbrAdmin.biodataEditRequests.resolve',
    defaultMessage: 'Resolve',
    description: 'Button label to resolve a pending biodata edit request.',
  },
  resolving: {
    id: 'fbrAdmin.biodataEditRequests.resolving',
    defaultMessage: 'Resolving...',
    description: 'Button label shown while a biodata edit request is being resolved.',
  },
  resolvedAt: {
    id: 'fbrAdmin.biodataEditRequests.resolvedAt',
    defaultMessage: 'Resolved {date}',
    description: 'Label showing when a biodata edit request was resolved.',
  },
  unknownDate: {
    id: 'fbrAdmin.biodataEditRequests.unknownDate',
    defaultMessage: '—',
    description: 'Placeholder dash shown when a date value is unavailable.',
  },
  resolvedToast: {
    id: 'fbrAdmin.biodataEditRequests.toast.resolved',
    defaultMessage: 'Edit request marked as resolved.',
    description: 'Toast notification shown after successfully resolving a biodata edit request.',
  },
  loadError: {
    id: 'fbrAdmin.biodataEditRequests.error.load',
    defaultMessage: 'Unable to load biodata edit requests.',
    description: 'Fallback error message when biodata edit requests fail to load.',
  },
  resolveError: {
    id: 'fbrAdmin.biodataEditRequests.error.resolve',
    defaultMessage: 'Unable to resolve this request.',
    description: 'Fallback error message when resolving a biodata edit request fails.',
  },
  profileFallback: {
    id: 'fbrAdmin.biodataEditRequests.profileFallback',
    defaultMessage: 'Profile #{profileId}',
    description: 'Fallback display name for a profile that has no name on file.',
  },
  badgeTrainee: {
    id: 'fbrAdmin.biodataEditRequests.badge.trainee',
    defaultMessage: 'Trainee',
    description: 'Badge label shown next to a trainee profile identity.',
  },
  badgeAdmin: {
    id: 'fbrAdmin.biodataEditRequests.badge.admin',
    defaultMessage: 'Admin',
    description: 'Badge label shown next to the admin who resolved a request.',
  },
});

export default messages;
