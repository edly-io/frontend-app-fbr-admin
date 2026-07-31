import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  breadcrumbLeaf: {
    id: 'fbrAdmin.reports.breadcrumb',
    defaultMessage: 'Reports',
    description: 'Breadcrumb leaf label for the Reports page.',
  },
  pageTitle: {
    id: 'fbrAdmin.reports.title',
    defaultMessage: 'Reports',
    description: 'Page title for the Reports page.',
  },
  pageSubtitle: {
    id: 'fbrAdmin.reports.subtitle',
    defaultMessage: 'Generate and export detailed reports across programs, sessions and learners.',
    description: 'Subtitle shown below the Reports page title.',
  },
  exportButton: {
    id: 'fbrAdmin.reports.export',
    defaultMessage: 'Export PDF',
    description: 'Button label to export the current report view as a PDF.',
  },
  filterProgram: {
    id: 'fbrAdmin.reports.filter.program',
    defaultMessage: 'Program',
    description: 'Label for the Program filter dropdown.',
  },
  filterInstructor: {
    id: 'fbrAdmin.reports.filter.instructor',
    defaultMessage: 'Instructor',
    description: 'Label for the Instructor filter dropdown.',
  },
  filterRegion: {
    id: 'fbrAdmin.reports.filter.region',
    defaultMessage: 'Region',
    description: 'Label for the Region filter dropdown.',
  },
  filterAllPrograms: {
    id: 'fbrAdmin.reports.filter.allPrograms',
    defaultMessage: 'All Programs',
    description: 'Option to clear the Program filter.',
  },
  filterAllInstructors: {
    id: 'fbrAdmin.reports.filter.allInstructors',
    defaultMessage: 'All Instructors',
    description: 'Option to clear the Instructor filter.',
  },
  filterAllRegions: {
    id: 'fbrAdmin.reports.filter.allRegions',
    defaultMessage: 'All Regions',
    description: 'Option to clear the Region filter.',
  },
  tabSessionsPerInstructor: {
    id: 'fbrAdmin.reports.tab.sessionsPerInstructor',
    defaultMessage: 'Sessions / Instructor',
    description: 'Report type tab label for sessions grouped by instructor.',
  },
  tabProgram: {
    id: 'fbrAdmin.reports.tab.program',
    defaultMessage: 'Program',
    description: 'Report type tab label for the program summary report.',
  },
  tabSession: {
    id: 'fbrAdmin.reports.tab.session',
    defaultMessage: 'Session',
    description: 'Report type tab label for the session-level report.',
  },
  tabAttendance: {
    id: 'fbrAdmin.reports.tab.attendance',
    defaultMessage: 'Attendance',
    description: 'Report type tab label for the learner attendance report.',
  },
  tabFeedback: {
    id: 'fbrAdmin.reports.tab.feedback',
    defaultMessage: 'Feedback',
    description: 'Report type tab label for the session feedback report.',
  },
  tabEnrolled: {
    id: 'fbrAdmin.reports.tab.enrolled',
    defaultMessage: 'Enrolled Users',
    description: 'Report type tab label for the enrolled users report.',
  },
  tabProgress: {
    id: 'fbrAdmin.reports.tab.progress',
    defaultMessage: 'User Progress',
    description: 'Report type tab label for the learner progress report.',
  },
  colInstructor: {
    id: 'fbrAdmin.reports.col.instructor',
    defaultMessage: 'Instructor',
    description: 'Report table column header for instructor name.',
  },
  colPrimaryProgram: {
    id: 'fbrAdmin.reports.col.primaryProgram',
    defaultMessage: 'Primary Program',
    description: 'Report table column header for an instructor\'s primary program.',
  },
  colSessions: {
    id: 'fbrAdmin.reports.col.sessions',
    defaultMessage: 'Sessions',
    description: 'Report table column header for session count.',
  },
  colHours: {
    id: 'fbrAdmin.reports.col.hours',
    defaultMessage: 'Hours',
    description: 'Report table column header for hours delivered.',
  },
  colAvgAttendance: {
    id: 'fbrAdmin.reports.col.avgAttendance',
    defaultMessage: 'Avg. Attendance',
    description: 'Report table column header for average attendance percentage.',
  },
  colAvgFeedback: {
    id: 'fbrAdmin.reports.col.avgFeedback',
    defaultMessage: 'Avg. Feedback',
    description: 'Report table column header for average feedback score.',
  },
  colProgram: {
    id: 'fbrAdmin.reports.col.program',
    defaultMessage: 'Program',
    description: 'Report table column header for program name.',
  },
  colCategory: {
    id: 'fbrAdmin.reports.col.category',
    defaultMessage: 'Category',
    description: 'Report table column header for program category.',
  },
  colEnrolled: {
    id: 'fbrAdmin.reports.col.enrolled',
    defaultMessage: 'Enrolled',
    description: 'Report table column header for enrolled learner count.',
  },
  colCompleted: {
    id: 'fbrAdmin.reports.col.completed',
    defaultMessage: 'Completed',
    description: 'Report table column header for completed learner count.',
  },
  colCompletion: {
    id: 'fbrAdmin.reports.col.completion',
    defaultMessage: 'Completion',
    description: 'Report table column header for completion percentage.',
  },
  colAvgScore: {
    id: 'fbrAdmin.reports.col.avgScore',
    defaultMessage: 'Avg. Score',
    description: 'Report table column header for average assessment score.',
  },
  colDate: {
    id: 'fbrAdmin.reports.col.date',
    defaultMessage: 'Date',
    description: 'Report table column header for a session date.',
  },
  colSession: {
    id: 'fbrAdmin.reports.col.session',
    defaultMessage: 'Session',
    description: 'Report table column header for session title.',
  },
  colRegion: {
    id: 'fbrAdmin.reports.col.region',
    defaultMessage: 'Region',
    description: 'Report table column header for region.',
  },
  colAttendance: {
    id: 'fbrAdmin.reports.col.attendance',
    defaultMessage: 'Attendance',
    description: 'Report table column header for a session attendance percentage.',
  },
  colStatus: {
    id: 'fbrAdmin.reports.col.status',
    defaultMessage: 'Status',
    description: 'Report table column header for status.',
  },
  colLearner: {
    id: 'fbrAdmin.reports.col.learner',
    defaultMessage: 'Learner',
    description: 'Report table column header for learner name.',
  },
  colAttended: {
    id: 'fbrAdmin.reports.col.attended',
    defaultMessage: 'Sessions Attended',
    description: 'Report table column header for the count of sessions attended out of total.',
  },
  colAttendanceRate: {
    id: 'fbrAdmin.reports.col.attendanceRate',
    defaultMessage: 'Attendance Rate',
    description: 'Report table column header for a learner\'s attendance rate percentage.',
  },
  colResponses: {
    id: 'fbrAdmin.reports.col.responses',
    defaultMessage: 'Responses',
    description: 'Report table column header for feedback response count.',
  },
  colContent: {
    id: 'fbrAdmin.reports.col.content',
    defaultMessage: 'Content',
    description: 'Report table column header for content rating.',
  },
  colInstructorRating: {
    id: 'fbrAdmin.reports.col.instructorRating',
    defaultMessage: 'Instructor Rating',
    description: 'Report table column header for instructor rating out of 5.',
  },
  colRelevance: {
    id: 'fbrAdmin.reports.col.relevance',
    defaultMessage: 'Relevance',
    description: 'Report table column header for relevance rating.',
  },
  colNps: {
    id: 'fbrAdmin.reports.col.nps',
    defaultMessage: 'NPS',
    description: 'Report table column header for Net Promoter Score.',
  },
  colDepartment: {
    id: 'fbrAdmin.reports.col.department',
    defaultMessage: 'Department',
    description: 'Report table column header for department.',
  },
  colCohort: {
    id: 'fbrAdmin.reports.col.cohort',
    defaultMessage: 'Cohort',
    description: 'Report table column header for cohort.',
  },
  colEnrolledDate: {
    id: 'fbrAdmin.reports.col.enrolledDate',
    defaultMessage: 'Enrolled On',
    description: 'Report table column header for enrollment date.',
  },
  colModules: {
    id: 'fbrAdmin.reports.col.modules',
    defaultMessage: 'Modules',
    description: 'Report table column header for modules completed out of total.',
  },
  colProgress: {
    id: 'fbrAdmin.reports.col.progress',
    defaultMessage: 'Progress',
    description: 'Report table column header for progress percentage.',
  },
  colLastActivity: {
    id: 'fbrAdmin.reports.col.lastActivity',
    defaultMessage: 'Last Activity',
    description: 'Report table column header for the date of last learner activity.',
  },
  statTotalSessions: {
    id: 'fbrAdmin.reports.stat.totalSessions',
    defaultMessage: 'Total Sessions',
    description: 'Stat card label for total session count.',
  },
  statTotalHours: {
    id: 'fbrAdmin.reports.stat.totalHours',
    defaultMessage: 'Total Hours',
    description: 'Stat card label for total hours delivered.',
  },
  statAvgFeedback: {
    id: 'fbrAdmin.reports.stat.avgFeedback',
    defaultMessage: 'Avg. Feedback Score',
    description: 'Stat card label for average feedback score.',
  },
  statProgramCount: {
    id: 'fbrAdmin.reports.stat.programCount',
    defaultMessage: 'Programs',
    description: 'Stat card label for the number of programs.',
  },
  statAvgCompletion: {
    id: 'fbrAdmin.reports.stat.avgCompletion',
    defaultMessage: 'Avg. Completion',
    description: 'Stat card label for average completion percentage.',
  },
  statAvgScore: {
    id: 'fbrAdmin.reports.stat.avgScore',
    defaultMessage: 'Avg. Score',
    description: 'Stat card label for average assessment score.',
  },
  statSessionCount: {
    id: 'fbrAdmin.reports.stat.sessionCount',
    defaultMessage: 'Sessions',
    description: 'Stat card label for the number of sessions.',
  },
  statCompletedCount: {
    id: 'fbrAdmin.reports.stat.completedCount',
    defaultMessage: 'Completed',
    description: 'Stat card label for a completed count.',
  },
  statAvgAttendance: {
    id: 'fbrAdmin.reports.stat.avgAttendance',
    defaultMessage: 'Avg. Attendance',
    description: 'Stat card label for average attendance percentage.',
  },
  statLearnerCount: {
    id: 'fbrAdmin.reports.stat.learnerCount',
    defaultMessage: 'Learners',
    description: 'Stat card label for the number of learners.',
  },
  statBelowSixty: {
    id: 'fbrAdmin.reports.stat.belowSixty',
    defaultMessage: 'Below 60% Attendance',
    description: 'Stat card label for the count of learners below 60% attendance.',
  },
  statResponseCount: {
    id: 'fbrAdmin.reports.stat.responseCount',
    defaultMessage: 'Responses',
    description: 'Stat card label for the number of feedback responses.',
  },
  statAvgRating: {
    id: 'fbrAdmin.reports.stat.avgRating',
    defaultMessage: 'Avg. Rating',
    description: 'Stat card label for average feedback rating.',
  },
  statAvgNps: {
    id: 'fbrAdmin.reports.stat.avgNps',
    defaultMessage: 'Avg. NPS',
    description: 'Stat card label for average Net Promoter Score.',
  },
  statEnrolledCount: {
    id: 'fbrAdmin.reports.stat.enrolledCount',
    defaultMessage: 'Enrolled',
    description: 'Stat card label for the number of enrolled learners.',
  },
  statActiveCount: {
    id: 'fbrAdmin.reports.stat.activeCount',
    defaultMessage: 'In Progress',
    description: 'Stat card label for the number of learners in progress.',
  },
  statNotStartedCount: {
    id: 'fbrAdmin.reports.stat.notStartedCount',
    defaultMessage: 'Not Started',
    description: 'Stat card label for the number of learners not yet started.',
  },
  statAvgProgress: {
    id: 'fbrAdmin.reports.stat.avgProgress',
    defaultMessage: 'Avg. Progress',
    description: 'Stat card label for average learner progress percentage.',
  },
  statusCompleted: {
    id: 'fbrAdmin.reports.status.completed',
    defaultMessage: 'Completed',
    description: 'Status badge label for a completed record.',
  },
  statusInProgress: {
    id: 'fbrAdmin.reports.status.inProgress',
    defaultMessage: 'In progress',
    description: 'Status badge label for a record in progress.',
  },
  statusNotStarted: {
    id: 'fbrAdmin.reports.status.notStarted',
    defaultMessage: 'Not started',
    description: 'Status badge label for a record not yet started.',
  },
  statusOverdue: {
    id: 'fbrAdmin.reports.status.overdue',
    defaultMessage: 'Overdue',
    description: 'Status badge label for an overdue record.',
  },
  statusScheduled: {
    id: 'fbrAdmin.reports.status.scheduled',
    defaultMessage: 'Scheduled',
    description: 'Status badge label for a scheduled session.',
  },
  emptyState: {
    id: 'fbrAdmin.reports.table.empty',
    defaultMessage: 'No records match the selected filters.',
    description: 'Empty state shown when a report table has no matching rows.',
  },
  exportToast: {
    id: 'fbrAdmin.reports.export.toast',
    defaultMessage: 'Preparing PDF export...',
    description: 'Toast notification shown when the Export PDF button is clicked.',
  },
});

export default messages;
