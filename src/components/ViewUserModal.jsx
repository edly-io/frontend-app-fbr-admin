import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@openedx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTimes } from '@fortawesome/free-solid-svg-icons';
import UserIdentity from './UserIdentity';

const ROLE_LABELS = {
  super_admin: 'Super Admin',
  middle_admin: 'Middle Admin',
  data_admin: 'Data Admin',
  instructor: 'Instructor',
  trainee: 'Trainee',
};

const TRAINEE_TYPE_LABELS = {
  stp: 'STP',
  dst_ist: 'DST / IST',
};

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

const PROFILE_TABS = [
  { id: 'instructor', label: 'Instructor Profile' },
  { id: 'trainee', label: 'Trainee Profile' },
];

const getRoleLabels = user => (
  Array.isArray(user.roles) && user.roles.length
    ? user.roles.map(role => ROLE_LABELS[role] || role)
    : user.roleLabels || [user.role].filter(Boolean)
);

const formatDate = (value) => {
  if (!value) { return ''; }
  return value;
};

const getAvailableProfileTabs = (user) => {
  if (!user) { return []; }
  return PROFILE_TABS.filter(t => (
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

const DetailCell = ({ label, value }) => {
  if (value === undefined || value === null || value === '') { return null; }
  return (
    <div style={{ minWidth: 0 }}>
      <p style={{
        margin: 0, fontSize: '10.5px', fontWeight: 700, color: 'var(--pgn-color-gray-400)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '4px',
      }}
      >{label}
      </p>
      <p style={{
        margin: 0, fontSize: '14px', color: 'var(--pgn-color-gray-900)', wordBreak: 'break-word',
      }}
      >{value}
      </p>
    </div>
  );
};

DetailCell.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

DetailCell.defaultProps = {
  value: '',
};

const DetailSection = ({ title, children }) => (
  <div style={{ borderTop: '1px solid var(--pgn-color-gray-100)', padding: '18px 28px 22px' }}>
    <p style={{
      margin: '0 0 14px', fontSize: '11px', fontWeight: 700, color: '#2A6496', letterSpacing: '0.08em',
    }}
    >{title}
    </p>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '18px 24px' }}>
      {children}
    </div>
  </div>
);

DetailSection.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

const ViewUserModal = ({
  user, onClose, onEdit, sourceTab,
}) => {
  const availableProfileTabs = getAvailableProfileTabs(user);
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

          <DetailSection title="PROFILE INFORMATION">
            <DetailCell label="Email" value={user.email} />
            <DetailCell label="Mobile" value={user.mobile} />
            <DetailCell label="CNIC" value={user.cnic} />
            <DetailCell label="Status" value={user.status} />
            <DetailCell label="City" value={user.city?.name} />
            <DetailCell label="Field Organisation" value={user.field_organisation} />
            <DetailCell label="Emergency Contact" value={user.emergency_contact_name} />
            <DetailCell label="Emergency Phone" value={user.emergency_contact_phone} />
            <DetailCell label="Education Degree" value={user.education_degree} />
            <DetailCell label="Education Institute" value={user.education_institute} />
            <DetailCell label="Education Year" value={user.education_year} />
          </DetailSection>

          {showInstructor && (
            <DetailSection title="INSTRUCTOR PROFILE">
              <DetailCell label="Field of Expertise" value={instructor.field_of_expertise} />
              <DetailCell label="Languages, Awards, Publications" value={instructor.languages_awards_publications} />
            </DetailSection>
          )}

          {showTrainee && (
            <DetailSection title="TRAINEE PROFILE">
              <DetailCell label="Trainee Type" value={TRAINEE_TYPE_LABELS[trainee.trainee_type] || trainee.trainee_type} />
              <DetailCell label="Batch" value={trainee.batch?.name} />
              <DetailCell label="Date of Birth" value={formatDate(trainee.date_of_birth)} />
              <DetailCell label="Designation" value={trainee.designation} />
              <DetailCell label="BPS Grade" value={trainee.bps_grade} />
              <DetailCell label="Hostel Preference" value={trainee.hostel_preference} />
              <DetailCell label="Service History" value={trainee.service_history} />
              <DetailCell label="Languages, Awards, Publications" value={trainee.languages_awards_publications} />
            </DetailSection>
          )}
        </div>

        <div style={{
          padding: '14px 28px', borderTop: '1px solid var(--pgn-color-border)', display: 'flex', justifyContent: 'flex-end', gap: '10px', flexShrink: 0,
        }}
        >
          <Button variant="tertiary" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} style={{ fontSize: '11px', marginRight: '6px' }} />
            Close
          </Button>
          <Button variant="primary" onClick={() => { onClose(); onEdit(user); }}>
            <FontAwesomeIcon icon={faPen} style={{ fontSize: '11px', marginRight: '6px' }} />
            Edit User
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
