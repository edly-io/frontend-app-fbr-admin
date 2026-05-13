import React from 'react';
import { Button } from '@openedx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTimes } from '@fortawesome/free-solid-svg-icons';

const ROLE_STYLE = {
  'Super Admin': { bg: '#FDE8E8', text: '#C53030' },
  'Middle Admin': { bg: '#F2EBFF', text: '#6B3FA0' },
  'Data Admin': { bg: '#FFF3E0', text: '#B45309' },
  Instructor: { bg: '#E8F0FF', text: '#2B5CB0' },
  Trainee: { bg: '#E8F7EE', text: '#276749' },
};

const DetailCell = ({ label, value }) => {
  if (!value) return null;
  return (
    <div>
      <p style={{ margin: 0, fontSize: '10.5px', fontWeight: 700, color: 'var(--pgn-color-gray-400)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '4px' }}>{label}</p>
      <p style={{ margin: 0, fontSize: '14px', color: 'var(--pgn-color-gray-900)' }}>{value}</p>
    </div>
  );
};

const ViewUserModal = ({ user, onClose, onEdit }) => {
  if (!user) return null;
  const rs = ROLE_STYLE[user.role] || { bg: '#F0F0F0', text: '#555' };

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1050, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: '#fff', borderRadius: '12px', width: '500px', maxWidth: '96vw', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>

        {/* Blue header — avatar is absolutely placed so it peeks below without being clipped */}
        <div style={{ background: 'linear-gradient(135deg, #1B3A5C 0%, #1E4976 100%)', height: '90px', position: 'relative', flexShrink: 0, borderRadius: '12px 12px 0 0' }}>
          <button
            type="button"
            onClick={onClose}
            style={{ position: 'absolute', top: '12px', right: '14px', background: 'rgba(255,255,255,0.18)', border: 'none', borderRadius: '6px', color: '#fff', width: '28px', height: '28px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ×
          </button>
          {/* Avatar straddles the header bottom edge */}
          <div style={{ position: 'absolute', bottom: '-38px', left: '50%', transform: 'translateX(-50%)', width: '76px', height: '76px', borderRadius: '50%', background: user.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 700, border: '3px solid #fff', boxShadow: '0 4px 14px rgba(0,0,0,0.18)', letterSpacing: '0.03em', flexShrink: 0 }}>
            {user.initials}
          </div>
        </div>

        {/* Name + role badge — padded to clear the avatar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '48px', padding: '48px 28px 20px' }}>
          <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 700, color: 'var(--pgn-color-text-base)', textAlign: 'center' }}>{user.name}</h3>
          <span style={{ background: rs.bg, color: rs.text, padding: '3px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: rs.text }} />
            {user.role}
          </span>
        </div>

        {/* Details grid */}
        <div style={{ borderTop: '1px solid var(--pgn-color-gray-100)', padding: '20px 28px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 24px' }}>
            <DetailCell label="Email" value={user.email} />
            <DetailCell label="Organization" value={user.org} />
            <DetailCell label="Status" value={user.status} />
            <DetailCell label="BPS Grade" value={user.bpsGrade} />
            <DetailCell label="Designation" value={user.designation} />
            <DetailCell label="Mobile" value={user.mobile} />
            <DetailCell label="CNIC" value={user.cnic} />
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 28px', borderTop: '1px solid var(--pgn-color-border)', display: 'flex', justifyContent: 'flex-end', gap: '10px', borderRadius: '0 0 12px 12px' }}>
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

export default ViewUserModal;
