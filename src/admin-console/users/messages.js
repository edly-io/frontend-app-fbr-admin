import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  breadcrumbLeaf: {
    id: 'fbrAdmin.users.breadcrumb',
    defaultMessage: 'Users',
    description: 'Breadcrumb leaf label for the Users page.',
  },
  pageTitle: {
    id: 'fbrAdmin.users.title',
    defaultMessage: 'Users',
    description: 'Page title for the Users page.',
  },
  pageSubtitle: {
    id: 'fbrAdmin.users.subtitle',
    defaultMessage: 'All users across the FBR admin console, grouped by role.',
    description: 'Subtitle shown below the Users page title.',
  },
  importButton: {
    id: 'fbrAdmin.users.toolbar.import',
    defaultMessage: 'Import',
    description: 'Button label to open the bulk import users modal.',
  },
  addUserButton: {
    id: 'fbrAdmin.users.toolbar.addUser',
    defaultMessage: 'Add User',
    description: 'Button label to open the add user modal.',
  },
  tabAll: {
    id: 'fbrAdmin.users.tabs.all',
    defaultMessage: 'All',
    description: 'Users list tab label showing every role.',
  },
  tabSuperAdmins: {
    id: 'fbrAdmin.users.tabs.superAdmins',
    defaultMessage: 'Super Admins',
    description: 'Users list tab label filtering to super admins.',
  },
  tabMiddleAdmins: {
    id: 'fbrAdmin.users.tabs.middleAdmins',
    defaultMessage: 'Middle Admins',
    description: 'Users list tab label filtering to middle admins.',
  },
  tabDataAdmins: {
    id: 'fbrAdmin.users.tabs.dataAdmins',
    defaultMessage: 'Data Admins',
    description: 'Users list tab label filtering to data admins.',
  },
  tabInstructors: {
    id: 'fbrAdmin.users.tabs.instructors',
    defaultMessage: 'Instructors',
    description: 'Users list tab label filtering to instructors.',
  },
  tabTrainees: {
    id: 'fbrAdmin.users.tabs.trainees',
    defaultMessage: 'Trainees',
    description: 'Users list tab label filtering to trainees.',
  },
  searchPlaceholder: {
    id: 'fbrAdmin.users.search.placeholder',
    defaultMessage: 'Search by name, email, CNIC or mobile...',
    description: 'Placeholder for the Users list search input.',
  },
  statusFilterLabel: {
    id: 'fbrAdmin.users.statusFilter.label',
    defaultMessage: 'Status: {status}',
    description: 'Status filter dropdown toggle label showing the current filter value.',
  },
  usersCount: {
    id: 'fbrAdmin.users.count',
    defaultMessage: '{count} {label}',
    description: 'Count of users shown next to the tabs, e.g. "12 instructors".',
  },
  columnIndex: {
    id: 'fbrAdmin.users.column.index',
    defaultMessage: '#',
    description: 'Table column header for the row index.',
  },
  columnFullName: {
    id: 'fbrAdmin.users.column.fullName',
    defaultMessage: 'FULL NAME',
    description: 'Table column header for the user full name.',
  },
  columnEmail: {
    id: 'fbrAdmin.users.column.email',
    defaultMessage: 'EMAIL',
    description: 'Table column header for the user email.',
  },
  columnBatch: {
    id: 'fbrAdmin.users.column.batch',
    defaultMessage: 'BATCH',
    description: 'Table column header for the user batch.',
  },
  columnMobile: {
    id: 'fbrAdmin.users.column.mobile',
    defaultMessage: 'MOBILE',
    description: 'Table column header for the user mobile number.',
  },
  columnStatus: {
    id: 'fbrAdmin.users.column.status',
    defaultMessage: 'STATUS',
    description: 'Table column header for the user status.',
  },
  columnActions: {
    id: 'fbrAdmin.users.column.actions',
    defaultMessage: 'ACTIONS',
    description: 'Table column header for row actions.',
  },
  loading: {
    id: 'fbrAdmin.users.loading',
    defaultMessage: 'Loading users...',
    description: 'Loading state shown while the users list is being fetched.',
  },
  emptyState: {
    id: 'fbrAdmin.users.empty',
    defaultMessage: 'No users found.',
    description: 'Empty state shown when there are no users matching the current filters.',
  },
  loadError: {
    id: 'fbrAdmin.users.error.load',
    defaultMessage: 'Unable to load users.',
    description: 'Fallback error message when the users list fails to load.',
  },
  viewTooltip: {
    id: 'fbrAdmin.users.row.view',
    defaultMessage: 'View',
    description: 'Tooltip / title for the view-user row action button.',
  },
  editTooltip: {
    id: 'fbrAdmin.users.row.edit',
    defaultMessage: 'Edit',
    description: 'Tooltip / title for the edit-user row action button.',
  },
  emptyValue: {
    id: 'fbrAdmin.users.row.emptyValue',
    defaultMessage: '—',
    description: 'Placeholder dash shown for an empty table cell value.',
  },
  actionMenuToggle: {
    id: 'fbrAdmin.users.actionMenu.toggle',
    defaultMessage: 'More actions',
    description: 'Accessible label for the row three-dot action menu toggle button.',
  },
  actionMenuViewProfile: {
    id: 'fbrAdmin.users.actionMenu.viewProfile',
    defaultMessage: 'View Profile',
    description: 'Action menu item to view a user profile.',
  },
  actionMenuEditUser: {
    id: 'fbrAdmin.users.actionMenu.editUser',
    defaultMessage: 'Edit User',
    description: 'Action menu item to edit a user.',
  },
  actionMenuDeactivate: {
    id: 'fbrAdmin.users.actionMenu.deactivate',
    defaultMessage: 'Deactivate',
    description: 'Action menu item to deactivate an active user.',
  },
  actionMenuActivate: {
    id: 'fbrAdmin.users.actionMenu.activate',
    defaultMessage: 'Activate',
    description: 'Action menu item to activate an inactive user.',
  },
});

export default messages;
