import React from 'react';
import { NavLink } from 'react-router-dom';
import { Badge } from '@openedx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useIntl } from '@edx/frontend-platform/i18n';
import { NAV_SECTIONS } from '../../constants';
import messages from '../../messages';
import { useAdminConsoleBootstrap } from '../../data/apiHooks';
import { getReportsCapabilities } from '../../data/permissions';
import { useSignupApprovals } from '../../pages/signup-approvals/data/apiHooks';
import { useBiodataEditRequests } from '../../pages/biodata-edit-requests/data/apiHooks';
import './sidebar-styles.scss';

const NAV_ITEM_LABEL_MESSAGES = {
  users: messages.navUsers,
  'signup-approvals': messages.navSignupApprovals,
  'biodata-edit-requests': messages.navBiodataEditRequests,
  hrms: messages.navHrms,
  courses: messages.navCourses,
  'regional-offices': messages.navRegionalOffices,
  'access-policies': messages.navAccessPolicies,
  'audit-log': messages.navAuditLog,
  overview: messages.navOverView,
  reports: messages.navReports,
  program: messages.navProgram,
  'sessions-instructor': messages.navSessionsInstructor,
  attendance: messages.navAttendance,
  announcements: messages.navAnnouncements,
};

const normalizeRole = role => String(role || '').toLowerCase();

const canAccessNavItem = (item, roles, capabilities) => {
  if (item.capabilityKey) {
    return Boolean(capabilities[item.capabilityKey]);
  }

  if (!item.allowedRoles) {
    return true;
  }

  const normalizedRoles = roles.map(normalizeRole);
  return item.allowedRoles.some(role => normalizedRoles.includes(normalizeRole(role)));
};

const SECTION_TITLE_MESSAGES = {
  administration: messages.navSectionAdministration,
  analytics: messages.navSectionAnalytics,
  communications: messages.navSectionCommunications,
  reports: messages.navSectionReports,
};

/**
 * Sidebar navigation. Runs its own lightweight (page_size=1) queries to
 * derive the pending-approvals / pending-edit-requests badge counts so the
 * counts stay correct regardless of which route is currently active,
 * mirroring the `onCountChange` callbacks the monolith used to lift counts
 * up from the Signup Approvals / Biodata Edit Requests views.
 */
const Sidebar = () => {
  const intl = useIntl();

  const { data: approvalsData } = useSignupApprovals({ page: 1, pageSize: 1, search: '' });
  const { data: editRequestsData } = useBiodataEditRequests({ page: 1, pageSize: 1, statusFilter: 'pending' });
  const { data: bootstrapData } = useAdminConsoleBootstrap();
  const callerRoles = bootstrapData?.callerProfile?.roles || [];
  const capabilities = getReportsCapabilities(callerRoles);
  const visibleSections = NAV_SECTIONS.map(section => ({
    ...section,
    items: section.items.filter(item => canAccessNavItem(item, callerRoles, capabilities)),
  })).filter(section => section.items.length > 0);

  const pendingApprovalsCount = approvalsData?.total ?? 0;
  const pendingEditRequestsCount = editRequestsData?.total ?? 0;

  return (
    <aside className="admin-sidebar">
      {visibleSections.map(section => (
        <div key={section.id}>
          <p className="admin-sidebar__section-title">
            {intl.formatMessage(SECTION_TITLE_MESSAGES[section.id])}
          </p>
          {section.items.map(item => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) => `admin-sidebar__nav-link d-flex align-items-center text-decoration-none${isActive ? ' admin-sidebar__nav-link--active' : ''}`}
            >
              <FontAwesomeIcon icon={item.icon} className="admin-sidebar__nav-icon" />
              <span className="admin-sidebar__nav-label">{intl.formatMessage(NAV_ITEM_LABEL_MESSAGES[item.id])}</span>
              {item.id === 'signup-approvals' && pendingApprovalsCount > 0 && (
                <Badge variant="danger">{pendingApprovalsCount}</Badge>
              )}
              {item.id === 'biodata-edit-requests' && pendingEditRequestsCount > 0 && (
                <Badge variant="danger">{pendingEditRequestsCount}</Badge>
              )}
            </NavLink>
          ))}
        </div>
      ))}
    </aside>
  );
};

export default Sidebar;
