// ─── Users feature constants ───────────────────────────────────────────────
//
// NOTE on i18n scope: `ROLE_LABELS` / `STATUS_LABELS` intentionally remain
// plain English string constants (not routed through `intl.formatMessage`).
// Their output feeds both on-screen text AND equality comparisons elsewhere
// (e.g. the badge text handed to the shared `UserIdentity` component from
// `@edly-io/frontend-component-fbr`, which hardcodes English badge strings —
// "Super Admin", "Instructor", etc. — to pick a badge color/tone).
// Translating these values would silently change which tone a badge renders
// with in non-English locales. Only chrome that does *not* participate in such
// comparisons (tab labels, headers, buttons, empty states, etc.) is
// localized via `messages.js`.

export const TABS = [
  { id: 'all', label: 'All', role: null },
  {
    id: 'super-admins', label: 'Super Admins', role: 'super_admin', superAdminOnly: true,
  },
  {
    id: 'middle-admins', label: 'Middle Admins', role: 'middle_admin', superAdminOnly: true,
  },
  { id: 'data-admins', label: 'Data Admins', role: 'data_admin' },
  { id: 'instructors', label: 'Instructors', role: 'instructor' },
  { id: 'trainees', label: 'Trainees', role: 'trainee' },
];

export const ROLE_LABELS = {
  super_admin: 'Super Admin',
  middle_admin: 'Middle Admin',
  data_admin: 'Data Admin',
  instructor: 'Instructor',
  trainee: 'Trainee',
};

export const STATUS_LABELS = {
  invited: 'Invited',
  active: 'Active',
  on_leave: 'On Leave',
  programme_closed: 'Programme Closed',
  deactivated: 'Deactivated',
  lapsed: 'Lapsed',
};

// The dropdown carries the backend's own status values; `?status=` goes
// straight to the list endpoint, which filters the queryset. `all` is the
// dropdown's "unset" sentinel and is simply not sent.
export const STATUS_FILTER_ALL = 'all';

export const STATUS_FILTER_OPTIONS = [
  { value: STATUS_FILTER_ALL, label: 'All' },
  ...Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label })),
];

export const DEFAULT_USERS_ROWS_PER_PAGE = 10;
