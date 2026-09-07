import React from 'react';
import AdminNavLinks from '../navigation/AdminNavLinks';
import useAdminNavigation from '../navigation/useAdminNavigation';
import './sidebar-styles.scss';

/**
 * Desktop sidebar navigation. Nav data and list markup come from
 * `useAdminNavigation` / `AdminNavLinks`, shared with the mobile context bar and
 * sheet. Hidden below `lg` by `admin-console-page-styles.scss`.
 */
const Sidebar = () => {
  const { sections, badgeCounts } = useAdminNavigation();

  return (
    <aside className="admin-sidebar">
      <AdminNavLinks sections={sections} badgeCounts={badgeCounts} />
    </aside>
  );
};

export default Sidebar;
