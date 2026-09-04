import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@openedx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import UserIdentity from '../UserIdentity';
import DetailCell from '../detail-cell/DetailCell';
import DetailSection from '../detail-section/DetailSection';
import { ROLE_LABELS } from '../../pages/users/constants';
import { formatDate } from '../../utils/date';
import messages from '../messages';
import './user-modals-styles.scss';

const userShape = PropTypes.shape({
  id: PropTypes.number,
  full_name: PropTypes.string,
  name: PropTypes.string,
  email: PropTypes.string,
  mobile: PropTypes.string,
  cnic: PropTypes.string,
  status: PropTypes.string,
  color: PropTypes.string,
  photo: PropTypes.string,
  initials: PropTypes.string,
  role: PropTypes.string,
  roleLabels: PropTypes.arrayOf(PropTypes.string),
  roles: PropTypes.arrayOf(PropTypes.string),
  field_organisation: PropTypes.string,
  emergency_contact_name: PropTypes.string,
  emergency_contact_phone: PropTypes.string,
  education_degree: PropTypes.string,
  education_institute: PropTypes.string,
  education_year: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  city: PropTypes.shape({
    name: PropTypes.string,
  }),
  instructor_profile: PropTypes.shape({
    field_of_expertise: PropTypes.string,
    languages_awards_publications: PropTypes.string,
  }),
  trainee_profile: PropTypes.shape({
    trainee_type: PropTypes.string,
    date_of_birth: PropTypes.string,
    designation: PropTypes.string,
    bps_grade: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    hostel_preference: PropTypes.string,
    service_history: PropTypes.string,
    languages_awards_publications: PropTypes.string,
    batch: PropTypes.shape({
      name: PropTypes.string,
    }),
  }),
});

// Maps top-level users-list tab id → profile tab id
const SOURCE_TAB_TO_PROFILE = {
  instructors: 'instructor',
  trainees: 'trainee',
};

const getRoleLabels = user => (
  Array.isArray(user.roles) && user.roles.length
    ? user.roles.map(role => ROLE_LABELS[role] || role)
    : user.roleLabels || [user.role].filter(Boolean)
);

const getAvailableProfileTabs = (user, profileTabs) => {
  if (!user) { return []; }
  return profileTabs.filter(t => (
    (t.id === 'instructor' && !!user.instructor_profile)
    || (t.id === 'trainee' && !!user.trainee_profile)
  ));
};

const getInitialProfileTab = (user, sourceTab) => {
  if (!user) { return null; }
  const preferred = SOURCE_TAB_TO_PROFILE[sourceTab];
  if (preferred === 'instructor' && user.instructor_profile) { return 'instructor'; }
  if (preferred === 'trainee' && user.trainee_profile) { return 'trainee'; }
  if (user.instructor_profile) { return 'instructor'; }
  if (user.trainee_profile) { return 'trainee'; }
  return null;
};

/**
 * Read-only user detail modal opened from the Users table / Signup
 * Approvals / Biodata Edit Requests "view" actions. Shows base profile
 * fields plus an Instructor/Trainee profile tab when the user has one (or
 * both, in which case a tab switcher is shown).
 */
const ViewUserModal = ({
  user, onClose, onEdit, sourceTab, onAuditHistory,
}) => {
  const intl = useIntl();

  const profileTabs = [
    { id: 'instructor', label: intl.formatMessage(messages.viewUserTabInstructor) },
    { id: 'trainee', label: intl.formatMessage(messages.viewUserTabTrainee) },
  ];
  const traineeTypeLabels = {
    stp: intl.formatMessage(messages.viewUserTraineeTypeStp),
    dst_ist: intl.formatMessage(messages.viewUserTraineeTypeDstIst),
  };

  const availableProfileTabs = getAvailableProfileTabs(user, profileTabs);
  const [activeProfileTab, setActiveProfileTab] = useState(
    () => getInitialProfileTab(user, sourceTab),
  );

  if (!user) { return null; }

  const roles = getRoleLabels(user);
  const instructor = user.instructor_profile;
  const trainee = user.trainee_profile;
  const avatarValue = user.photo || user.initials || '?';
  const showProfileTabs = availableProfileTabs.length > 1;
  const showInstructor = instructor && (!showProfileTabs || activeProfileTab === 'instructor');
  const showTrainee = trainee && (!showProfileTabs || activeProfileTab === 'trainee');

  return (
    <div
      role="button"
      tabIndex={0}
      className="view-user-modal__overlay"
      onClick={e => { if (e.target === e.currentTarget) { onClose(); } }}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="view-user-modal__panel">
        <div className="view-user-modal__header">
          <button
            type="button"
            onClick={onClose}
            className="view-user-modal__close-btn"
          >
            x
          </button>
          <div
            className="view-user-modal__avatar"
            style={{ background: user.color || '#1B5E7A' }}
          >
            {String(avatarValue).startsWith('http') || String(avatarValue).startsWith('/') ? (
              <img
                src={avatarValue}
                alt=""
                className="view-user-modal__avatar-image"
              />
            ) : avatarValue}
          </div>
        </div>

        <div className="view-user-modal__body">
          <div className="view-user-modal__identity">
            <UserIdentity
              name={user.full_name || user.name}
              badges={roles}
              size="large"
              showAvatar={false}
            />
            {onAuditHistory && (
              <button
                type="button"
                className="view-user-modal__audit-link"
                onClick={() => onAuditHistory(user)}
              >
                Audit history →
              </button>
            )}
          </div>

          {showProfileTabs && (
            <div className="view-user-modal__tabs">
              {availableProfileTabs.map(tab => {
                const isActive = activeProfileTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveProfileTab(tab.id)}
                    className={`view-user-modal__tab ${isActive ? 'view-user-modal__tab--active' : ''}`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          )}

          <DetailSection title={intl.formatMessage(messages.viewUserSectionProfileInfo)}>
            <DetailCell label={intl.formatMessage(messages.viewUserFieldEmail)} value={user.email} />
            <DetailCell label={intl.formatMessage(messages.viewUserFieldMobile)} value={user.mobile} />
            <DetailCell label={intl.formatMessage(messages.viewUserFieldCnic)} value={user.cnic} />
            <DetailCell label={intl.formatMessage(messages.viewUserFieldStatus)} value={user.status} />
            <DetailCell label={intl.formatMessage(messages.viewUserFieldCity)} value={user.city?.name} />
            <DetailCell
              label={intl.formatMessage(messages.viewUserFieldOrganisation)}
              value={user.field_organisation}
            />
            <DetailCell
              label={intl.formatMessage(messages.viewUserFieldEmergencyContact)}
              value={user.emergency_contact_name}
            />
            <DetailCell
              label={intl.formatMessage(messages.viewUserFieldEmergencyPhone)}
              value={user.emergency_contact_phone}
            />
            <DetailCell
              label={intl.formatMessage(messages.viewUserFieldEducationDegree)}
              value={user.education_degree}
            />
            <DetailCell
              label={intl.formatMessage(messages.viewUserFieldEducationInstitute)}
              value={user.education_institute}
            />
            <DetailCell
              label={intl.formatMessage(messages.viewUserFieldEducationYear)}
              value={user.education_year}
            />
          </DetailSection>

          {showInstructor && (
            <DetailSection title={intl.formatMessage(messages.viewUserSectionInstructorProfile)}>
              <DetailCell
                label={intl.formatMessage(messages.viewUserFieldFieldOfExpertise)}
                value={instructor.field_of_expertise}
              />
              <DetailCell
                label={intl.formatMessage(messages.viewUserFieldLanguagesAwardsPublications)}
                value={instructor.languages_awards_publications}
              />
            </DetailSection>
          )}

          {showTrainee && (
            <DetailSection title={intl.formatMessage(messages.viewUserSectionTraineeProfile)}>
              <DetailCell
                label={intl.formatMessage(messages.viewUserFieldTraineeType)}
                value={traineeTypeLabels[trainee.trainee_type] || trainee.trainee_type}
              />
              <DetailCell label={intl.formatMessage(messages.viewUserFieldBatch)} value={trainee.batch?.name} />
              <DetailCell
                label={intl.formatMessage(messages.viewUserFieldDateOfBirth)}
                value={formatDate(trainee.date_of_birth)}
              />
              <DetailCell
                label={intl.formatMessage(messages.viewUserFieldDesignation)}
                value={trainee.designation}
              />
              <DetailCell label={intl.formatMessage(messages.viewUserFieldBpsGrade)} value={trainee.bps_grade} />
              <DetailCell
                label={intl.formatMessage(messages.viewUserFieldHostelPreference)}
                value={trainee.hostel_preference}
              />
              <DetailCell
                label={intl.formatMessage(messages.viewUserFieldServiceHistory)}
                value={trainee.service_history}
              />
              <DetailCell
                label={intl.formatMessage(messages.viewUserFieldLanguagesAwardsPublications)}
                value={trainee.languages_awards_publications}
              />
            </DetailSection>
          )}
        </div>

        <div className="view-user-modal__footer">
          <Button variant="tertiary" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} className="view-user-modal__btn-icon" />
            {intl.formatMessage(messages.viewUserCloseButton)}
          </Button>
          <Button variant="primary" onClick={() => { onClose(); onEdit(user); }}>
            <FontAwesomeIcon icon={faPen} className="view-user-modal__btn-icon" />
            {intl.formatMessage(messages.viewUserEditButton)}
          </Button>
        </div>
      </div>
    </div>
  );
};

ViewUserModal.propTypes = {
  user: userShape,
  onClose: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  sourceTab: PropTypes.string,
  onAuditHistory: PropTypes.func,
};

ViewUserModal.defaultProps = {
  user: null,
  sourceTab: 'all',
  onAuditHistory: null,
};

export default ViewUserModal;
