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
  navSectionReports: {
    id: 'fbrAdmin.shell.nav.section.reports',
    defaultMessage: 'Reports',
    description: 'Sidebar section heading grouping the reports nav items.',
  },
  navSectionCommunications: {
    id: 'fbrAdmin.shell.nav.section.communications',
    defaultMessage: 'Communications',
    description: 'Sidebar section heading grouping the communications nav items.',
  },
  navAnnouncements: {
    id: 'fbrAdmin.shell.nav.announcements',
    defaultMessage: 'Announcements',
    description: 'Sidebar nav item label for the Announcements page.',
  },
  navDashboard: {
    id: 'fbrAdmin.shell.nav.dashboard',
    defaultMessage: 'Dashboard',
    description: 'Sidebar nav item label for the Dashboard page.',
  },
  navDocuments: {
    id: 'fbrAdmin.shell.nav.documents',
    defaultMessage: 'Documents',
    description: 'Sidebar nav item label for the Documents page.',
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
  navHrms: {
    id: 'fbrAdmin.shell.nav.hrms',
    defaultMessage: 'HRMS',
    description: 'Sidebar nav item label for the HRMS employees page.',
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
  navProgram: {
    id: 'fbrAdmin.shell.nav.navProgram',
    defaultMessage: 'Program',
    description: 'Sidebar nav item label for the placeholder Program page.',
  },
  navReports: {
    id: 'fbrAdmin.shell.nav.navReports',
    defaultMessage: 'Reports',
    description: 'Sidebar nav item label for the placeholder Reports page.',
  },
  navSessionsInstructor: {
    id: 'fbrAdmin.shell.nav.navSessionsInstructor',
    defaultMessage: 'Sessions',
    description: 'Sidebar nav item label for the Sessions Reports page.',
  },
  navAttendance: {
    id: 'fbrAdmin.shell.nav.navAttendance',
    defaultMessage: 'Attendance',
    description: 'Sidebar nav item label for the Attendance Reports page.',
  },
  navCurrentPage: {
    id: 'fbrAdmin.shell.nav.currentPage',
    defaultMessage: 'Current page',
    description: 'Screen-reader-only text marking the nav item for the page currently being viewed.',
  },
  navMobileTriggerLabel: {
    id: 'fbrAdmin.shell.nav.mobile.triggerLabel',
    defaultMessage: 'Change section. Currently viewing {section}, {page}. {count, plural, =0 {} one {# item needs attention.} other {# items need attention.}}',
    description: 'Accessible name for the mobile context bar button that opens the navigation sheet.',
  },
  navMobileSheetTitle: {
    id: 'fbrAdmin.shell.nav.mobile.sheetTitle',
    defaultMessage: 'Go to section',
    description: 'Heading of the mobile bottom sheet that holds the admin console navigation.',
  },
  navMobileSheetClose: {
    id: 'fbrAdmin.shell.nav.mobile.sheetClose',
    defaultMessage: 'Close section menu',
    description: 'Accessible label for the button that dismisses the mobile navigation sheet.',
  },
  navMobileNoActiveSection: {
    id: 'fbrAdmin.shell.nav.mobile.noActiveSection',
    defaultMessage: 'Select a section',
    description: 'Mobile context bar label shown on pages that are not part of the navigation.',
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
  breadcrumbReports: {
    id: 'fbrAdmin.shell.breadcrumb.reports',
    defaultMessage: 'Reports',
    description: 'Breadcrumb root segment label shown above every reports page.',
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
  permissionDenied: {
    id: 'fbrAdmin.shell.permissionDenied',
    defaultMessage: 'You are not authorized to view this page. If you feel you should have access, please reach out to your administrator.',
    description: 'Alert shown when a caller without the required role navigates to a restricted page.',
  },
});

export default messages;
