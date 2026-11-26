import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import AdminNavLinks from '../navigation/AdminNavLinks';
import useAdminNavigation from '../navigation/useAdminNavigation';
import messages from '../../messages';
import './sidebar-styles.scss';

/**
 * Desktop sidebar navigation. Nav data and list markup come from
 * `useAdminNavigation` / `AdminNavLinks`, shared with the mobile context bar and
 * sheet. Hidden below `lg` by `admin-console-page-styles.scss`.
 */
const Sidebar = () => {
  const intl = useIntl();
  const { sections, badgeCounts } = useAdminNavigation();

  return (
    <nav className="admin-sidebar" aria-label={intl.formatMessage(messages.sidebarLabel)}>
      <AdminNavLinks sections={sections} badgeCounts={badgeCounts} />
    </nav>
  );
};

export default Sidebar;
