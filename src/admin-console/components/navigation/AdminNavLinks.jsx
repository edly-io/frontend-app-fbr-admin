import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { Badge } from '@openedx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from '../../messages';
import './admin-nav-links-styles.scss';

export const NAV_ITEM_LABEL_MESSAGES = {
  dashboard: messages.navDashboard,
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
  documents: messages.navDocuments,
};

export const SECTION_TITLE_MESSAGES = {
  administration: messages.navSectionAdministration,
  analytics: messages.navSectionAnalytics,
  communications: messages.navSectionCommunications,
  reports: messages.navSectionReports,
};

/**
 * The grouped nav list shared by the desktop sidebar and the nav sheet. Both
 * render the same `admin-sidebar__*` classes, styled once in
 * `admin-nav-links-styles.scss`.
 *
 * `withActiveIndicator` adds a check icon and screen-reader text for the sheet,
 * where the row's colour and weight are the only other cues.
 */
const AdminNavLinks = ({
  sections, badgeCounts, withActiveIndicator, onNavigate,
}) => {
  const intl = useIntl();

  return (
    <>
      {sections.map(section => (
        <div key={section.id}>
          <p className="admin-sidebar__section-title">
            {intl.formatMessage(SECTION_TITLE_MESSAGES[section.id])}
          </p>
          {section.items.map((item) => {
            const badgeCount = badgeCounts[item.id] || 0;

            return (
              <NavLink
                key={item.id}
                to={item.path}
                onClick={onNavigate}
                className={({ isActive }) => `admin-sidebar__nav-link d-flex align-items-center text-decoration-none${isActive ? ' admin-sidebar__nav-link--active' : ''}`}
              >
                {({ isActive }) => (
                  <>
                    <FontAwesomeIcon icon={item.icon} className="admin-sidebar__nav-icon" />
                    <span className="admin-sidebar__nav-label">{intl.formatMessage(NAV_ITEM_LABEL_MESSAGES[item.id])}</span>
                    {badgeCount > 0 && (
                      <Badge variant="danger">{badgeCount}</Badge>
                    )}
                    {withActiveIndicator && isActive && (
                      <>
                        <FontAwesomeIcon icon={faCheck} className="admin-sidebar__nav-active-icon" />
                        <span className="sr-only">{intl.formatMessage(messages.navCurrentPage)}</span>
                      </>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      ))}
    </>
  );
};

AdminNavLinks.propTypes = {
  sections: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
      // eslint-disable-next-line react/forbid-prop-types
      icon: PropTypes.object.isRequired,
    })).isRequired,
  })).isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  badgeCounts: PropTypes.object,
  withActiveIndicator: PropTypes.bool,
  onNavigate: PropTypes.func,
};

AdminNavLinks.defaultProps = {
  badgeCounts: {},
  withActiveIndicator: false,
  onNavigate: undefined,
};

export default AdminNavLinks;
