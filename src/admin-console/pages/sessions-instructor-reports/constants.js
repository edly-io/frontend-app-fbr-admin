export const SESSIONS_INSTRUCTOR_COLUMNS = [
  { key: 'instructor', kind: 'text', strong: true },
  { key: 'program', kind: 'text' },
  { key: 'sessions', kind: 'sessionCount' },
  { key: 'hours', kind: 'num' },
  { key: 'hoursBreakdown', kind: 'hoursBar' },
];

export const COLUMN_LABEL_MESSAGE_KEYS = {
  instructor: 'colInstructor',
  program: 'colProgram',
  sessions: 'colSessions',
  hours: 'colHours',
  hoursBreakdown: 'colHoursBreakdown',
};

export const COLUMN_TOOLTIP_MESSAGE_KEYS = {
  hoursBreakdown: 'colHoursBreakdownTooltip',
};

export const STAT_LABEL_MESSAGE_KEYS = {
  instructors: 'statInstructors',
  sessions: 'statTotalSessions',
  hours: 'statTotalHours',
};

export const SESSION_TYPE_SEGMENT_CLASSES = {
  session: 'report-hours-bar__segment--session',
  ceremony: 'report-hours-bar__segment--ceremony',
  milestone: 'report-hours-bar__segment--milestone',
  external_event: 'report-hours-bar__segment--external-event',
  seminar: 'report-hours-bar__segment--seminar',
  conference: 'report-hours-bar__segment--conference',
  workshop: 'report-hours-bar__segment--workshop',
};

export const DEFAULT_SEGMENT_CLASS = 'report-hours-bar__segment--other';

export const REPORT_PAGE_SIZE = 20;
