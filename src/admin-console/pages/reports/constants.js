/**
 * Report-type tab definitions, per-report table column config and the
 * shared tone lookups used by the stat cards, status badges and
 * progress-bar cells (tone names map to CSS classes in `reports-styles.scss`).
 * Keeping this presentation-layer metadata separate from `data/mockData.js`
 * means the data module stays a pure "rows + stats" data source that a
 * future API-backed version can drop in without any of this file changing.
 */

export const REPORT_TABS = [
  { id: 'sessionsPerInstructor', labelKey: 'tabSessionsPerInstructor' },
  { id: 'program', labelKey: 'tabProgram' },
  { id: 'session', labelKey: 'tabSession' },
  { id: 'attendance', labelKey: 'tabAttendance' },
  { id: 'feedback', labelKey: 'tabFeedback' },
  { id: 'enrolled', labelKey: 'tabEnrolled' },
  { id: 'progress', labelKey: 'tabProgress' },
];

export const DEFAULT_REPORT_ID = REPORT_TABS[0].id;

export const REPORT_COLUMNS = {
  sessionsPerInstructor: [
    {
      key: 'instructor', kind: 'person', strong: true, badge: 'Instructor',
    },
    { key: 'primaryProgram', kind: 'text' },
    { key: 'sessions', kind: 'num' },
    { key: 'hours', kind: 'num' },
    { key: 'avgAttendance', kind: 'bar' },
    { key: 'avgFeedback', kind: 'num' },
  ],
  program: [
    { key: 'program', kind: 'text', strong: true },
    { key: 'category', kind: 'text' },
    { key: 'instructor', kind: 'person', badge: 'Instructor' },
    { key: 'enrolled', kind: 'num' },
    { key: 'completed', kind: 'num' },
    { key: 'completion', kind: 'bar' },
    { key: 'avgScore', kind: 'num' },
  ],
  session: [
    { key: 'date', kind: 'text' },
    { key: 'program', kind: 'text', strong: true },
    { key: 'session', kind: 'text' },
    { key: 'instructor', kind: 'person', badge: 'Instructor' },
    { key: 'region', kind: 'text' },
    { key: 'attendance', kind: 'bar' },
    { key: 'status', kind: 'badge' },
  ],
  attendance: [
    {
      key: 'learner', kind: 'person', strong: true, badge: 'Trainee',
    },
    { key: 'program', kind: 'text' },
    { key: 'region', kind: 'text' },
    { key: 'attended', kind: 'text' },
    { key: 'attendanceRate', kind: 'bar' },
    { key: 'status', kind: 'badge' },
  ],
  feedback: [
    { key: 'program', kind: 'text', strong: true },
    { key: 'session', kind: 'text' },
    { key: 'instructor', kind: 'person', badge: 'Instructor' },
    { key: 'responses', kind: 'num' },
    { key: 'content', kind: 'num' },
    { key: 'instructorRating', kind: 'num' },
    { key: 'relevance', kind: 'num' },
    { key: 'nps', kind: 'nps' },
  ],
  enrolled: [
    {
      key: 'learner', kind: 'person', strong: true, badge: 'Trainee',
    },
    { key: 'department', kind: 'text' },
    { key: 'region', kind: 'text' },
    { key: 'program', kind: 'text' },
    { key: 'cohort', kind: 'text' },
    { key: 'enrolledDate', kind: 'text' },
    { key: 'status', kind: 'badge' },
  ],
  progress: [
    {
      key: 'learner', kind: 'person', strong: true, badge: 'Trainee',
    },
    { key: 'program', kind: 'text' },
    { key: 'region', kind: 'text' },
    { key: 'modules', kind: 'text' },
    { key: 'progress', kind: 'bar' },
    { key: 'lastActivity', kind: 'text' },
    { key: 'status', kind: 'badge' },
  ],
};

export const COLUMN_LABEL_MESSAGE_KEYS = {
  instructor: 'colInstructor',
  primaryProgram: 'colPrimaryProgram',
  sessions: 'colSessions',
  hours: 'colHours',
  avgAttendance: 'colAvgAttendance',
  avgFeedback: 'colAvgFeedback',
  program: 'colProgram',
  category: 'colCategory',
  enrolled: 'colEnrolled',
  completed: 'colCompleted',
  completion: 'colCompletion',
  avgScore: 'colAvgScore',
  date: 'colDate',
  session: 'colSession',
  region: 'colRegion',
  attendance: 'colAttendance',
  status: 'colStatus',
  learner: 'colLearner',
  attended: 'colAttended',
  attendanceRate: 'colAttendanceRate',
  responses: 'colResponses',
  content: 'colContent',
  instructorRating: 'colInstructorRating',
  relevance: 'colRelevance',
  nps: 'colNps',
  department: 'colDepartment',
  cohort: 'colCohort',
  enrolledDate: 'colEnrolledDate',
  modules: 'colModules',
  progress: 'colProgress',
  lastActivity: 'colLastActivity',
};

export const STAT_LABEL_MESSAGE_KEYS = {
  totalSessions: 'statTotalSessions',
  totalHours: 'statTotalHours',
  avgFeedback: 'statAvgFeedback',
  programCount: 'statProgramCount',
  avgCompletion: 'statAvgCompletion',
  avgScore: 'statAvgScore',
  sessionCount: 'statSessionCount',
  completedCount: 'statCompletedCount',
  avgAttendance: 'statAvgAttendance',
  learnerCount: 'statLearnerCount',
  belowSixty: 'statBelowSixty',
  responseCount: 'statResponseCount',
  avgRating: 'statAvgRating',
  avgNps: 'statAvgNps',
  enrolledCount: 'statEnrolledCount',
  activeCount: 'statActiveCount',
  notStartedCount: 'statNotStartedCount',
  avgProgress: 'statAvgProgress',
};

export const STATUS_TONE = {
  Completed: 'good',
  'In progress': 'info',
  'Not started': 'neutral',
  Overdue: 'bad',
  Scheduled: 'info',
};

export const STATUS_LABEL_MESSAGE_KEYS = {
  Completed: 'statusCompleted',
  'In progress': 'statusInProgress',
  'Not started': 'statusNotStarted',
  Overdue: 'statusOverdue',
  Scheduled: 'statusScheduled',
};

export const getStatusTone = (status) => STATUS_TONE[status] || 'neutral';

export const getBarTone = (value) => {
  if (value >= 75) { return 'good'; }
  if (value >= 50) { return 'warn'; }
  return 'bad';
};

export const getNpsTone = (value) => {
  if (value >= 50) { return 'good'; }
  if (value >= 0) { return 'warn'; }
  return 'bad';
};

export const ROWS_PER_PAGE = 8;
