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
import ProgramReportsPage from './pages/program-reports/ProgramReportsPage';
import SessionsInstructorReportsPage from './pages/sessions-instructor-reports/SessionsInstructorReportsPage';
import AttendanceReportsPage from './pages/attendance-reports/AttendanceReportsPage';
import HrmsPage from './pages/hrms/HrmsPage';
import AnnouncementsPage from './pages/announcements/AnnouncementsPage';

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
      <Route path="hrms" element={<HrmsPage />} />
      <Route path="program-reports" element={<ProgramReportsPage />} />
      <Route path="sessions-reports" element={<SessionsInstructorReportsPage />} />
      <Route path="attendance-reports" element={<AttendanceReportsPage />} />
      <Route path="courses" element={<CoursesPage />} />
      <Route path="regional-offices" element={<RegionalOfficesPage />} />
      <Route path="access-policies" element={<AccessPoliciesPage />} />
      <Route path="audit-log" element={<AuditLogPage />} />
      <Route path="announcements" element={<AnnouncementsPage />} />
      <Route path="*" element={<Navigate to="users" replace />} />
    </Route>
  </Routes>
);

export default AdminConsoleRoutes;
