export const ATTENDANCE_COLUMNS = [
  { key: 'learner', kind: 'learner' },
  { key: 'program', kind: 'text' },
  { key: 'attendance', kind: 'attendanceRatio' },
  { key: 'attendancePercentage', kind: 'attendanceRate' },
  { key: 'attendanceBreakdown', kind: 'attendanceBreakdownBar' },
];

export const COLUMN_LABEL_MESSAGE_KEYS = {
  learner: 'colLearner',
  program: 'colProgram',
  attendance: 'colAttendance',
  attendancePercentage: 'colAttendancePercentage',
  attendanceBreakdown: 'colAttendanceBreakdown',
};

export const COLUMN_TOOLTIP_MESSAGE_KEYS = {
  attendanceBreakdown: 'colAttendanceBreakdownTooltip',
};

export const STAT_LABEL_MESSAGE_KEYS = {
  learners: 'statLearners',
  avgAttendance: 'statAvgAttendance',
  sessionsTracked: 'statSessionsTracked',
};

// Mirrors the thresholds `deriveStatus` in `data/api.js` applies over each
// row's `attendance_rate` to sort learners into bands.
export const STATUS_VARIANT = {
  good: 'success',
  at_risk: 'warning',
  critical: 'danger',
};

export const getStatusVariant = (status) => STATUS_VARIANT[status] || 'secondary';

// Per-session attendance badge shown in the Attendance Details Sheet - a
// separate status domain from the row-level Good/At Risk/Critical badge.
export const SESSION_STATUS_VARIANT = {
  present: 'success',
  absent: 'danger',
  leave: 'warning',
  pending: 'secondary',
};

export const SESSION_STATUS_LABEL_MESSAGE_KEYS = {
  present: 'sessionStatusPresent',
  absent: 'sessionStatusAbsent',
  leave: 'sessionStatusLeave',
  pending: 'sessionStatusPending',
};

export const getSessionStatusVariant = (status) => SESSION_STATUS_VARIANT[status] || 'secondary';

// Fixed segment order for the Attendance Breakdown bar/legend - reuses the
// same statuses and colors as the per-session badges above.
export const ATTENDANCE_BREAKDOWN_SEGMENTS = [
  { key: 'present', labelKey: SESSION_STATUS_LABEL_MESSAGE_KEYS.present },
  { key: 'absent', labelKey: SESSION_STATUS_LABEL_MESSAGE_KEYS.absent },
  { key: 'leave', labelKey: SESSION_STATUS_LABEL_MESSAGE_KEYS.leave },
  { key: 'pending', labelKey: SESSION_STATUS_LABEL_MESSAGE_KEYS.pending },
];

export const getAttendanceBreakdownSegmentClass = (key) => `bg-${getSessionStatusVariant(key)}`;

// Sent to the backend as `page_size` and used as the DataTable's page size.
export const REPORT_PAGE_SIZE = 20;
