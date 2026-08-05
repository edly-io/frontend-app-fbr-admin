import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  breadcrumbLeaf: {
    id: 'fbrAdmin.sessionsInstructorReports.breadcrumb',
    defaultMessage: 'Reports',
    description: 'Breadcrumb leaf label for the Sessions Report page.',
  },
  pageTitle: {
    id: 'fbrAdmin.sessionsInstructorReports.title',
    defaultMessage: 'Sessions',
    description: 'Page title for the Sessions Report page.',
  },
  pageSubtitle: {
    id: 'fbrAdmin.sessionsInstructorReports.subtitle',
    defaultMessage: 'Session delivery volume and hours breakdown across programs.',
    description: 'Subtitle shown below the Sessions Report page title.',
  },
  filterProgram: {
    id: 'fbrAdmin.sessionsInstructorReports.filter.program',
    defaultMessage: 'Program',
    description: 'Label for the Program filter dropdown.',
  },
  filterInstructor: {
    id: 'fbrAdmin.sessionsInstructorReports.filter.instructor',
    defaultMessage: 'Instructor',
    description: 'Label for the Instructor filter dropdown.',
  },
  filterAllPrograms: {
    id: 'fbrAdmin.sessionsInstructorReports.filter.allPrograms',
    defaultMessage: 'All Programs',
    description: 'Option to clear the Program filter.',
  },
  filterAllInstructors: {
    id: 'fbrAdmin.sessionsInstructorReports.filter.allInstructors',
    defaultMessage: 'All Instructors',
    description: 'Option to clear the Instructor filter.',
  },
  filterCity: {
    id: 'fbrAdmin.sessionsInstructorReports.filter.city',
    defaultMessage: 'City',
    description: 'Label for the City filter dropdown.',
  },
  filterAllCities: {
    id: 'fbrAdmin.sessionsInstructorReports.filter.allCities',
    defaultMessage: 'All Cities',
    description: 'Option to clear the City filter.',
  },
  filterDateRange: {
    id: 'fbrAdmin.sessionsInstructorReports.filter.dateRange',
    defaultMessage: 'Date Range',
    description: 'Label for the Date Range filter.',
  },
  filterDateRangeStart: {
    id: 'fbrAdmin.sessionsInstructorReports.filter.dateRange.start',
    defaultMessage: 'Start date',
    description: 'Accessible label for the Date Range filter\'s start date input.',
  },
  filterDateRangeEnd: {
    id: 'fbrAdmin.sessionsInstructorReports.filter.dateRange.end',
    defaultMessage: 'End date',
    description: 'Accessible label for the Date Range filter\'s end date input.',
  },
  downloadCsv: {
    id: 'fbrAdmin.sessionsInstructorReports.downloadCsv',
    defaultMessage: 'Download CSV',
    description: 'Button label for exporting the Sessions Report table as a CSV file.',
  },
  applyFilters: {
    id: 'fbrAdmin.sessionsInstructorReports.filter.apply',
    defaultMessage: 'Apply Filters',
    description: 'Button label to apply the selected filters and refresh the report.',
  },
  clearAllFilters: {
    id: 'fbrAdmin.sessionsInstructorReports.filter.clearAll',
    defaultMessage: 'Clear all filters',
    description: 'Button label to reset the Program/Instructor filters back to their defaults.',
  },
  colInstructor: {
    id: 'fbrAdmin.sessionsInstructorReports.col.instructor',
    defaultMessage: 'Instructor',
    description: 'Report table column header for the instructor name.',
  },
  colProgram: {
    id: 'fbrAdmin.sessionsInstructorReports.col.program',
    defaultMessage: 'Program',
    description: 'Report table column header for the primary program.',
  },
  colSessions: {
    id: 'fbrAdmin.sessionsInstructorReports.col.sessions',
    defaultMessage: 'Sessions',
    description: 'Report table column header for the session count.',
  },
  colHours: {
    id: 'fbrAdmin.sessionsInstructorReports.col.hours',
    defaultMessage: 'Hours',
    description: 'Report table column header for total hours delivered.',
  },
  colHoursBreakdown: {
    id: 'fbrAdmin.sessionsInstructorReports.col.hoursBreakdown',
    defaultMessage: 'Total Hours Breakdown',
    description: 'Report table column header for the hours breakdown progress bar.',
  },
  colHoursBreakdownTooltip: {
    id: 'fbrAdmin.sessionsInstructorReports.col.hoursBreakdown.tooltip',
    defaultMessage: 'How this instructor’s total hours split across the session types they taught.',
    description: 'Tooltip explaining what the Total Hours Breakdown column represents.',
  },
  colHoursBreakdownTooltipAlt: {
    id: 'fbrAdmin.sessionsInstructorReports.col.hoursBreakdown.tooltipAlt',
    defaultMessage: 'More information about the Total Hours Breakdown column',
    description: 'Accessible label for the info icon next to the Total Hours Breakdown column header.',
  },
  sessionCountAria: {
    id: 'fbrAdmin.sessionsInstructorReports.sessionCount.aria',
    defaultMessage: 'View {count, plural, one {# session} other {# sessions}} for {instructor}',
    description: 'Accessible label for the clickable session count button in the Sessions Report table.',
  },
  sessionSheetEyebrow: {
    id: 'fbrAdmin.sessionsInstructorReports.sessionSheet.eyebrow',
    defaultMessage: 'Sessions',
    description: 'Small eyebrow label shown above the instructor name in the session details sheet.',
  },
  sessionsEmptyState: {
    id: 'fbrAdmin.sessionsInstructorReports.sessionSheet.empty',
    defaultMessage: 'No sessions are recorded for this instructor yet.',
    description: 'Empty state shown in the session details sheet when an instructor has no sessions.',
  },
  closeSessionSheet: {
    id: 'fbrAdmin.sessionsInstructorReports.sessionSheet.close',
    defaultMessage: 'Close session details panel',
    description: 'Accessible label for the button that closes the session details sheet.',
  },
  sessionSheetCourseSessionCount: {
    id: 'fbrAdmin.sessionsInstructorReports.sessionSheet.courseSessionCount',
    defaultMessage: '{count, plural, one {# session} other {# sessions}}',
    description: 'Badge next to a course name in the session details sheet showing how many sessions it has.',
  },
  sessionSheetDurationValue: {
    id: 'fbrAdmin.sessionsInstructorReports.sessionSheet.durationValue',
    defaultMessage: '{hours}h',
    description: 'Formatted duration value (in hours) shown on a session card in the session details sheet.',
  },
  sessionSheetNoDuration: {
    id: 'fbrAdmin.sessionsInstructorReports.sessionSheet.noDuration',
    defaultMessage: 'No duration recorded',
    description: 'Fallback shown on a session card when it has no recorded duration.',
  },
  sessionSheetNoDate: {
    id: 'fbrAdmin.sessionsInstructorReports.sessionSheet.noDate',
    defaultMessage: 'No date recorded',
    description: 'Fallback shown on a session card when it has no recorded start date.',
  },
  sessionSheetLoading: {
    id: 'fbrAdmin.sessionsInstructorReports.sessionSheet.loading',
    defaultMessage: 'Loading sessions…',
    description: 'Loading state shown in the session details sheet while its data is being fetched.',
  },
  sessionSheetLoadError: {
    id: 'fbrAdmin.sessionsInstructorReports.sessionSheet.loadError',
    defaultMessage: 'Something went wrong while loading these sessions. Please try again.',
    description: 'Error state shown in the session details sheet when its data fails to load.',
  },
  statInstructors: {
    id: 'fbrAdmin.sessionsInstructorReports.stat.instructors',
    defaultMessage: 'Instructors',
    description: 'Stat card label for the total number of distinct instructors.',
  },
  statTotalSessions: {
    id: 'fbrAdmin.sessionsInstructorReports.stat.totalSessions',
    defaultMessage: 'Total Sessions',
    description: 'Stat card label for the total number of sessions delivered.',
  },
  statTotalHours: {
    id: 'fbrAdmin.sessionsInstructorReports.stat.totalHours',
    defaultMessage: 'Total Hours',
    description: 'Stat card label for the total number of hours delivered.',
  },
  emptyState: {
    id: 'fbrAdmin.sessionsInstructorReports.table.empty',
    defaultMessage: 'No records match the selected filters.',
    description: 'Empty state shown when the report table has no matching rows.',
  },
  rowStatus: {
    id: 'fbrAdmin.sessionsInstructorReports.table.rowStatus',
    defaultMessage: 'Showing {firstRow} - {lastRow} of {itemCount}.',
    description: 'Status text showing which rows of the report table are currently displayed.',
  },
  paginationLabel: {
    id: 'fbrAdmin.sessionsInstructorReports.table.paginationLabel',
    defaultMessage: 'Sessions Report pagination navigation',
    description: 'Accessible label for the Sessions Report table pagination controls.',
  },
  loadError: {
    id: 'fbrAdmin.sessionsInstructorReports.loadError',
    defaultMessage: 'Something went wrong while loading the report. Please try again.',
    description: 'Fallback error message shown when the Sessions Report fails to load.',
  },
});

export default messages;
