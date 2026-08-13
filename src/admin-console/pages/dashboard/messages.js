import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  breadcrumbLeaf: {
    id: 'fbrAdmin.dashboard.breadcrumb',
    defaultMessage: 'Dashboard',
    description: 'Breadcrumb leaf label for the Dashboard page.',
  },
  pageTitle: {
    id: 'fbrAdmin.dashboard.title',
    defaultMessage: 'Dashboard',
    description: 'Page title for the Dashboard page.',
  },
  pageSubtitle: {
    id: 'fbrAdmin.dashboard.subtitle',
    defaultMessage: 'Sessions, attendance, results, certification and feedback across all programs.',
    description: 'Subtitle shown below the Dashboard page title.',
  },
  asOf: {
    id: 'fbrAdmin.dashboard.asOf',
    defaultMessage: 'As of {timestamp}',
    description: 'Timestamp telling the administrator how current the dashboard figures are.',
  },

  // ─── Shared section states ──────────────────────────────────────────────────
  sectionLoading: {
    id: 'fbrAdmin.dashboard.section.loading',
    defaultMessage: 'Loading {section}',
    description: 'Screen reader text for a dashboard section that is still loading.',
  },
  sectionLoadError: {
    id: 'fbrAdmin.dashboard.section.loadError',
    defaultMessage: 'Could not load {section}. Refresh the page to try again.',
    description: 'Error shown in place of a dashboard section whose request failed.',
  },

  // ─── Needs attention ────────────────────────────────────────────────────────
  attentionTitle: {
    id: 'fbrAdmin.dashboard.attention.title',
    defaultMessage: 'Needs attention',
    description: 'Heading of the list of outstanding administrator tasks.',
  },
  attentionCount: {
    id: 'fbrAdmin.dashboard.attention.count',
    defaultMessage: '{count, plural, one {# item} other {# items}}',
    description: 'Badge counting the outstanding tasks in the needs-attention list.',
  },
  attentionSubtitle: {
    id: 'fbrAdmin.dashboard.attention.subtitle',
    defaultMessage: 'Waiting on an administrator',
    description: 'Caption clarifying who the needs-attention tasks are assigned to.',
  },
  attentionAction: {
    id: 'fbrAdmin.dashboard.attention.action',
    defaultMessage: '{action}: {task}',
    description: 'Accessible name for a needs-attention action button, e.g. "Review: 4 login approvals pending".',
  },
  loginApprovalsTitle: {
    id: 'fbrAdmin.dashboard.attention.loginApprovals.title',
    defaultMessage: 'Login approvals pending',
    description: 'Needs-attention task: sign-up requests awaiting approval.',
  },
  loginApprovalsDescription: {
    id: 'fbrAdmin.dashboard.attention.loginApprovals.description',
    defaultMessage: 'New sign-up requests waiting for a role assignment',
    description: 'Supporting text for the pending login approvals task.',
  },
  loginApprovalsAction: {
    id: 'fbrAdmin.dashboard.attention.loginApprovals.action',
    defaultMessage: 'Review',
    description: 'Action label taking the administrator to the signup approvals page.',
  },
  noResultsTitle: {
    id: 'fbrAdmin.dashboard.attention.noResults.title',
    defaultMessage: '{count, plural, one {Program with no results entered} other {Programs with no results entered}}',
    description: 'Needs-attention task: programs that have no results captured yet.',
  },
  noResultsAction: {
    id: 'fbrAdmin.dashboard.attention.noResults.action',
    defaultMessage: 'Enter results',
    description: 'Action label taking the administrator to results entry.',
  },
  lowAttendanceTitle: {
    id: 'fbrAdmin.dashboard.attention.lowAttendance.title',
    defaultMessage: 'Trainees below {threshold}% attendance',
    description: 'Needs-attention task: trainees under the attendance threshold.',
  },
  lowAttendanceDescription: {
    id: 'fbrAdmin.dashboard.attention.lowAttendance.description',
    defaultMessage: 'At risk of failing the discipline & conduct criterion',
    description: 'Supporting text for the low attendance task.',
  },
  lowAttendanceAction: {
    id: 'fbrAdmin.dashboard.attention.lowAttendance.action',
    defaultMessage: 'View',
    description: 'Action label taking the administrator to the attendance report.',
  },
  draftResultsTitle: {
    id: 'fbrAdmin.dashboard.attention.draftResults.title',
    defaultMessage: '{count, plural, one {Program with results in draft} other {Programs with results in draft}}',
    description: 'Needs-attention task: programs whose results are entered but not finalized.',
  },
  draftResultsDescription: {
    id: 'fbrAdmin.dashboard.attention.draftResults.description',
    defaultMessage: 'Scores entered but not finalized',
    description: 'Supporting text for the draft results task.',
  },
  draftResultsAction: {
    id: 'fbrAdmin.dashboard.attention.draftResults.action',
    defaultMessage: 'Finalize',
    description: 'Action label taking the administrator to finalize draft results.',
  },
  certificatesPendingTitle: {
    id: 'fbrAdmin.dashboard.attention.certificatesPending.title',
    defaultMessage: 'Certificates pending award',
    description: 'Needs-attention task: completed trainees without a certificate.',
  },
  certificatesPendingDescription: {
    id: 'fbrAdmin.dashboard.attention.certificatesPending.description',
    defaultMessage: 'Trainees who completed but have no certificate',
    description: 'Supporting text for the pending certificates task.',
  },
  certificatesPendingAction: {
    id: 'fbrAdmin.dashboard.attention.certificatesPending.action',
    defaultMessage: 'Award',
    description: 'Action label taking the administrator to certificate awarding.',
  },

  // ─── Program performance ────────────────────────────────────────────────────
  performanceTitle: {
    id: 'fbrAdmin.dashboard.performance.title',
    defaultMessage: 'Program performance',
    description: 'Heading of the KPI card row.',
  },
  performanceSubtitle: {
    id: 'fbrAdmin.dashboard.performance.subtitle',
    defaultMessage: 'Across your active programs',
    description: 'Caption explaining the scope of the KPI cards.',
  },
  performanceEmpty: {
    id: 'fbrAdmin.dashboard.performance.empty',
    defaultMessage: 'No active programs yet. Figures appear here once a program is activated.',
    description: 'Empty state shown when the administrator has no active programs to report on.',
  },
  activeProgramsLabel: {
    id: 'fbrAdmin.dashboard.kpi.activePrograms',
    defaultMessage: 'Active programs',
    description: 'KPI label for the number of running programs.',
  },
  enrolledTraineesLabel: {
    id: 'fbrAdmin.dashboard.kpi.enrolledTrainees',
    defaultMessage: 'Enrolled trainees',
    description: 'KPI label for the number of enrolled trainees.',
  },
  overallCompletionLabel: {
    id: 'fbrAdmin.dashboard.kpi.overallCompletion',
    defaultMessage: 'Overall completion',
    description: 'KPI label for the share of trainees who completed their program.',
  },
  averageScoreLabel: {
    id: 'fbrAdmin.dashboard.kpi.averageScore',
    defaultMessage: 'Average score',
    description: 'KPI label for the enrolment-weighted average assessment score.',
  },
  certificatesIssuedLabel: {
    id: 'fbrAdmin.dashboard.kpi.certificatesIssued',
    defaultMessage: 'Certificates issued',
    description: 'KPI label for the number of certificates awarded.',
  },
  facultyRatingLabel: {
    id: 'fbrAdmin.dashboard.kpi.facultyRating',
    defaultMessage: 'Faculty rating',
    description: 'KPI label for the average instructor feedback rating.',
  },
  captionActivePrograms: {
    id: 'fbrAdmin.dashboard.kpi.caption.activePrograms',
    defaultMessage: 'Currently running',
    description: 'KPI caption explaining that only active programs are counted.',
  },
  captionEnrolledTrainees: {
    id: 'fbrAdmin.dashboard.kpi.caption.enrolledTrainees',
    defaultMessage: 'Seats filled across active programs',
    description: 'KPI caption explaining that enrolments are counted per seat, not per person.',
  },
  captionOverallCompletion: {
    id: 'fbrAdmin.dashboard.kpi.caption.overallCompletion',
    defaultMessage: 'Enrolled trainees with finalized results',
    description: 'KPI caption explaining how overall completion is measured.',
  },
  captionOverallCompletionEmpty: {
    id: 'fbrAdmin.dashboard.kpi.caption.overallCompletionEmpty',
    defaultMessage: 'No trainees enrolled yet',
    description: 'KPI caption shown when there is nobody to measure completion against.',
  },
  captionAverageScore: {
    id: 'fbrAdmin.dashboard.kpi.caption.averageScore',
    defaultMessage: 'Average of finalized trainees',
    description: 'KPI caption explaining that only marked trainees count towards the average score.',
  },
  captionAverageScoreEmpty: {
    id: 'fbrAdmin.dashboard.kpi.caption.averageScoreEmpty',
    defaultMessage: 'No results finalized yet',
    description: 'KPI caption shown when no trainee has been marked yet.',
  },
  captionCertificatesIssued: {
    id: 'fbrAdmin.dashboard.kpi.caption.certificatesIssued',
    defaultMessage: 'Awarded, excluding revoked',
    description: 'KPI caption explaining which certificates are counted.',
  },
  captionFacultyRating: {
    id: 'fbrAdmin.dashboard.kpi.caption.facultyRating',
    defaultMessage: 'Average instructor feedback',
    description: 'KPI caption explaining that the rating comes from feedback about instructors.',
  },
  captionFacultyRatingEmpty: {
    id: 'fbrAdmin.dashboard.kpi.caption.facultyRatingEmpty',
    defaultMessage: 'No instructor rated yet',
    description: 'KPI caption shown when no feedback about an instructor has been received.',
  },

  // ─── Users ──────────────────────────────────────────────────────────────────
  usersTitle: {
    id: 'fbrAdmin.dashboard.users.title',
    defaultMessage: 'Users',
    description: 'Heading of the user accounts section.',
  },
  usersSubtitle: {
    id: 'fbrAdmin.dashboard.users.subtitle',
    defaultMessage: 'Accounts by role',
    description: 'Caption of the user accounts section.',
  },
  usersManageLink: {
    id: 'fbrAdmin.dashboard.users.manageLink',
    defaultMessage: 'Manage users',
    description: 'Link from the users section to the user management page.',
  },
  usersTotalLabel: {
    id: 'fbrAdmin.dashboard.users.totalLabel',
    defaultMessage: 'Total users across {roles} roles',
    description: 'Caption under the total number of user accounts.',
  },
  usersPendingApproval: {
    id: 'fbrAdmin.dashboard.users.pendingApproval',
    defaultMessage: 'Pending approval',
    description: 'Label for the count of accounts awaiting approval.',
  },
  usersCompositionLabel: {
    id: 'fbrAdmin.dashboard.users.compositionLabel',
    defaultMessage: 'User accounts by role: {breakdown}.',
    description: 'Accessible description of the role composition bar.',
  },
  usersCompositionItem: {
    id: 'fbrAdmin.dashboard.users.compositionItem',
    defaultMessage: '{role} {count}',
    description: 'One role entry inside the composition bar description.',
  },
  usersLegendLinkLabel: {
    id: 'fbrAdmin.dashboard.users.legendLinkLabel',
    defaultMessage: '{role}: {count, plural, one {# account} other {# accounts}}. View users.',
    description: 'Accessible name for a role tile, which links through to the user management page.',
  },
  usersEmpty: {
    id: 'fbrAdmin.dashboard.users.empty',
    defaultMessage: 'No user accounts to show yet.',
    description: 'Empty state shown when there are no accounts in the administrator scope.',
  },
  roleSuperAdmin: {
    id: 'fbrAdmin.dashboard.users.role.superAdmin',
    defaultMessage: 'Super Admin',
    description: 'Role name for super administrators.',
  },
  roleMiddleAdmin: {
    id: 'fbrAdmin.dashboard.users.role.middleAdmin',
    defaultMessage: 'Middle Admin',
    description: 'Role name for middle administrators.',
  },
  roleDataAdmin: {
    id: 'fbrAdmin.dashboard.users.role.dataAdmin',
    defaultMessage: 'Data Admin',
    description: 'Role name for data administrators.',
  },
  roleInstructor: {
    id: 'fbrAdmin.dashboard.users.role.instructor',
    defaultMessage: 'Instructor',
    description: 'Role name for instructors.',
  },
  roleTrainee: {
    id: 'fbrAdmin.dashboard.users.role.trainee',
    defaultMessage: 'Trainee',
    description: 'Role name for trainees.',
  },

  // ─── Sessions & training hours ──────────────────────────────────────────────
  sessionsTitle: {
    id: 'fbrAdmin.dashboard.sessions.title',
    defaultMessage: 'Sessions & training hours',
    description: 'Heading of the sessions and training hours card.',
  },
  sessionsSubtitle: {
    id: 'fbrAdmin.dashboard.sessions.subtitle',
    defaultMessage: 'Delivery across active programs',
    description: 'Caption of the sessions and training hours card.',
  },
  hoursUnit: {
    id: 'fbrAdmin.dashboard.sessions.hoursUnit',
    defaultMessage: 'hrs',
    description: 'Abbreviation for hours, shown after a total.',
  },
  sessionsCaption: {
    id: 'fbrAdmin.dashboard.sessions.caption',
    defaultMessage: '{count, plural, one {# session delivered} other {# sessions delivered}}',
    description: 'Caption under the total training hours, counting the sessions behind it.',
  },
  sessionsEmpty: {
    id: 'fbrAdmin.dashboard.sessions.empty',
    defaultMessage: 'No sessions scheduled or delivered yet.',
    description: 'Empty state shown when no session exists in the administrator scope.',
  },
  sessionsProgramsEmpty: {
    id: 'fbrAdmin.dashboard.sessions.programsEmpty',
    defaultMessage: 'No sessions delivered yet.',
    description: 'Empty state for the per-program training hours list.',
  },
  sessionsWeekTooltip: {
    id: 'fbrAdmin.dashboard.sessions.weekTooltip',
    defaultMessage: 'Week of {date}: {hours} hrs',
    description: 'Tooltip on a bar of the weekly training hours chart, naming the week and its exact hours.',
  },
  sessionsTrendCaption: {
    id: 'fbrAdmin.dashboard.sessions.trendCaption',
    defaultMessage: 'Hours per week · last {weeks} weeks',
    description: 'Caption under the weekly training hours chart.',
  },
  sessionsTrendChartLabel: {
    id: 'fbrAdmin.dashboard.sessions.trendChartLabel',
    defaultMessage: 'Training hours per week over the last {weeks} weeks: {values}.',
    description: 'Accessible description of the weekly training hours chart.',
  },
  sessionsHoursByProgram: {
    id: 'fbrAdmin.dashboard.sessions.hoursByProgram',
    defaultMessage: 'Hours by program',
    description: 'Sub-heading of the per-program training hours list.',
  },
  sessionsAtAGlance: {
    id: 'fbrAdmin.dashboard.sessions.atAGlance',
    defaultMessage: 'At a glance',
    description: 'Sub-heading of the summary session statistics.',
  },
  sessionsProgramHours: {
    id: 'fbrAdmin.dashboard.sessions.programHours',
    defaultMessage: '{hours}h',
    description: 'Training hours delivered for one program.',
  },
  sessionsProgramSessions: {
    id: 'fbrAdmin.dashboard.sessions.programSessions',
    defaultMessage: '· {count}',
    description: 'Session count shown beside a program\'s training hours.',
  },
  sessionsUnit: {
    id: 'fbrAdmin.dashboard.sessions.unit',
    defaultMessage: 'sessions',
    description: 'Unit read out after the session count beside a program\'s training hours.',
  },
  statAverageSessionLength: {
    id: 'fbrAdmin.dashboard.sessions.stat.averageLength',
    defaultMessage: 'Average session length',
    description: 'Label for the average length of a training session.',
  },
  statSessionsThisWeek: {
    id: 'fbrAdmin.dashboard.sessions.stat.thisWeek',
    defaultMessage: 'Sessions this week',
    description: 'Label for the number of sessions delivered this week.',
  },
  statUpcomingScheduled: {
    id: 'fbrAdmin.dashboard.sessions.stat.upcoming',
    defaultMessage: 'Upcoming scheduled',
    description: 'Label for the number of sessions scheduled ahead.',
  },
  statInstructorsDelivering: {
    id: 'fbrAdmin.dashboard.sessions.stat.instructors',
    defaultMessage: 'Instructors delivering',
    description: 'Label for the number of instructors currently teaching.',
  },

  // ─── Attendance ─────────────────────────────────────────────────────────────
  attendanceTitle: {
    id: 'fbrAdmin.dashboard.attendance.title',
    defaultMessage: 'Attendance',
    description: 'Heading of the attendance card.',
  },
  attendanceSubtitle: {
    id: 'fbrAdmin.dashboard.attendance.subtitle',
    defaultMessage: 'Session attendance across programs',
    description: 'Caption of the attendance card.',
  },
  attendanceCaption: {
    id: 'fbrAdmin.dashboard.attendance.caption',
    defaultMessage: 'Overall attendance · {change} vs last period',
    description: 'Caption under the overall attendance percentage, including the change since last period.',
  },
  attendanceChange: {
    id: 'fbrAdmin.dashboard.attendance.change',
    defaultMessage: '{delta} pts',
    description: 'Change in attendance against the previous period, in percentage points.',
  },
  statePresent: {
    id: 'fbrAdmin.dashboard.attendance.state.present',
    defaultMessage: 'Present',
    description: 'Attendance state: trainee attended the session.',
  },
  stateAbsent: {
    id: 'fbrAdmin.dashboard.attendance.state.absent',
    defaultMessage: 'Absent',
    description: 'Attendance state: trainee did not attend the session.',
  },
  stateOnLeave: {
    id: 'fbrAdmin.dashboard.attendance.state.onLeave',
    defaultMessage: 'On leave',
    description: 'Attendance state: trainee was on approved leave.',
  },
  attendanceBreakdownLabel: {
    id: 'fbrAdmin.dashboard.attendance.breakdownLabel',
    defaultMessage: 'Attendance breakdown: {breakdown}.',
    description: 'Accessible description of the stacked attendance bar.',
  },
  attendanceBreakdownItem: {
    id: 'fbrAdmin.dashboard.attendance.breakdownItem',
    defaultMessage: '{state} {percentage}%',
    description: 'One state inside the attendance breakdown description.',
  },
  attendanceBelowThresholdNote: {
    id: 'fbrAdmin.dashboard.attendance.belowThresholdNote',
    defaultMessage: 'below the {threshold}% threshold',
    description: 'Text alternative marking a program that is under the attendance threshold.',
  },
  attendanceBelowThresholdStat: {
    id: 'fbrAdmin.dashboard.attendance.belowThresholdStat',
    defaultMessage: 'Below {threshold}% threshold',
    description: 'Label for the number of trainees under the attendance threshold.',
  },
  attendanceMarkedToday: {
    id: 'fbrAdmin.dashboard.attendance.markedToday',
    defaultMessage: 'Today\'s sessions marked',
    description: 'Label for the share of today\'s sessions with attendance recorded.',
  },
  attendanceMarkedTodayValue: {
    id: 'fbrAdmin.dashboard.attendance.markedTodayValue',
    defaultMessage: '{marked} / {total}',
    description: 'Sessions marked out of the sessions scheduled today.',
  },
  attendanceTraineesTracked: {
    id: 'fbrAdmin.dashboard.attendance.traineesTracked',
    defaultMessage: 'Trainees tracked',
    description: 'Label for the number of trainees whose attendance is recorded.',
  },
  attendanceProgramValue: {
    id: 'fbrAdmin.dashboard.attendance.programValue',
    defaultMessage: '{percentage}%',
    description: 'Attendance percentage for one program.',
  },

  // ─── Feedback ───────────────────────────────────────────────────────────────
  feedbackTitle: {
    id: 'fbrAdmin.dashboard.feedback.title',
    defaultMessage: 'Feedback',
    description: 'Heading of the feedback card.',
  },
  feedbackSubtitle: {
    id: 'fbrAdmin.dashboard.feedback.subtitle',
    defaultMessage: 'Trainee ratings across programs',
    description: 'Caption of the feedback card.',
  },
  feedbackRatingOutOf: {
    id: 'fbrAdmin.dashboard.feedback.ratingOutOf',
    defaultMessage: '/{maximum}',
    description: 'Suffix showing the top of the rating scale, e.g. "/5".',
  },
  feedbackStarsLabel: {
    id: 'fbrAdmin.dashboard.feedback.starsLabel',
    defaultMessage: 'Rated {rating} out of {maximum}',
    description: 'Accessible name of the star rating.',
  },
  feedbackResponded: {
    id: 'fbrAdmin.dashboard.feedback.responded',
    defaultMessage: '{responded} of {invited} responded',
    description: 'Caption showing how many invited trainees submitted feedback.',
  },
  feedbackHighestRated: {
    id: 'fbrAdmin.dashboard.feedback.highestRated',
    defaultMessage: 'Highest rated · {program}',
    description: 'Caption identifying the best rated instructor and their program.',
  },
  feedbackLowestRated: {
    id: 'fbrAdmin.dashboard.feedback.lowestRated',
    defaultMessage: 'Lowest rated · {program}',
    description: 'Caption identifying the lowest rated instructor and their program.',
  },
  feedbackQuoteAttribution: {
    id: 'fbrAdmin.dashboard.feedback.quoteAttribution',
    defaultMessage: '{respondent} · {program}',
    description: 'Attribution line under a quoted piece of trainee feedback.',
  },
  ratingExcellent: {
    id: 'fbrAdmin.dashboard.feedback.rating.excellent',
    defaultMessage: 'Excellent',
    description: 'Feedback rating band: excellent.',
  },
  ratingVeryGood: {
    id: 'fbrAdmin.dashboard.feedback.rating.veryGood',
    defaultMessage: 'Very Good',
    description: 'Feedback rating band: very good.',
  },
  ratingGood: {
    id: 'fbrAdmin.dashboard.feedback.rating.good',
    defaultMessage: 'Good',
    description: 'Feedback rating band: good.',
  },
  ratingFair: {
    id: 'fbrAdmin.dashboard.feedback.rating.fair',
    defaultMessage: 'Fair',
    description: 'Feedback rating band: fair.',
  },
  ratingPoor: {
    id: 'fbrAdmin.dashboard.feedback.rating.poor',
    defaultMessage: 'Poor',
    description: 'Feedback rating band: poor.',
  },
  percentageValue: {
    id: 'fbrAdmin.dashboard.percentageValue',
    defaultMessage: '{percentage}%',
    description: 'A standalone percentage value.',
  },
});

export default messages;
