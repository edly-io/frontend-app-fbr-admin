import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './components/sidebar/Sidebar';
import './admin-console-page-styles.scss';

/**
 * Pure shell/orchestration component for the admin console: renders the
 * sidebar navigation and delegates the main content area to whichever
 * routed page is currently active via `<Outlet />`.
 */
const AdminConsolePage = () => (
  <main className="admin-console-page">
    <Sidebar />
    <div className="admin-console-page__content">
      <Outlet />
    </div>
  </main>
);

export default AdminConsolePage;
