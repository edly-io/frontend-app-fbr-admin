import React, { useEffect } from 'react';
import { Outlet, useLocation, useSearchParams } from 'react-router-dom';
import { Spinner } from '@openedx/paragon';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';

import AdminNavContextBar from './components/navigation/AdminNavContextBar';
import Sidebar from './components/sidebar/Sidebar';
import { NAV_ITEM_LABEL_MESSAGES, SECTION_TITLE_MESSAGES } from './components/navigation/AdminNavLinks';
import UnauthorizedPage from './pages/unauthorized/UnauthorizedPage';
import { NAV_SECTIONS } from './constants';
import { useReportsAccess } from './data/apiHooks';
import messages from './messages';
import './admin-console-page-styles.scss';

/**
 * Shell for the admin console. Fetches the caller's roles once (via the shared
 * bootstrap query) and swaps the whole screen based on access:
 *   - loading: full-viewport spinner, no shell
 *   - no admin role: full-page UnauthorizedPage, no shell
 *   - has role: sidebar + mobile context bar + routed outlet
 *
 * Keeping the role check here (not inside each page) is what lets us hide the
 * sidebar/nav from users who shouldn't see any of the admin structure.
 */
const getPageTitleParts = (intl, pathname, view) => {
  const segment = pathname.replace(/^\/+/, '').split('/')[0];
  const section = NAV_SECTIONS.find(({ items }) => items.some(item => item.path === segment));
  const item = section?.items.find(({ path }) => path === segment);
  if (!item) {
    return [intl.formatMessage(messages.breadcrumbAdministration)];
  }
  const parts = [
    intl.formatMessage(NAV_ITEM_LABEL_MESSAGES[item.id]),
    intl.formatMessage(SECTION_TITLE_MESSAGES[section.id]),
  ];
  return view === 'audit-log' ? [intl.formatMessage(messages.navAuditLog), ...parts] : parts;
};

const AdminConsolePage = () => {
  const intl = useIntl();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const view = searchParams.get('view');
  const { capabilities, isLoading } = useReportsAccess();

  useEffect(() => {
    document.title = [...getPageTitleParts(intl, pathname, view), getConfig().SITE_NAME].filter(Boolean).join(' | ');
  }, [intl, pathname, view]);

  if (isLoading) {
    return (
      <div className="admin-console-page admin-console-page--loading">
        <Spinner
          animation="border"
          screenReaderText={intl.formatMessage(messages.breadcrumbAdministration)}
        />
      </div>
    );
  }

  if (!capabilities.canAccessPrograms) {
    return <UnauthorizedPage />;
  }

  return (
    <main id="main" className="admin-console-page">
      <Sidebar />
      <AdminNavContextBar />
      <div className="admin-console-page__content">
        <Outlet />
      </div>
    </main>
  );
};

export default AdminConsolePage;
