import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Button, Card, Icon } from '@openedx/paragon';
import { AccessTime, ChevronRight } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import SectionHeading from './SectionHeading';
import SectionState from './SectionState';
import SegmentedBar from './SegmentedBar';
import {
  DEFAULT_ROLE_COLOR, DEFAULT_ROLE_SURFACE, ROLE_COLORS, ROLE_IDS, ROLE_SURFACES,
  TONE_COLORS, TONE_SURFACES,
} from './constants';
import messages from './messages';
import componentMessages from '../../components/messages';

// The backend's own `label` is the fallback for a role added since this list.
const ROLE_MESSAGES = {
  [ROLE_IDS.superAdmin]: messages.roleSuperAdmin,
  [ROLE_IDS.middleAdmin]: messages.roleMiddleAdmin,
  [ROLE_IDS.dataAdmin]: messages.roleDataAdmin,
  [ROLE_IDS.instructor]: messages.roleInstructor,
  [ROLE_IDS.trainee]: messages.roleTrainee,
};

// Reuses the Add User modal's role descriptions so both screens describe a role
// the same way; the API sends no per-role detail beyond the head-count.
const ROLE_DESCRIPTIONS = {
  [ROLE_IDS.superAdmin]: componentMessages.roleSuperAdminDesc,
  [ROLE_IDS.middleAdmin]: componentMessages.roleMiddleAdminDesc,
  [ROLE_IDS.dataAdmin]: componentMessages.roleDataAdminDesc,
  [ROLE_IDS.instructor]: componentMessages.roleInstructorDesc,
  [ROLE_IDS.trainee]: componentMessages.roleTraineeDesc,
};

const UsersOverview = ({ users, isLoading, isError }) => {
  const intl = useIntl();
  const sectionName = intl.formatMessage(messages.usersTitle);

  const roleLabel = role => (
    ROLE_MESSAGES[role.id] ? intl.formatMessage(ROLE_MESSAGES[role.id]) : role.label
  );

  const roles = users?.roles || [];

  // Sized against the sum of the counts, not `totalUsers`: a person holding two
  // roles is counted under each.
  const segments = roles.map(role => ({
    id: role.id,
    percentage: role.share,
    color: ROLE_COLORS[role.id] || DEFAULT_ROLE_COLOR,
  }));

  const compositionLabel = intl.formatMessage(messages.usersCompositionLabel, {
    breakdown: roles
      .map(role => intl.formatMessage(messages.usersCompositionItem, {
        role: roleLabel(role),
        count: role.count,
      }))
      .join(', '),
  });

  return (
    <section className="dashboard-section" aria-labelledby="dashboard-users-heading">
      <SectionHeading
        id="dashboard-users-heading"
        title={sectionName}
        subtitle={intl.formatMessage(messages.usersSubtitle)}
        action={(
          <Button as={Link} to="/users" variant="link" size="sm" iconAfter={ChevronRight}>
            {intl.formatMessage(messages.usersManageLink)}
          </Button>
        )}
      />

      <SectionState
        section={sectionName}
        isLoading={isLoading}
        isError={isError}
        isEmpty={Boolean(users) && roles.length === 0}
        emptyMessage={intl.formatMessage(messages.usersEmpty)}
      >
        <Card className="dashboard-users">
          <Card.Section>
            <div className="dashboard-users__top d-flex align-items-center flex-wrap">
              <div className="dashboard-users__total">
                <p className="dashboard-users__total-value mb-0">{users?.totalUsers}</p>
                <p className="dashboard-users__total-label mb-0">
                  {intl.formatMessage(messages.usersTotalLabel, { roles: users?.visibleRoles })}
                </p>
              </div>

              <Link
                to="/signup-approvals"
                className="dashboard-users__pending d-inline-flex align-items-center"
                style={{
                  backgroundColor: TONE_SURFACES.caution,
                  color: TONE_COLORS.caution,
                }}
              >
                <Icon src={AccessTime} className="dashboard-users__pending-icon" aria-hidden />
                <span className="dashboard-users__pending-text">
                  <span className="dashboard-users__pending-value">{users?.pendingApproval}</span>
                  <span className="dashboard-users__pending-label">
                    {intl.formatMessage(messages.usersPendingApproval)}
                  </span>
                </span>
              </Link>
            </div>

            <SegmentedBar
              segments={segments}
              label={compositionLabel}
              className="dashboard-users__bar"
            />

            <ul className="dashboard-users__legend list-unstyled row mb-0">
              {roles.map(role => (
                <li className="col-6 col-md-4 col-xl dashboard-users__legend-col" key={role.id}>
                  <Link
                    to={{ pathname: '/users', search: `?${new URLSearchParams({ role: role.id })}` }}
                    className="dashboard-users__legend-item d-block"
                    style={{
                      '--dashboard-role-surface': ROLE_SURFACES[role.id] || DEFAULT_ROLE_SURFACE,
                      '--dashboard-role-hue': ROLE_COLORS[role.id] || DEFAULT_ROLE_COLOR,
                    }}
                    aria-label={intl.formatMessage(messages.usersLegendLinkLabel, {
                      role: roleLabel(role),
                      count: role.count,
                    })}
                  >
                    <span className="dashboard-users__legend-head d-flex align-items-center">
                      <span
                        className="dashboard-users__legend-swatch"
                        style={{ backgroundColor: ROLE_COLORS[role.id] || DEFAULT_ROLE_COLOR }}
                        aria-hidden
                      />
                      <span className="dashboard-users__legend-role">{roleLabel(role)}</span>
                    </span>
                    <span className="dashboard-users__legend-value">{role.count}</span>
                    {ROLE_DESCRIPTIONS[role.id] && (
                      <span className="dashboard-users__legend-split">
                        {intl.formatMessage(ROLE_DESCRIPTIONS[role.id])}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </Card.Section>
        </Card>
      </SectionState>
    </section>
  );
};

UsersOverview.propTypes = {
  /** `null` until `GET /fbr/api/reports/dashboard/users/` resolves. */
  users: PropTypes.shape({
    roles: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string,
      count: PropTypes.number.isRequired,
      share: PropTypes.number.isRequired,
    })).isRequired,
    totalUsers: PropTypes.number.isRequired,
    visibleRoles: PropTypes.number.isRequired,
    pendingApproval: PropTypes.number.isRequired,
  }),
  isLoading: PropTypes.bool,
  isError: PropTypes.bool,
};

UsersOverview.defaultProps = {
  users: null,
  isLoading: false,
  isError: false,
};

export default UsersOverview;
