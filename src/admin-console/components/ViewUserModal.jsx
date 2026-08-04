import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@openedx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import UserIdentity from '../shared/UserIdentity';
import DetailCell from './DetailCell';
import DetailSection from './DetailSection';
import { ROLE_LABELS } from '../pages/users/constants';
import messages from './messages';

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

const formatDate = (value) => {
  if (!value) { return ''; }
  return value;
};

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
  user, onClose, onEdit, sourceTab,
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
      style={{
        position: 'fixed', inset: 0, zIndex: 1050, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={e => { if (e.target === e.currentTarget) { onClose(); } }}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div style={{
        background: '#fff', borderRadius: '12px', width: '720px', maxWidth: '96vw', maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
      }}
      >
        <div style={{
          background: 'linear-gradient(135deg, #1B3A5C 0%, #1E4976 100%)', height: '94px', position: 'relative', flexShrink: 0, borderRadius: '12px 12px 0 0',
        }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              position: 'absolute', top: '12px', right: '14px', background: 'rgba(255,255,255,0.18)', border: 'none', borderRadius: '6px', color: '#fff', width: '28px', height: '28px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            x
          </button>
          <div style={{
            position: 'absolute', bottom: '-38px', left: '32px', width: '76px', height: '76px', borderRadius: '50%', background: user.color || '#1B5E7A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 700, border: '3px solid #fff', boxShadow: '0 4px 14px rgba(0,0,0,0.18)', letterSpacing: '0.03em', overflow: 'hidden',
          }}
          >
            {String(avatarValue).startsWith('http') || String(avatarValue).startsWith('/') ? (
              <img
                src={avatarValue}
                alt=""
                style={{
                  width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%',
                }}
              />
            ) : avatarValue}
          </div>
        </div>

        <div style={{ overflowY: 'auto', flex: 1 }}>
          <div style={{ padding: '48px 28px 20px 128px', minHeight: '106px' }}>
            <UserIdentity
              name={user.full_name || user.name}
              badges={roles}
              size="large"
              showAvatar={false}
            />
          </div>

          {showProfileTabs && (
            <div style={{ borderBottom: '2px solid var(--pgn-color-gray-100)', display: 'flex', padding: '0 28px' }}>
              {availableProfileTabs.map(tab => {
                const isActive = activeProfileTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveProfileTab(tab.id)}
                    style={{
                      padding: '10px 16px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '13.5px',
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? 'var(--pgn-color-primary-base)' : 'var(--pgn-color-text-light)',
                      background: 'transparent',
                      borderBottom: isActive ? '2px solid var(--pgn-color-primary-base)' : '2px solid transparent',
                      marginBottom: '-2px',
                    }}
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

        <div style={{
          padding: '14px 28px', borderTop: '1px solid var(--pgn-color-border)', display: 'flex', justifyContent: 'flex-end', gap: '10px', flexShrink: 0,
        }}
        >
          <Button variant="tertiary" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} style={{ fontSize: '11px', marginRight: '6px' }} />
            {intl.formatMessage(messages.viewUserCloseButton)}
          </Button>
          <Button variant="primary" onClick={() => { onClose(); onEdit(user); }}>
            <FontAwesomeIcon icon={faPen} style={{ fontSize: '11px', marginRight: '6px' }} />
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
};

ViewUserModal.defaultProps = {
  user: null,
  sourceTab: 'all',
};

export default ViewUserModal;
