export const PROGRAM_COLUMNS = [
  { key: 'program', kind: 'programExpand', strong: true },
  { key: 'description', kind: 'description' },
  { key: 'city', kind: 'text' },
  { key: 'startDate', kind: 'date' },
  { key: 'endDate', kind: 'date' },
  { key: 'instructors', kind: 'peopleCount', countKey: 'instructorCount' },
  { key: 'certificates', kind: 'peopleCount', countKey: 'certificateCount' },
  { key: 'enrolled', kind: 'num' },
  { key: 'status', kind: 'status' },
  { key: 'action', kind: 'action' },
];

export const COLUMN_LABEL_MESSAGE_KEYS = {
  program: 'colProgram',
  description: 'colDescription',
  city: 'colCity',
  startDate: 'colStartDate',
  endDate: 'colEndDate',
  instructors: 'colInstructors',
  enrolled: 'colEnrolled',
  certificates: 'colCertificate',
  action: 'colAction',
  status: 'colStatus',
};

// Placeholder for a row whose optional value (description, start/end date)
// the API returned as null/empty.
export const EMPTY_CELL_VALUE = '\u2014';

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

// Rotates a course header's accent color in the Trainee Progress Sheet -
// mirrors `SECTION_VARIANTS` in frontend-app-authoring's grade-scheme-tab.
export const COURSE_VARIANTS = ['primary', 'warning', 'success', 'dark', 'info'];

export const getCourseVariant = (index) => COURSE_VARIANTS[index % COURSE_VARIANTS.length];
