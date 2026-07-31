import React from 'react';
import { NavLink } from 'react-router-dom';
import { Badge } from '@openedx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useIntl } from '@edx/frontend-platform/i18n';
import { NAV_SECTIONS } from '../constants';
import messages from '../messages';
import { useSignupApprovals } from '../pages/signup-approvals/data/apiHooks';
import { useBiodataEditRequests } from '../pages/biodata-edit-requests/data/apiHooks';

const NAV_ITEM_LABEL_MESSAGES = {
  users: messages.navUsers,
  'signup-approvals': messages.navSignupApprovals,
  'biodata-edit-requests': messages.navBiodataEditRequests,
  courses: messages.navCourses,
  'regional-offices': messages.navRegionalOffices,
  'access-policies': messages.navAccessPolicies,
  'audit-log': messages.navAuditLog,
  overview: messages.navOverView,
  reports: messages.navReports,
};

const SECTION_TITLE_MESSAGES = {
  administration: messages.navSectionAdministration,
  analytics: messages.navSectionAnalytics,
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

  const pendingApprovalsCount = approvalsData?.total ?? 0;
  const pendingEditRequestsCount = editRequestsData?.total ?? 0;

  return (
    <aside style={{
      width: '240px', flexShrink: 0, background: '#fff', borderRight: '1px solid var(--pgn-color-border)', padding: '24px 12px',
    }}
    >
      {NAV_SECTIONS.map(section => (
        <div key={section.id}>
          <p style={{
            fontSize: '10.5px', fontWeight: 700, color: 'var(--pgn-color-gray-400)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 8px', margin: '16px 0 6px',
          }}
          >
            {intl.formatMessage(SECTION_TITLE_MESSAGES[section.id])}
          </p>
          {section.items.map(item => (
            <NavLink
              key={item.id}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px', width: '100%', border: 'none', borderRadius: '7px', cursor: 'pointer', fontSize: '13.5px', fontWeight: isActive ? 600 : 400, background: isActive ? 'var(--pgn-color-primary-light)' : 'transparent', color: isActive ? 'var(--pgn-color-primary-base)' : 'var(--pgn-color-gray-700)', textAlign: 'left', marginBottom: '2px', textDecoration: 'none',
              })}
            >
              <FontAwesomeIcon icon={item.icon} style={{ width: '15px', opacity: 0.8, flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{intl.formatMessage(NAV_ITEM_LABEL_MESSAGES[item.id])}</span>
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
