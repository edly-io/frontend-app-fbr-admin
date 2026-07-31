/**
 * Program Report table column config and the shared tone lookups used by
 * the status badges. Keeping this presentation-layer metadata separate from
 * `data/mockData.js` means the data module stays a pure rows data source
 * that a future API-backed version can drop in without any of this file
 * changing.
 */

export const PROGRAM_COLUMNS = [
  { key: 'program', kind: 'text', strong: true },
  { key: 'city', kind: 'text' },
  { key: 'instructors', kind: 'peopleCount' },
  { key: 'certificates', kind: 'peopleCount' },
  { key: 'enrolled', kind: 'num' },
  { key: 'completed', kind: 'num' },
  { key: 'avgScore', kind: 'num' },
  { key: 'avgAttendance', kind: 'num' },
  { key: 'status', kind: 'status' },
];

export const COLUMN_LABEL_MESSAGE_KEYS = {
  program: 'colProgram',
  city: 'colCity',
  instructors: 'colInstructors',
  enrolled: 'colEnrolled',
  completed: 'colCompleted',
  avgScore: 'colAvgScore',
  avgAttendance: 'colAvgAttendance',
  certificates: 'colCertificate',
  status: 'colStatus',
};

/**
 * Optional info-tooltip copy for a column header, keyed by column key. Only
 * columns needing extra context (e.g. "Completed" - finalized in the Add
 * Trainees Results tab) have an entry here; every other header just renders
 * its plain label.
 */
export const COLUMN_TOOLTIP_MESSAGE_KEYS = {
  completed: 'colCompletedTooltip',
  avgScore: 'colAvgScoreTooltip',
  avgAttendance: 'colAvgAttendanceTooltip',
};

export const STAT_LABEL_MESSAGE_KEYS = {
  programCount: 'statProgramCount',
  certificatesAwarded: 'statCertificatesAwarded',
  avgAttendance: 'statAvgAttendance',
};

/**
 * Config for every "count of people" column (Instructors, Certificate).
 * Each entry drives the clickable count cell's aria label and the right-side
 * Sheet it opens: which message keys to use for the eyebrow/empty/close text
 * and what badge label to render on each person's `UserIdentity`. Adding a
 * future people-count column only means adding an entry here.
 */
export const PEOPLE_SHEET_CONFIG = {
  instructors: {
    ariaKey: 'instructorCountAria',
    eyebrowKey: 'instructorSheetEyebrow',
    emptyKey: 'instructorsEmptyState',
    closeKey: 'closeInstructorSheet',
    badgeLabel: 'Instructor',
  },
  certificates: {
    ariaKey: 'certificateCountAria',
    eyebrowKey: 'certificateSheetEyebrow',
    emptyKey: 'certificatesEmptyState',
    closeKey: 'closeCertificateSheet',
    badgeLabel: 'Trainee',
  },
};

export const STATUS_VARIANT = {
  Active: 'success',
  Draft: 'warning',
  Archived: 'dark',
  Freezed: 'light',
};

export const STATUS_LABEL_MESSAGE_KEYS = {
  Active: 'statusActive',
  Draft: 'statusDraft',
  Archived: 'statusArchived',
  Freezed: 'statusFreezed',
};

export const getStatusVariant = (status) => STATUS_VARIANT[status] || 'secondary';

export const ROWS_PER_PAGE = 8;
