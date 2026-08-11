import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@openedx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus, faTrash, faChevronDown, faChevronUp,
} from '@fortawesome/free-solid-svg-icons';
import { listAnnouncements, deleteAnnouncement, getAnnouncementRecipients } from './api';
import CreateAnnouncementModal from './CreateAnnouncementModal';
import './AnnouncementsView.css';

const CHANNEL_LABELS = { send_email: 'Email', send_banner: 'Banner', send_notification: 'Notification' };
const CHANNELS = Object.keys(CHANNEL_LABELS);
const SCOPE_LABELS = { sitewide: 'Sitewide', program: 'Program', course: 'Course' };

const DELIVERY_CLASS = {
  sent: 'ann-delivery--sent',
  failed: 'ann-delivery--failed',
  skipped: 'ann-delivery--skipped',
  pending: 'ann-delivery--pending',
};

const DeliveryBadge = ({ status }) => {
  const cls = DELIVERY_CLASS[status] || DELIVERY_CLASS.pending;
  return <span className={`ann-tag ${cls}`}>{status}</span>;
};
DeliveryBadge.propTypes = { status: PropTypes.string.isRequired };

const ChannelTags = ({ item }) => (
  <span>
    {CHANNELS.filter(ch => item[ch]).map(ch => (
      <span key={ch} className="ann-tag ann-tag--channel">{CHANNEL_LABELS[ch]}</span>
    ))}
    {!CHANNELS.some(ch => item[ch]) && <span className="ann-tag--empty">—</span>}
  </span>
);
ChannelTags.propTypes = { item: PropTypes.shape({}).isRequired };

const StatusBadge = ({ status }) => {
  const isSent = status === 'sent';
  return (
    <span className={`ann-badge ${isSent ? 'ann-badge--sent' : 'ann-badge--draft'}`}>
      <span className={`ann-status-dot ${isSent ? 'ann-status-dot--sent' : 'ann-status-dot--draft'}`} />
      {isSent ? 'Sent' : 'Draft'}
    </span>
  );
};
StatusBadge.propTypes = { status: PropTypes.string.isRequired };

const formatDate = (val) => (val ? new Date(val).toLocaleString() : '—');

const RecipientsLog = ({ announcementId, sendEmail, sendNotification }) => {
  const [recipients, setRecipients] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    getAnnouncementRecipients(announcementId)
      .then(({ data }) => setRecipients(data))
      .catch(() => setError('Failed to load recipients.'))
      .finally(() => setLoading(false));
  }, [announcementId]);

  if (loading) {
    return (
      <tr>
        <td colSpan={6} className="ann-log-cell">
          <span className="ann-log-loading-text">Loading send log...</span>
        </td>
      </tr>
    );
  }

  if (error) {
    return (
      <tr>
        <td colSpan={6} className="ann-log-cell">
          <span className="ann-log-error-text">{error}</span>
        </td>
      </tr>
    );
  }

  if (!recipients) { return null; }

  const cols = ['NAME', 'USERNAME', 'EMAIL'];
  if (sendEmail) { cols.push('EMAIL DELIVERY'); }
  if (sendNotification) { cols.push('NOTIFICATION'); }

  return (
    <tr>
      <td colSpan={6} className="ann-log-cell--border">
        <div className="ann-log-inner">
          <p className="ann-log-title">
            Send Log — {recipients.count} recipient{recipients.count !== 1 ? 's' : ''}
          </p>
          {recipients.count === 0 ? (
            <p className="ann-log-empty">No recipients recorded.</p>
          ) : (
            <div className="ann-log-scroll">
              <table className="ann-log-table">
                <thead>
                  <tr className="ann-log-thead-row">
                    {cols.map(col => (
                      <th key={col} className="ann-log-th">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recipients.results.map((r, idx) => (
                    <tr
                      key={r.id}
                      className={idx < recipients.results.length - 1 ? 'ann-log-tr' : 'ann-log-tr--last'}
                    >
                      <td className="ann-log-td ann-log-td--name">{r.full_name || '—'}</td>
                      <td className="ann-log-td ann-log-td--username">{r.username}</td>
                      <td className="ann-log-td ann-log-td--email">{r.email || '—'}</td>
                      {sendEmail && <td className="ann-log-td"><DeliveryBadge status={r.email_status} /></td>}
                      {sendNotification && <td className="ann-log-td"><DeliveryBadge status={r.notification_status} /></td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

RecipientsLog.propTypes = {
  announcementId: PropTypes.string.isRequired,
  sendEmail: PropTypes.bool.isRequired,
  sendNotification: PropTypes.bool.isRequired,
};

const COL_DEFS = [
  ['SUBJECT', undefined],
  ['SCOPE', '100px'],
  ['CHANNELS', '200px'],
  ['STATUS', '90px'],
  ['SENT AT', '160px'],
  ['ACTIONS', '100px'],
];

const AnnouncementsView = ({ sectionLabel }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const fetchAnnouncements = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const { data } = await listAnnouncements();
      let results = [];
      if (Array.isArray(data?.results)) { results = data.results; } else if (Array.isArray(data)) { results = data; }
      setAnnouncements(results);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Unable to load announcements.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchAnnouncements(); }, [fetchAnnouncements]);

  const handleDelete = async (id) => {
    if (confirmDeleteId !== id) { setConfirmDeleteId(id); return; }
    setConfirmDeleteId(null);
    setDeletingId(id);
    try {
      await deleteAnnouncement(id);
      setAnnouncements(prev => prev.filter(a => a.id !== id));
      if (expandedId === id) { setExpandedId(null); }
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to delete announcement.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreated = () => { setShowCreate(false); fetchAnnouncements(); };

  const toggleExpand = (id) => setExpandedId(prev => (prev === id ? null : id));

  return (
    <>
      <p className="ann-breadcrumb">
        <span>{sectionLabel}</span>
        <span className="ann-breadcrumb-sep">/</span>
        <span className="ann-breadcrumb-active">Announcements</span>
      </p>

      <div className="ann-view-header">
        <h1 className="ann-view-title">Announcements</h1>
        <Button variant="primary" size="sm" onClick={() => setShowCreate(true)} className="ann-create-btn">
          <FontAwesomeIcon icon={faPlus} className="ann-create-btn-icon" />
          Create Announcement
        </Button>
      </div>
      <p className="ann-view-desc">
        Send sitewide announcements via email, banner, or notification.
      </p>

      {error && <div className="ann-error-banner">{error}</div>}

      <div className="ann-table-wrap">
        <table className="ann-table">
          <thead>
            <tr className="ann-thead-row">
              {COL_DEFS.map(([label, width]) => (
                <th
                  key={label}
                  className={`ann-th${label === 'ACTIONS' ? ' ann-th--center' : ''}`}
                  style={width ? { width } : undefined}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={6} className="ann-td-empty">Loading announcements...</td></tr>
            )}
            {!isLoading && announcements.length === 0 && (
              <tr><td colSpan={6} className="ann-td-empty">No announcements yet.</td></tr>
            )}
            {!isLoading && announcements.map((item) => {
              const isExpanded = expandedId === item.id;
              const isSent = item.status === 'sent';
              const rowClass = [
                'ann-row',
                isExpanded ? 'ann-row--expanded' : '',
                isSent ? 'ann-row--clickable' : '',
              ].filter(Boolean).join(' ');
              return (
                <>
                  <tr
                    key={item.id}
                    className={rowClass}
                    onClick={() => isSent && toggleExpand(item.id)}
                  >
                    <td className="ann-td-subject">
                      {item.subject}
                      {isSent && (
                        <FontAwesomeIcon
                          icon={isExpanded ? faChevronUp : faChevronDown}
                          className="ann-td-subject-chevron"
                        />
                      )}
                    </td>
                    <td className="ann-td-scope">
                      {SCOPE_LABELS[item.scope] || item.scope}
                      {item.scope === 'program' && item.program_key && (
                        <div className="ann-scope-sub">{item.program_key}</div>
                      )}
                      {item.scope === 'course' && item.course_id && (
                        <div className="ann-scope-sub">{item.course_id}</div>
                      )}
                    </td>
                    <td className="ann-td"><ChannelTags item={item} /></td>
                    <td className="ann-td"><StatusBadge status={item.status} /></td>
                    <td className="ann-td-date">{formatDate(item.sent_at)}</td>
                    <td
                      className="ann-td-actions"
                      onClick={e => e.stopPropagation()}
                    >
                      {confirmDeleteId === item.id ? (
                        <Button
                          variant="tertiary"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="ann-confirm-btn"
                        >
                          Confirm?
                        </Button>
                      ) : (
                        <Button
                          variant="tertiary"
                          size="sm"
                          title="Delete"
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="ann-delete-btn"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </Button>
                      )}
                    </td>
                  </tr>
                  {isExpanded && (
                    <RecipientsLog
                      key={`log-${item.id}`}
                      announcementId={item.id}
                      sendEmail={item.send_email}
                      sendNotification={item.send_notification}
                    />
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <CreateAnnouncementModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />
      )}
    </>
  );
};

AnnouncementsView.propTypes = { sectionLabel: PropTypes.string };
AnnouncementsView.defaultProps = { sectionLabel: 'Communications' };

export default AnnouncementsView;
