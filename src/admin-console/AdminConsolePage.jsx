import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminNavContextBar from './components/navigation/AdminNavContextBar';
import Sidebar from './components/sidebar/Sidebar';
import './admin-console-page-styles.scss';

/**
 * Pure shell/orchestration component for the admin console: renders the
 * navigation and delegates the main content area to whichever routed page is
 * currently active via `<Outlet />`.
 *
 * Both navigations stay mounted and are swapped by CSS at the `lg` breakpoint,
 * so there is no resize-driven remount.
 */
const AdminConsolePage = () => (
  <main className="admin-console-page">
    <Sidebar />
    <AdminNavContextBar />
    <div className="admin-console-page__content">
      <Outlet />
    </div>
  </main>
);

export default AdminConsolePage;
