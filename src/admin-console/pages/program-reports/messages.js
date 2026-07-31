import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  breadcrumbLeaf: {
    id: 'fbrAdmin.reports.breadcrumb',
    defaultMessage: 'Reports',
    description: 'Breadcrumb leaf label for the Program Report page.',
  },
  pageTitle: {
    id: 'fbrAdmin.reports.title',
    defaultMessage: 'Program Report',
    description: 'Page title for the Program Report page.',
  },
  pageSubtitle: {
    id: 'fbrAdmin.reports.subtitle',
    defaultMessage: 'Generate and export a detailed performance report across programs.',
    description: 'Subtitle shown below the Program Report page title.',
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
  filterCity: {
    id: 'fbrAdmin.reports.filter.city',
    defaultMessage: 'City',
    description: 'Label for the City filter dropdown.',
  },
  filterAllCities: {
    id: 'fbrAdmin.reports.filter.allCities',
    defaultMessage: 'All Cities',
    description: 'Option to clear the City filter.',
  },
  colProgram: {
    id: 'fbrAdmin.reports.col.program',
    defaultMessage: 'Program',
    description: 'Report table column header for program name.',
  },
  colCity: {
    id: 'fbrAdmin.reports.col.city',
    defaultMessage: 'City',
    description: 'Report table column header for the program city.',
  },
  colInstructors: {
    id: 'fbrAdmin.reports.col.instructors',
    defaultMessage: 'Instructors',
    description: 'Report table column header for the instructor count.',
  },
  colEnrolled: {
    id: 'fbrAdmin.reports.col.enrolled',
    defaultMessage: 'Enrolled',
    description: 'Report table column header for enrolled learner count.',
  },
  colCompleted: {
    id: 'fbrAdmin.reports.col.completed',
    defaultMessage: 'Finalized',
    description: 'Report table column header for finalized learner count.',
  },
  colCompletedTooltip: {
    id: 'fbrAdmin.reports.col.completed.tooltip',
    defaultMessage: 'How many enrolled trainees have had their manual program grading finalized (final result locked by an admin). Trainees still being graded are not counted yet.',
    description: 'Tooltip explaining what the Finalized column count represents.',
  },
  colCompletedTooltipAlt: {
    id: 'fbrAdmin.reports.col.completed.tooltipAlt',
    defaultMessage: 'More information about the Finalized column',
    description: 'Accessible label for the info icon next to the Finalized column header.',
  },
  colAvgScore: {
    id: 'fbrAdmin.reports.col.avgScore',
    defaultMessage: 'Avg. Score',
    description: 'Report table column header for average assessment score.',
  },
  colAvgScoreTooltip: {
    id: 'fbrAdmin.reports.col.avgScore.tooltip',
    defaultMessage: "The average final score of trainees whose manual grading is finalized, shown as a percentage of the program's total possible marks. Trainees not yet finalized are excluded.",
    description: 'Tooltip explaining what the Avg. Score column represents.',
  },
  colAvgScoreTooltipAlt: {
    id: 'fbrAdmin.reports.col.avgScore.tooltipAlt',
    defaultMessage: 'More information about the Avg. Score column',
    description: 'Accessible label for the info icon next to the Avg. Score column header.',
  },
  colAvgAttendance: {
    id: 'fbrAdmin.reports.col.avgAttendance',
    defaultMessage: 'Avg. Attendance %',
    description: 'Report table column header for average session attendance percentage.',
  },
  colAvgAttendanceTooltip: {
    id: 'fbrAdmin.reports.col.avgAttendance.tooltip',
    defaultMessage: "The average share of sessions that enrolled trainees actually attended, across all of the program's held sessions.",
    description: 'Tooltip explaining what the Avg. Attendance % column represents.',
  },
  colAvgAttendanceTooltipAlt: {
    id: 'fbrAdmin.reports.col.avgAttendance.tooltipAlt',
    defaultMessage: 'More information about the Avg. Attendance % column',
    description: 'Accessible label for the info icon next to the Avg. Attendance % column header.',
  },
  colCertificate: {
    id: 'fbrAdmin.reports.col.certificate',
    defaultMessage: 'Certificate',
    description: 'Report table column header for the certificate-awarded count.',
  },
  colStatus: {
    id: 'fbrAdmin.reports.col.status',
    defaultMessage: 'Status',
    description: 'Report table column header for the program status.',
  },
  statusActive: {
    id: 'fbrAdmin.reports.status.active',
    defaultMessage: 'Active',
    description: 'Status badge label for a program that is active.',
  },
  statusDraft: {
    id: 'fbrAdmin.reports.status.draft',
    defaultMessage: 'Draft',
    description: 'Status badge label for a program that is a draft.',
  },
  statusArchived: {
    id: 'fbrAdmin.reports.status.archived',
    defaultMessage: 'Archived',
    description: 'Status badge label for a program that has been archived.',
  },
  statusFreezed: {
    id: 'fbrAdmin.reports.status.freezed',
    defaultMessage: 'Freezed',
    description: 'Status badge label for a program that has been freezed.',
  },
  instructorCountAria: {
    id: 'fbrAdmin.reports.instructorCount.aria',
    defaultMessage: 'View {count, plural, one {# instructor} other {# instructors}} for {program}',
    description: 'Accessible label for the clickable instructor count button in the Program Report table.',
  },
  instructorSheetEyebrow: {
    id: 'fbrAdmin.reports.instructorSheet.eyebrow',
    defaultMessage: 'Instructors',
    description: 'Small eyebrow label shown above the program name in the instructors sheet.',
  },
  instructorsEmptyState: {
    id: 'fbrAdmin.reports.instructorSheet.empty',
    defaultMessage: 'No instructors are assigned to this program.',
    description: 'Empty state shown in the instructors sheet when a program has no instructors.',
  },
  closeInstructorSheet: {
    id: 'fbrAdmin.reports.instructorSheet.close',
    defaultMessage: 'Close instructors panel',
    description: 'Accessible label for the button that closes the instructors sheet.',
  },
  certificateCountAria: {
    id: 'fbrAdmin.reports.certificateCount.aria',
    defaultMessage: 'View {count, plural, one {# certificate} other {# certificates}} awarded for {program}',
    description: 'Accessible label for the clickable certificate count button in the Program Report table.',
  },
  certificateSheetEyebrow: {
    id: 'fbrAdmin.reports.certificateSheet.eyebrow',
    defaultMessage: 'Certificates Awarded',
    description: 'Small eyebrow label shown above the program name in the certificate recipients sheet.',
  },
  certificatesEmptyState: {
    id: 'fbrAdmin.reports.certificateSheet.empty',
    defaultMessage: 'No certificates have been awarded for this program yet.',
    description: 'Empty state shown in the certificate recipients sheet when a program has no recipients.',
  },
  closeCertificateSheet: {
    id: 'fbrAdmin.reports.certificateSheet.close',
    defaultMessage: 'Close certificate recipients panel',
    description: 'Accessible label for the button that closes the certificate recipients sheet.',
  },
  statProgramCount: {
    id: 'fbrAdmin.reports.stat.programCount',
    defaultMessage: 'Programs',
    description: 'Stat card label for the number of programs.',
  },
  statCertificatesAwarded: {
    id: 'fbrAdmin.reports.stat.certificatesAwarded',
    defaultMessage: 'Certificates Awarded',
    description: 'Stat card label for the total number of certificates awarded across programs.',
  },
  statAvgAttendance: {
    id: 'fbrAdmin.reports.stat.avgAttendance',
    defaultMessage: 'Avg. Attendance %',
    description: 'Stat card label for the overall average attendance percentage across programs.',
  },
  emptyState: {
    id: 'fbrAdmin.reports.table.empty',
    defaultMessage: 'No records match the selected filters.',
    description: 'Empty state shown when the report table has no matching rows.',
  },
  exportToast: {
    id: 'fbrAdmin.reports.export.toast',
    defaultMessage: 'Preparing PDF export...',
    description: 'Toast notification shown when the Export PDF button is clicked.',
  },
});

export default messages;
