import {
  faUsers, faUserCheck, faPen, faChartLine,
} from '@fortawesome/free-solid-svg-icons';

// ─── Nav config ───────────────────────────────────────────────────────────────
// Labels are resolved from `messages.js` at render time via each item's `id`.

export const NAV_SECTIONS = [
  {
    id: 'administration',
    items: [
      {
        id: 'users', path: 'users', icon: faUsers,
      },
      {
        id: 'signup-approvals', path: 'signup-approvals', icon: faUserCheck,
      },
      {
        id: 'biodata-edit-requests', path: 'biodata-edit-requests', icon: faPen,
      },
    ],
  },
  // {
  //   id: 'analytics',
  //   items: [
  //     {
  //       id: 'overview', path: 'overview', icon: faChartLine,
  //     },
  //   ],
  // },
  {
    id: 'reports',
    items: [
      {
        id: 'program', path: 'program-reports', icon: faChartLine,
      },
    ],
  },
];

export const PLACEHOLDER_NAV_ITEM_IDS = [
  'courses',
  'regional-offices',
  'access-policies',
  'audit-log',
];

export const ROWS_PER_PAGE_OPTIONS = [5, 10, 20, 50];
