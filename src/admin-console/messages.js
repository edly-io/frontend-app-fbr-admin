import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  navSectionAdministration: {
    id: 'fbrAdmin.shell.nav.section.administration',
    defaultMessage: 'Administration',
    description: 'Sidebar section heading grouping the administration nav items.',
  },
  navSectionAnalytics: {
    id: 'fbrAdmin.shell.nav.section.analytics',
    defaultMessage: 'Analytics',
    description: 'Sidebar section heading grouping the analytics nav items.',
  },
  navUsers: {
    id: 'fbrAdmin.shell.nav.users',
    defaultMessage: 'Users',
    description: 'Sidebar nav item label for the Users page.',
  },
  navSignupApprovals: {
    id: 'fbrAdmin.shell.nav.signupApprovals',
    defaultMessage: 'Signup Approvals',
    description: 'Sidebar nav item label for the Signup Approvals page.',
  },
  navBiodataEditRequests: {
    id: 'fbrAdmin.shell.nav.biodataEditRequests',
    defaultMessage: 'Biodata Edit Request',
    description: 'Sidebar nav item label for the Biodata Edit Requests page.',
  },
  navCourses: {
    id: 'fbrAdmin.shell.nav.courses',
    defaultMessage: 'Courses',
    description: 'Sidebar nav item label for the placeholder Courses page.',
  },
  navRegionalOffices: {
    id: 'fbrAdmin.shell.nav.regionalOffices',
    defaultMessage: 'Regional Offices',
    description: 'Sidebar nav item label for the placeholder Regional Offices page.',
  },
  navAccessPolicies: {
    id: 'fbrAdmin.shell.nav.accessPolicies',
    defaultMessage: 'Access Policies',
    description: 'Sidebar nav item label for the placeholder Access Policies page.',
  },
  navAuditLog: {
    id: 'fbrAdmin.shell.nav.auditLog',
    defaultMessage: 'Audit Log',
    description: 'Sidebar nav item label for the placeholder Audit Log page.',
  },
  navOverView: {
    id: 'fbrAdmin.shell.nav.navOverView',
    defaultMessage: 'Overview',
    description: 'Sidebar nav item label for the placeholder Over view page.',
  },
  navReports: {
    id: 'fbrAdmin.shell.nav.navReports',
    defaultMessage: 'Reports',
    description: 'Sidebar nav item label for the placeholder Reports page.',
  },
  placeholderBody: {
    id: 'fbrAdmin.shell.placeholder.body',
    defaultMessage: 'This section is under construction.',
    description: 'Body copy shown on placeholder pages that have not been built yet.',
  },
  breadcrumbAdministration: {
    id: 'fbrAdmin.shell.breadcrumb.administration',
    defaultMessage: 'Administration',
    description: 'Breadcrumb root segment label shown above every admin console page.',
  },
  paginationShowing: {
    id: 'fbrAdmin.shell.pagination.showing',
    defaultMessage: 'Showing <strong>{start}–{end}</strong> of <strong>{total}</strong>',
    description: 'Pagination footer summary of the currently visible row range out of the total.',
  },
  paginationPrevious: {
    id: 'fbrAdmin.shell.pagination.previous',
    defaultMessage: 'Previous page',
    description: 'Accessible label for the pagination previous-page button.',
  },
  paginationNext: {
    id: 'fbrAdmin.shell.pagination.next',
    defaultMessage: 'Next page',
    description: 'Accessible label for the pagination next-page button.',
  },
  paginationRowsPerPage: {
    id: 'fbrAdmin.shell.pagination.rowsPerPage',
    defaultMessage: 'Rows per page',
    description: 'Label preceding the rows-per-page selector in a pagination footer.',
  },
});

export default messages;
