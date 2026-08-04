export const PROGRAM_COLUMNS = [
  { key: 'program', kind: 'text', strong: true },
  { key: 'city', kind: 'text' },
  { key: 'instructors', kind: 'peopleCount', countKey: 'instructorCount' },
  { key: 'certificates', kind: 'peopleCount', countKey: 'certificateCount' },
  { key: 'enrolled', kind: 'num' },
  { key: 'completed', kind: 'num' },
  { key: 'avgScore', kind: 'num' },
  { key: 'status', kind: 'status' },
  { key: 'action', kind: 'action' },
];

export const COLUMN_LABEL_MESSAGE_KEYS = {
  program: 'colProgram',
  city: 'colCity',
  instructors: 'colInstructors',
  enrolled: 'colEnrolled',
  completed: 'colCompleted',
  avgScore: 'colAvgScore',
  certificates: 'colCertificate',
  action: 'colAction',
  status: 'colStatus',
};

export const COLUMN_TOOLTIP_MESSAGE_KEYS = {
  completed: 'colCompletedTooltip',
  avgScore: 'colAvgScoreTooltip',
};

export const STAT_LABEL_MESSAGE_KEYS = {
  programCount: 'statProgramCount',
  certificatesAwarded: 'statCertificatesAwarded',
};

// Config per people-count column: drives the count cell's aria label, the
// Sheet's copy keys + badge label, and `groupKey` - which key to read off the
// `GET .../program/users/` response (`instructors` or `certified`).
export const PEOPLE_SHEET_CONFIG = {
  instructors: {
    groupKey: 'instructors',
    ariaKey: 'instructorCountAria',
    eyebrowKey: 'instructorSheetEyebrow',
    emptyKey: 'instructorsEmptyState',
    closeKey: 'closeInstructorSheet',
    badgeLabel: 'Instructor',
  },
  certificates: {
    groupKey: 'certified',
    ariaKey: 'certificateCountAria',
    eyebrowKey: 'certificateSheetEyebrow',
    emptyKey: 'certificatesEmptyState',
    closeKey: 'closeCertificateSheet',
    badgeLabel: 'Trainee',
  },
};

// Mirrors STATUS_BADGE_VARIANT in frontend-app-authoring's ProgramCard.tsx,
// keyed by the lowercase status values the backend actually returns.
export const STATUS_VARIANT = {
  draft: 'warning',
  active: 'success',
  archived: 'dark',
  freezed: 'light',
};

export const STATUS_LABEL_MESSAGE_KEYS = {
  draft: 'statusDraft',
  active: 'statusActive',
  archived: 'statusArchived',
  freezed: 'statusFreezed',
};

export const getStatusVariant = (status) => STATUS_VARIANT[status] || 'secondary';

// Sent to the backend as `page_size` and used as the DataTable's page size.
export const REPORT_PAGE_SIZE = 20;
