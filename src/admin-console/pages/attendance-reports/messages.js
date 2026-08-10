import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  breadcrumbLeaf: {
    id: 'fbrAdmin.attendanceReports.breadcrumb',
    defaultMessage: 'Attendance',
    description: 'Breadcrumb leaf label for the Attendance Report page.',
  },
  pageTitle: {
    id: 'fbrAdmin.attendanceReports.title',
    defaultMessage: 'Attendance',
    description: 'Page title for the Attendance Report page.',
  },
  pageSubtitle: {
    id: 'fbrAdmin.attendanceReports.subtitle',
    defaultMessage: 'Learner attendance and session compliance across programs.',
    description: 'Subtitle shown below the Attendance Report page title.',
  },
  filterProgram: {
    id: 'fbrAdmin.attendanceReports.filter.program',
    defaultMessage: 'Program',
    description: 'Label for the Program filter dropdown.',
  },
  filterInstructor: {
    id: 'fbrAdmin.attendanceReports.filter.instructor',
    defaultMessage: 'Instructor',
    description: 'Label for the Instructor filter dropdown.',
  },
  filterAllPrograms: {
    id: 'fbrAdmin.attendanceReports.filter.allPrograms',
    defaultMessage: 'All Programs',
    description: 'Option to clear the Program filter.',
  },
  filterAllInstructors: {
    id: 'fbrAdmin.attendanceReports.filter.allInstructors',
    defaultMessage: 'All Instructors',
    description: 'Option to clear the Instructor filter.',
  },
  filterCity: {
    id: 'fbrAdmin.attendanceReports.filter.city',
    defaultMessage: 'City',
    description: 'Label for the City filter dropdown.',
  },
  filterAllCities: {
    id: 'fbrAdmin.attendanceReports.filter.allCities',
    defaultMessage: 'All Cities',
    description: 'Option to clear the City filter.',
  },
  filterDateRange: {
    id: 'fbrAdmin.attendanceReports.filter.dateRange',
    defaultMessage: 'Date Range',
    description: 'Label for the Date Range filter.',
  },
  filterDateRangeStart: {
    id: 'fbrAdmin.attendanceReports.filter.dateRange.start',
    defaultMessage: 'Start date',
    description: 'Accessible label for the Date Range filter\'s start date input.',
  },
  filterDateRangeEnd: {
    id: 'fbrAdmin.attendanceReports.filter.dateRange.end',
    defaultMessage: 'End date',
    description: 'Accessible label for the Date Range filter\'s end date input.',
  },
  filterDateRangeMaxRangeCaption: {
    id: 'fbrAdmin.attendanceReports.filter.dateRange.maxRangeCaption',
    defaultMessage: 'You can select a maximum date range of 6 months.',
    description: 'Helper caption below the Date Range filter explaining the maximum selectable range.',
  },
  downloadCsv: {
    id: 'fbrAdmin.attendanceReports.downloadCsv',
    defaultMessage: 'Download CSV',
    description: 'Button label for exporting the Attendance Report table as a CSV file.',
  },
  downloadingCsv: {
    id: 'fbrAdmin.attendanceReports.downloadingCsv',
    defaultMessage: 'Downloading…',
    description: 'Button label shown while the Attendance Report CSV export is in progress.',
  },
  exportError: {
    id: 'fbrAdmin.attendanceReports.exportError',
    defaultMessage: 'Something went wrong while exporting the report. Please try again.',
    description: 'Error message shown when the Attendance Report CSV export request fails.',
  },
  applyFilters: {
    id: 'fbrAdmin.attendanceReports.filter.apply',
    defaultMessage: 'Apply Filters',
    description: 'Button label to apply the selected filters and refresh the report.',
  },
  clearAllFilters: {
    id: 'fbrAdmin.attendanceReports.filter.clearAll',
    defaultMessage: 'Clear all filters',
    description: 'Button label to reset the Program/Instructor/City filters back to their defaults.',
  },
  colLearner: {
    id: 'fbrAdmin.attendanceReports.col.learner',
    defaultMessage: 'Learner',
    description: 'Report table column header for the learner name.',
  },
  colProgram: {
    id: 'fbrAdmin.attendanceReports.col.program',
    defaultMessage: 'Program',
    description: 'Report table column header for the program name.',
  },
  colAttendance: {
    id: 'fbrAdmin.attendanceReports.col.attendance',
    defaultMessage: 'Attendance',
    description: 'Report table column header for the attended vs. total session count.',
  },
  colAttendancePercentage: {
    id: 'fbrAdmin.attendanceReports.col.attendancePercentage',
    defaultMessage: 'Attendance %',
    description: 'Report table column header for the attendance percentage.',
  },
  colAttendanceBreakdown: {
    id: 'fbrAdmin.attendanceReports.col.attendanceBreakdown',
    defaultMessage: 'Attendance Breakdown',
    description: 'Report table column header for the attendance breakdown progress bar.',
  },
  colAttendanceBreakdownTooltip: {
    id: 'fbrAdmin.attendanceReports.col.attendanceBreakdown.tooltip',
    defaultMessage: 'How this learner’s tracked sessions split across attendance statuses.',
    description: 'Tooltip explaining what the Attendance Breakdown column represents.',
  },
  colAttendanceBreakdownTooltipAlt: {
    id: 'fbrAdmin.attendanceReports.col.attendanceBreakdown.tooltipAlt',
    defaultMessage: 'More information about the Attendance Breakdown column',
    description: 'Accessible label for the info icon next to the Attendance Breakdown column header.',
  },
  attendanceCountAria: {
    id: 'fbrAdmin.attendanceReports.attendanceCount.aria',
    defaultMessage: 'View {count, plural, one {# attended session} other {# attended sessions}} for {learner}',
    description: 'Accessible label for the clickable attendance count button in the Attendance Report table.',
  },
  attendanceSheetEyebrow: {
    id: 'fbrAdmin.attendanceReports.sheet.eyebrow',
    defaultMessage: 'Attendance',
    description: 'Small eyebrow label shown above the learner name in the attendance details sheet.',
  },
  attendanceSessionsEmptyState: {
    id: 'fbrAdmin.attendanceReports.sheet.empty',
    defaultMessage: 'No sessions are recorded for this learner yet.',
    description: 'Empty state shown in the attendance details sheet when a learner has no sessions.',
  },
  closeAttendanceSheet: {
    id: 'fbrAdmin.attendanceReports.sheet.close',
    defaultMessage: 'Close attendance details panel',
    description: 'Accessible label for the button that closes the attendance details sheet.',
  },
  attendanceSheetCourseSessionCount: {
    id: 'fbrAdmin.attendanceReports.sheet.courseSessionCount',
    defaultMessage: '{count, plural, one {# session} other {# sessions}}',
    description: 'Badge next to a course name in the attendance details sheet showing how many sessions it has.',
  },
  attendanceSheetNoDate: {
    id: 'fbrAdmin.attendanceReports.sheet.noDate',
    defaultMessage: 'No date recorded',
    description: 'Fallback shown on a session row when it has no recorded date.',
  },
  attendanceSheetLoading: {
    id: 'fbrAdmin.attendanceReports.sheet.loading',
    defaultMessage: 'Loading attendance…',
    description: 'Loading state shown in the attendance details sheet while its data is being fetched.',
  },
  attendanceSheetLoadError: {
    id: 'fbrAdmin.attendanceReports.sheet.loadError',
    defaultMessage: 'Something went wrong while loading this attendance record. Please try again.',
    description: 'Error state shown in the attendance details sheet when its data fails to load.',
  },
  sessionStatusPresent: {
    id: 'fbrAdmin.attendanceReports.sessionStatus.present',
    defaultMessage: 'Present',
    description: 'Badge label for a session the learner attended.',
  },
  sessionStatusAbsent: {
    id: 'fbrAdmin.attendanceReports.sessionStatus.absent',
    defaultMessage: 'Absent',
    description: 'Badge label for a session the learner missed.',
  },
  sessionStatusLeave: {
    id: 'fbrAdmin.attendanceReports.sessionStatus.leave',
    defaultMessage: 'Leave',
    description: 'Badge label for a session the learner was on approved leave for.',
  },
  sessionStatusPending: {
    id: 'fbrAdmin.attendanceReports.sessionStatus.pending',
    defaultMessage: 'Pending',
    description: 'Badge label for a session whose attendance hasn\'t been recorded yet.',
  },
  statLearners: {
    id: 'fbrAdmin.attendanceReports.stat.learners',
    defaultMessage: 'Learners',
    description: 'Stat card label for the total number of distinct learners.',
  },
  statAvgAttendance: {
    id: 'fbrAdmin.attendanceReports.stat.avgAttendance',
    defaultMessage: 'Avg. Attendance',
    description: 'Stat card label for the average attendance percentage.',
  },
  statSessionsTracked: {
    id: 'fbrAdmin.attendanceReports.stat.sessionsTracked',
    defaultMessage: 'Sessions Tracked',
    description: 'Stat card label for the total number of attended sessions tracked.',
  },
  emptyState: {
    id: 'fbrAdmin.attendanceReports.table.empty',
    defaultMessage: 'No records match the selected filters.',
    description: 'Empty state shown when the report table has no matching rows.',
  },
  rowStatus: {
    id: 'fbrAdmin.attendanceReports.table.rowStatus',
    defaultMessage: 'Showing {firstRow} - {lastRow} of {itemCount}.',
    description: 'Status text showing which rows of the report table are currently displayed.',
  },
  paginationLabel: {
    id: 'fbrAdmin.attendanceReports.table.paginationLabel',
    defaultMessage: 'Attendance Report pagination navigation',
    description: 'Accessible label for the Attendance Report table pagination controls.',
  },
  loadError: {
    id: 'fbrAdmin.attendanceReports.loadError',
    defaultMessage: 'Something went wrong while loading the report. Please try again.',
    description: 'Fallback error message shown when the Attendance Report fails to load.',
  },
});

export default messages;
