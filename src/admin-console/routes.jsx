import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminConsolePage from './AdminConsolePage';
import UsersPage from './pages/users/UsersPage';
import SignupApprovalsPage from './pages/signup-approvals/SignupApprovalsPage';
import BiodataEditRequestsPage from './pages/biodata-edit-requests/BiodataEditRequestsPage';
import CoursesPage from './pages/courses/CoursesPage';
import RegionalOfficesPage from './pages/regional-offices/RegionalOfficesPage';
import AccessPoliciesPage from './pages/access-policies/AccessPoliciesPage';
import AuditLogPage from './pages/audit-log/AuditLogPage';
import ReportsPage from './pages/reports/ReportsPage';

/**
 * Top-level admin console routes. `AdminConsolePage` is the layout route
 * (sidebar + `<Outlet />`); every section is nested underneath it. `/` and
 * any unmatched path redirect to `/users`, mirroring the monolith's
 * `activeNav` default of `'users'`.
 */
const AdminConsoleRoutes = () => (
  <Routes>
    <Route path="/" element={<AdminConsolePage />}>
      <Route index element={<Navigate to="users" replace />} />
      <Route path="users" element={<UsersPage />} />
      <Route path="signup-approvals" element={<SignupApprovalsPage />} />
      <Route path="biodata-edit-requests" element={<BiodataEditRequestsPage />} />
      <Route path="reports" element={<ReportsPage />} />
      <Route path="courses" element={<CoursesPage />} />
      <Route path="regional-offices" element={<RegionalOfficesPage />} />
      <Route path="access-policies" element={<AccessPoliciesPage />} />
      <Route path="audit-log" element={<AuditLogPage />} />
      <Route path="*" element={<Navigate to="users" replace />} />
    </Route>
  </Routes>
);

export default AdminConsoleRoutes;
