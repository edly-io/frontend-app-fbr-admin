import React from 'react';
import { Outlet } from 'react-router-dom';
import { Spinner } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import AdminNavContextBar from './components/navigation/AdminNavContextBar';
import Sidebar from './components/sidebar/Sidebar';
import UnauthorizedPage from './pages/unauthorized/UnauthorizedPage';
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
const AdminConsolePage = () => {
  const intl = useIntl();
  const { capabilities, isLoading } = useReportsAccess();

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
    <main className="admin-console-page">
      <Sidebar />
      <AdminNavContextBar />
      <div className="admin-console-page__content">
        <Outlet />
      </div>
    </main>
  );
};

export default AdminConsolePage;
