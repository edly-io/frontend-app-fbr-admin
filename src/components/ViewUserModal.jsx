import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@openedx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTimes } from '@fortawesome/free-solid-svg-icons';

const ROLE_LABELS = {
  super_admin: 'Super Admin',
  middle_admin: 'Middle Admin',
  data_admin: 'Data Admin',
  instructor: 'Instructor',
  trainee: 'Trainee',
};

const ROLE_STYLE = {
  'Super Admin': { bg: '#FDE8E8', text: '#C53030' },
  'Middle Admin': { bg: '#F2EBFF', text: '#6B3FA0' },
  'Data Admin': { bg: '#FFF3E0', text: '#B45309' },
  Instructor: { bg: '#E8F0FF', text: '#2B5CB0' },
  Trainee: { bg: '#E8F7EE', text: '#276749' },
};

const TRAINEE_TYPE_LABELS = {
  stp: 'STP',
  dst_ist: 'DST / IST',
};

const getRoleLabels = user => (
  Array.isArray(user.roles) && user.roles.length
    ? user.roles.map(role => ROLE_LABELS[role] || role)
    : user.roleLabels || [user.role].filter(Boolean)
);

const formatDate = (value) => {
  if (!value) return '';
  return value;
};

const DetailCell = ({ label, value }) => {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div style={{ minWidth: 0 }}>
      <p style={{ margin: 0, fontSize: '10.5px', fontWeight: 700, color: 'var(--pgn-color-gray-400)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '4px' }}>{label}</p>
      <p style={{ margin: 0, fontSize: '14px', color: 'var(--pgn-color-gray-900)', wordBreak: 'break-word' }}>{value}</p>
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
    <p style={{ margin: '0 0 14px', fontSize: '11px', fontWeight: 700, color: '#2A6496', letterSpacing: '0.08em' }}>{title}</p>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '18px 24px' }}>
      {children}
    </div>
  </div>
);

DetailSection.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

const ViewUserModal = ({ user, onClose, onEdit }) => {
  if (!user) return null;

  const roles = getRoleLabels(user);
  const instructor = user.instructor_profile;
  const trainee = user.trainee_profile;
  const avatarValue = user.photo || user.initials || '?';

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1050, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: '#fff', borderRadius: '12px', width: '720px', maxWidth: '96vw', maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
        <div style={{ background: 'linear-gradient(135deg, #1B3A5C 0%, #1E4976 100%)', height: '94px', position: 'relative', flexShrink: 0, borderRadius: '12px 12px 0 0' }}>
          <button
            type="button"
            onClick={onClose}
            style={{ position: 'absolute', top: '12px', right: '14px', background: 'rgba(255,255,255,0.18)', border: 'none', borderRadius: '6px', color: '#fff', width: '28px', height: '28px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            x
          </button>
          <div style={{ position: 'absolute', bottom: '-38px', left: '32px', width: '76px', height: '76px', borderRadius: '50%', background: user.color || '#1B5E7A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 700, border: '3px solid #fff', boxShadow: '0 4px 14px rgba(0,0,0,0.18)', letterSpacing: '0.03em', overflow: 'hidden' }}>
            {String(avatarValue).startsWith('http') || String(avatarValue).startsWith('/') ? (
              <img src={avatarValue} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            ) : avatarValue}
          </div>
        </div>

        <div style={{ overflowY: 'auto', flex: 1 }}>
          <div style={{ padding: '48px 28px 20px 128px', minHeight: '106px' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 700, color: 'var(--pgn-color-text-base)' }}>{user.full_name || user.name}</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {roles.map((role) => {
                const style = ROLE_STYLE[role] || { bg: '#F0F0F0', text: '#555' };
                return (
                  <span key={role} style={{ background: style.bg, color: style.text, padding: '3px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: style.text }} />
                    {role}
                  </span>
                );
              })}
            </div>
          </div>

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

          {instructor && (
            <DetailSection title="INSTRUCTOR PROFILE">
              <DetailCell label="Field of Expertise" value={instructor.field_of_expertise} />
              <DetailCell label="Languages, Awards, Publications" value={instructor.languages_awards_publications} />
            </DetailSection>
          )}

          {trainee && (
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

        <div style={{ padding: '14px 28px', borderTop: '1px solid var(--pgn-color-border)', display: 'flex', justifyContent: 'flex-end', gap: '10px', flexShrink: 0 }}>
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
  user: PropTypes.shape({}),
  onClose: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};

ViewUserModal.defaultProps = {
  user: null,
};

export default ViewUserModal;
