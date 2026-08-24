import React from 'react';
import PropTypes from 'prop-types';
import UserIdentity from '../admin-console/components/UserIdentity';
import './ViewAnnouncementModal.css';

const CHANNEL_LABELS = { send_email: 'Email', send_banner: 'Banner', send_notification: 'Notification' };
const SCOPE_LABELS = { sitewide: 'Sitewide', program: 'Program' };
const ROLE_DISPLAY = {
  super_admin: 'Super Admin',
  middle_admin: 'Middle Admin',
  data_admin: 'Data Admin',
  instructor: 'Instructor',
  trainee: 'Trainee',
};
const BANNER_STATUS_LABELS = { active: 'Active', expired: 'Expired' };
const BANNER_STATUS_CLS = { active: 'vann-banner--active', expired: 'vann-banner--expired' };

const formatDate = (val) => (val ? new Date(val).toLocaleString() : '—');
const formatDateShort = (val) => (val
  ? new Date(val).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
  : '—');

const Field = ({ label, children }) => (
  <div className="vann-field">
    <span className="vann-label">{label}</span>
    <span className="vann-value">{children}</span>
  </div>
);
Field.propTypes = { label: PropTypes.string.isRequired, children: PropTypes.node.isRequired };

const ViewAnnouncementModal = ({ item, onClose }) => {
  const channels = Object.keys(CHANNEL_LABELS).filter(ch => item[ch]);

  return (
    <div className="vann-overlay" role="dialog" aria-modal="true" aria-label="Announcement details">
      <div className="vann-modal">
        <div className="vann-header">
          <h2 className="vann-title">Announcement Details</h2>
          <button type="button" onClick={onClose} className="vann-close-btn" aria-label="Close">×</button>
        </div>

        <div className="vann-body">
          <h3 className="vann-subject">{item.subject}</h3>

          <div className="vann-meta-grid">
            <Field label="Sent at">{formatDate(item.sent_at)}</Field>
            <Field label="Scope">{SCOPE_LABELS[item.scope] || item.scope}</Field>
            {item.scope === 'program' && item.program_key && (
              <Field label="Program"><code className="vann-code">{item.program_key}</code></Field>
            )}
            <Field label="Channels">
              {channels.length > 0 ? channels.map(ch => (
                <span key={ch} className="vann-channel-tag">{CHANNEL_LABELS[ch]}</span>
              )) : '—'}
            </Field>
            {item.recipient_types && item.recipient_types.length > 0 && (
              <Field label="Sent to">{item.recipient_types.join(', ')}</Field>
            )}
            {item.send_banner && (
              <Field label="Banner expiry">
                <span>{formatDateShort(item.banner_expires_at)}</span>
                {item.banner_status && (
                  <span className={`vann-banner-badge ${BANNER_STATUS_CLS[item.banner_status] || ''}`}>
                    {BANNER_STATUS_LABELS[item.banner_status] || item.banner_status}
                  </span>
                )}
              </Field>
            )}
            {item.sent_by_name && (
              <Field label="Created by">
                <UserIdentity
                  name={item.sent_by_name}
                  badges={[ROLE_DISPLAY[item.sent_by_role]].filter(Boolean)}
                  size="compact"
                  showAvatar
                />
              </Field>
            )}
          </div>

          {item.summary && (
            <div className="vann-section">
              <span className="vann-section-label">Summary</span>
              <p className="vann-summary">{item.summary}</p>
            </div>
          )}

          <div className="vann-section">
            <span className="vann-section-label">Body</span>
            {/* body_html is admin-authored content */}
            {/* eslint-disable-next-line react/no-danger */}
            <div className="vann-body-html" dangerouslySetInnerHTML={{ __html: item.body_html }} />
          </div>
        </div>

        <div className="vann-footer">
          <button type="button" onClick={onClose} className="vann-done-btn">Close</button>
        </div>
      </div>
    </div>
  );
};

ViewAnnouncementModal.propTypes = {
  item: PropTypes.shape({
    subject: PropTypes.string,
    body_html: PropTypes.string,
    summary: PropTypes.string,
    scope: PropTypes.string,
    program_key: PropTypes.string,
    send_email: PropTypes.bool,
    send_banner: PropTypes.bool,
    send_notification: PropTypes.bool,
    banner_expires_at: PropTypes.string,
    banner_status: PropTypes.string,
    recipient_types: PropTypes.arrayOf(PropTypes.string),
    sent_at: PropTypes.string,
    sent_by_name: PropTypes.string,
    sent_by_role: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ViewAnnouncementModal;
