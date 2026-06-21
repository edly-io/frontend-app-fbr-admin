import 'core-js/stable';
import 'regenerator-runtime/runtime';

import {
  APP_INIT_ERROR, APP_READY, subscribe, initialize, getConfig,
} from '@edx/frontend-platform';
import { AppProvider, ErrorPage } from '@edx/frontend-platform/react';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { createRoot } from 'react-dom/client';

import Header from '@edx/frontend-component-header';
import { FooterSlot } from '@edx/frontend-component-footer';
import messages from './i18n';
import AdminConsolePage from './AdminConsolePage';

import './index.scss';

const root = createRoot(document.getElementById('root'));
const normalizePath = (value) => {
  try {
    const url = new URL(value, window.location.origin);
    return url.pathname.replace(/\/+$/, '') || '/';
  } catch {
    return '/';
  }
};

const isActivePath = (href) => {
  const currentPath = normalizePath(window.location.href);
  const targetPath = normalizePath(href);

  if (targetPath === '/dashboard' && currentPath.startsWith('/learner-dashboard')) {
    return true;
  }

  return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
};

const getDashboardUrl = () => {
  const { LEARNER_DASHBOARD_URL, LMS_BASE_URL } = getConfig();
  return LEARNER_DASHBOARD_URL || `${LMS_BASE_URL.replace(/\/$/, '')}/dashboard`;
};

const getProgramsUrl = () => `${getConfig().LMS_BASE_URL.replace(/\/$/, '')}/dashboard/programs`;
const getDiscoverUrl = () => `${getConfig().LMS_BASE_URL.replace(/\/$/, '')}/courses`;
const getAdminConsoleUrl = () => getConfig().FBR_ADMIN_BASE_URL || getConfig().FBR_ADMIN_MICROFRONTEND_URL;
const getProfileUrl = (username) => `${getConfig().ACCOUNT_PROFILE_URL.replace(/\/$/, '')}/u/${username}`;

const buildMainMenu = (authenticatedUser) => {
  const items = [
    {
      type: 'item',
      href: getDashboardUrl(),
      content: 'Courses',
      isActive: isActivePath(getDashboardUrl()),
    },
  ];

  if (getConfig().ENABLE_PROGRAMS) {
    items.push({
      type: 'item',
      href: getProgramsUrl(),
      content: 'Programs',
      isActive: isActivePath(getProgramsUrl()),
    });
  }

  if (!getConfig().NON_BROWSABLE_COURSES) {
    items.push({
      type: 'item',
      href: getDiscoverUrl(),
      content: 'Discover New',
      isActive: isActivePath(getDiscoverUrl()),
    });
  }

  if (getConfig().SESSIONS_BASE_URL) {
    items.push({
      type: 'item',
      href: getConfig().SESSIONS_BASE_URL,
      content: 'Calendar',
      isActive: isActivePath(getConfig().SESSIONS_BASE_URL),
    });
  }

  if (authenticatedUser?.administrator && getAdminConsoleUrl()) {
    items.push({
      type: 'item',
      href: getAdminConsoleUrl(),
      content: 'Admin Console',
      isActive: isActivePath(getAdminConsoleUrl()),
    });
  }

  return items;
};

const buildUserMenu = (authenticatedUser) => [
  {
    heading: '',
    items: [
      ...(authenticatedUser?.username ? [{
        type: 'item',
        href: getProfileUrl(authenticatedUser.username),
        content: 'Profile',
      }] : []),
      ...(getConfig().ACCOUNT_SETTINGS_URL ? [{
        type: 'item',
        href: getConfig().ACCOUNT_SETTINGS_URL,
        content: 'Account',
      }] : []),
      ...(getConfig().ORDER_HISTORY_URL ? [{
        type: 'item',
        href: getConfig().ORDER_HISTORY_URL,
        content: 'Order History',
      }] : []),
    ],
  },
  {
    heading: '',
    items: [
      {
        type: 'item',
        href: getConfig().LOGOUT_URL,
        content: 'Logout',
      },
    ],
  },
];

const HeaderSlot = () => {
  const authenticatedUser = getAuthenticatedUser();

  return (
    <Header
      mainMenuItems={buildMainMenu(authenticatedUser)}
      userMenuItems={buildUserMenu(authenticatedUser)}
    />
  );
};

subscribe(APP_READY, () => {
  root.render(
    <AppProvider>
      <HeaderSlot />
      <AdminConsolePage />
      <FooterSlot />
    </AppProvider>,
  );
});

subscribe(APP_INIT_ERROR, (error) => {
  root.render(<ErrorPage message={error.message} />);
});

initialize({
  messages,
});
