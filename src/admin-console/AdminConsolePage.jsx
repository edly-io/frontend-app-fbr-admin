import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';

/**
 * Pure shell/orchestration component for the admin console: renders the
 * sidebar navigation and delegates the main content area to whichever
 * routed page is currently active via `<Outlet />`.
 */
const AdminConsolePage = () => (
  <main style={{ display: 'flex', background: 'var(--pgn-color-theme-bg-gray)', minHeight: '100vh' }}>
    <Sidebar />
    <div style={{ flex: 1, padding: '28px 36px', minWidth: 0 }}>
      <Outlet />
    </div>
  </main>
);

export default AdminConsolePage;
