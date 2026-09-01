import {
  faTachometerAlt, faUsers, faUserCheck, faPen, faChartLine, faChartBar, faChartPie, faIdBadge,
  faBullhorn, faFileAlt,
} from '@fortawesome/free-solid-svg-icons';

// ─── Nav config ───────────────────────────────────────────────────────────────
// Labels are resolved from `messages.js` at render time via each item's `id`.

export const NAV_SECTIONS = [
  {
    id: 'administration',
    items: [
      // `faTachometerAlt` is Font Awesome 5's name for the `fa-dashboard` icon.
      {
        id: 'dashboard', path: 'dashboard', icon: faTachometerAlt,
      },
      {
        id: 'users', path: 'users', icon: faUsers,
      },
      {
        id: 'signup-approvals', path: 'signup-approvals', icon: faUserCheck,
      },
      {
        id: 'biodata-edit-requests', path: 'biodata-edit-requests', icon: faPen,
      },
      {
        id: 'hrms',
        path: 'hrms',
        icon: faIdBadge,
        allowedRoles: ['data_admin', 'middle_admin', 'super_admin'],
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
    id: 'communications',
    items: [
      {
        id: 'announcements', path: 'announcements', icon: faBullhorn,
      },
      {
        id: 'documents', path: 'documents', icon: faFileAlt,
      },
    ],
  },
  {
    id: 'reports',
    items: [
      {
        id: 'program', path: 'program-reports', icon: faChartLine, capabilityKey: 'canAccessPrograms',
      },
      {
        id: 'sessions-instructor', path: 'sessions-reports', icon: faChartBar, capabilityKey: 'canAccessSessions',
      },
      {
        id: 'attendance', path: 'attendance-reports', icon: faChartPie, capabilityKey: 'canAccessAttendance',
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
