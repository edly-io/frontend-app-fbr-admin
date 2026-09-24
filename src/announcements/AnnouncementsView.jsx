import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';
import {
  Button, DataTable, Form, Icon, IconButton, OverlayTrigger, Tooltip,
} from '@openedx/paragon';
import { Edit as EditIcon, Visibility } from '@openedx/paragon/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus, faChevronDown, faChevronUp,
} from '@fortawesome/free-solid-svg-icons';
import { listAnnouncements, getAnnouncementRecipients } from './api';
import CreateAnnouncementModal from './CreateAnnouncementModal';
import ViewAnnouncementModal from './ViewAnnouncementModal';
import EditBannerExpiryModal from './EditBannerExpiryModal';
import UserIdentity from '../admin-console/components/UserIdentity';
import './AnnouncementsView.css';

const CHANNEL_LABELS = { send_email: 'Email', send_banner: 'Banner', send_notification: 'Notification' };
const CHANNELS = Object.keys(CHANNEL_LABELS);
const SCOPE_LABELS = { sitewide: 'Sitewide', program: 'Program', course: 'Course' };

const ROLE_DISPLAY = {
  super_admin: 'Super Admin',
  middle_admin: 'Middle Admin',
  data_admin: 'Data Admin',
  instructor: 'Instructor',
  trainee: 'Trainee',
};

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

const BANNER_STATUS_META = {
  active: { label: 'Banner Active', cls: 'ann-banner-status--active' },
  expired: { label: 'Banner Expired', cls: 'ann-banner-status--expired' },
};

const BannerStatusBadge = ({ bannerStatus }) => {
  const meta = BANNER_STATUS_META[bannerStatus];
  if (!meta) { return null; }
  return <span className={`ann-banner-status ${meta.cls}`}>{meta.label}</span>;
};
BannerStatusBadge.propTypes = { bannerStatus: PropTypes.string };
BannerStatusBadge.defaultProps = { bannerStatus: null };

const FILTER_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'banner_active', label: 'Banner Active' },
  { value: 'banner_expired', label: 'Banner Expired' },
];

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
      <div className="ann-log-cell">
        <span className="ann-log-loading-text">Loading send log...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ann-log-cell">
        <span className="ann-log-error-text">{error}</span>
      </div>
    );
  }

  if (!recipients) { return null; }

  const cols = ['NAME', 'USERNAME', 'EMAIL'];
  if (sendEmail) { cols.push('EMAIL DELIVERY'); }
  if (sendNotification) { cols.push('NOTIFICATION'); }

  return (
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
  );
};

RecipientsLog.propTypes = {
  announcementId: PropTypes.string.isRequired,
  sendEmail: PropTypes.bool.isRequired,
  sendNotification: PropTypes.bool.isRequired,
};

// Cells reproduce the markup the hand-written table used, so the rows read as
// before. Only a sent announcement has a send log, so only a sent row offers
// the expand affordance; Paragon holds the open/closed state through
// `row.getToggleRowExpandedProps()`. They sit at module scope so react-table
// keeps the same component type across renders and updates each cell rather
// than remounting it, which would close an open tooltip in the actions column.
const SubjectCell = ({ row }) => {
  const item = row.original;
  if (item.status !== 'sent') {
    return <span className="ann-td-subject">{item.subject}</span>;
  }
  const { onClick, ...toggleProps } = row.getToggleRowExpandedProps();
  return (
    <button
      type="button"
      className="ann-td-subject ann-td-subject--toggle"
      onClick={onClick}
      aria-expanded={row.isExpanded}
      {...toggleProps}
    >
      {item.subject}
      <FontAwesomeIcon
        icon={row.isExpanded ? faChevronUp : faChevronDown}
        className="ann-td-subject-chevron"
      />
    </button>
  );
};

const ScopeCell = ({ row }) => {
  const item = row.original;
  return (
    <>
      {SCOPE_LABELS[item.scope] || item.scope}
      {item.scope === 'program' && item.program_key && (
        <div className="ann-scope-sub">{item.program_key}</div>
      )}
      {item.scope === 'course' && item.course_id && (
        <div className="ann-scope-sub">{item.course_id}</div>
      )}
    </>
  );
};

const ChannelsCell = ({ row }) => {
  const item = row.original;
  return (
    <>
      <ChannelTags item={item} />
      {item.banner_status && (
        <div className="ann-banner-status-row">
          <BannerStatusBadge bannerStatus={item.banner_status} />
          {item.banner_expires_at && (
            <span className="ann-banner-expiry">
              {item.banner_status === 'expired' ? 'Expired' : 'Expires'}{' '}
              {new Date(item.banner_expires_at).toLocaleDateString()}
            </span>
          )}
        </div>
      )}
    </>
  );
};

const CreatedByCell = ({ row }) => (row.original.sent_by_name ? (
  <UserIdentity
    name={row.original.sent_by_name}
    badges={[ROLE_DISPLAY[row.original.sent_by_role]].filter(Boolean)}
    size="compact"
    showAvatar
  />
) : '—');

const ActionsCell = ({ row, column }) => {
  const item = row.original;
  const { onView, onEditExpiry } = column.actions;
  return (
    <div className="ann-action-group d-flex align-items-center justify-content-center">
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip id={`tooltip-view-${item.id}`}>View details</Tooltip>}
      >
        <IconButton
          src={Visibility}
          iconAs={Icon}
          size="sm"
          alt="View announcement details"
          onClick={() => onView(item)}
        />
      </OverlayTrigger>
      {item.send_banner && item.status === 'sent' && (
        item.banner_status === 'expired' ? (
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip id={`tooltip-expired-${item.id}`}>Banner has expired and cannot be modified</Tooltip>}
          >
            {/* A disabled control emits no pointer events, so the tooltip needs
                a wrapper that still does. */}
            <span>
              <IconButton
                src={EditIcon}
                iconAs={Icon}
                size="sm"
                alt="Banner expired"
                disabled
              />
            </span>
          </OverlayTrigger>
        ) : (
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip id={`tooltip-edit-${item.id}`}>Edit banner expiry</Tooltip>}
          >
            <IconButton
              src={EditIcon}
              iconAs={Icon}
              size="sm"
              alt="Edit banner expiry date"
              onClick={() => onEditExpiry(item)}
            />
          </OverlayTrigger>
        )
      )}
    </div>
  );
};
const StatusCell = ({ row }) => <StatusBadge status={row.original.status} />;

const SentAtCell = ({ row }) => formatDate(row.original.sent_at);

const RecipientsSubRow = ({ row }) => (
  <RecipientsLog
    announcementId={row.original.id}
    sendEmail={!!row.original.send_email}
    sendNotification={!!row.original.send_notification}
  />
);

const announcementShape = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  subject: PropTypes.string,
  status: PropTypes.string,
  scope: PropTypes.string,
  program_key: PropTypes.string,
  course_id: PropTypes.string,
  banner_status: PropTypes.string,
  banner_expires_at: PropTypes.string,
  sent_at: PropTypes.string,
  sent_by_name: PropTypes.string,
  sent_by_role: PropTypes.string,
  send_banner: PropTypes.bool,
  send_email: PropTypes.bool,
  send_notification: PropTypes.bool,
});

const rowOf = PropTypes.shape({ original: announcementShape.isRequired }).isRequired;

SubjectCell.propTypes = {
  row: PropTypes.shape({
    original: announcementShape.isRequired,
    isExpanded: PropTypes.bool,
    getToggleRowExpandedProps: PropTypes.func.isRequired,
  }).isRequired,
};
ScopeCell.propTypes = { row: rowOf };
ChannelsCell.propTypes = { row: rowOf };
CreatedByCell.propTypes = { row: rowOf };
StatusCell.propTypes = { row: rowOf };
SentAtCell.propTypes = { row: rowOf };
RecipientsSubRow.propTypes = { row: rowOf };
ActionsCell.propTypes = {
  row: rowOf,
  column: PropTypes.shape({
    actions: PropTypes.shape({
      onView: PropTypes.func.isRequired,
      onEditExpiry: PropTypes.func.isRequired,
    }).isRequired,
  }).isRequired,
};

const AnnouncementsView = ({ sectionLabel }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [editExpiryItem, setEditExpiryItem] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const searchTimerRef = useRef(null);

  const fetchAnnouncements = useCallback(async (searchVal, filterVal) => {
    setIsLoading(true);
    setError('');
    try {
      const { data } = await listAnnouncements({ search: searchVal, filter: filterVal });
      let results = [];
      if (Array.isArray(data?.results)) { results = data.results; } else if (Array.isArray(data)) { results = data; }
      setAnnouncements(results);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Unable to load announcements.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchAnnouncements(search, filter); }, [fetchAnnouncements, filter]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => fetchAnnouncements(val, filter), 350);
  };

  const handleCreated = () => { setShowCreate(false); fetchAnnouncements(search, filter); };

  // The widths the old `th`s carried inline now travel with the column.
  const columns = [
    { Header: 'SUBJECT', accessor: 'subject', Cell: SubjectCell },
    {
      Header: 'SCOPE', id: 'scope', Cell: ScopeCell, cellClassName: 'ann-col--scope ann-td-scope', headerClassName: 'ann-col--scope',
    },
    {
      Header: 'CHANNELS', id: 'channels', Cell: ChannelsCell, cellClassName: 'ann-col--channels', headerClassName: 'ann-col--channels',
    },
    {
      Header: 'STATUS',
      id: 'status',
      Cell: StatusCell,
      cellClassName: 'ann-col--status',
      headerClassName: 'ann-col--status',
    },
    {
      Header: 'SENT AT',
      id: 'sent_at',
      Cell: SentAtCell,
      cellClassName: 'ann-col--sent ann-td-date',
      headerClassName: 'ann-col--sent',
    },
    {
      Header: 'CREATED BY', id: 'created_by', Cell: CreatedByCell, cellClassName: 'ann-col--creator', headerClassName: 'ann-col--creator',
    },
    {
      Header: 'ACTIONS',
      id: 'actions',
      Cell: ActionsCell,
      actions: { onView: setViewItem, onEditExpiry: setEditExpiryItem },
      cellClassName: 'ann-col--actions',
      headerClassName: 'ann-col--actions ann-th--center',
    },
  ];

  return (
    <>
      <p className="ann-breadcrumb">
        <span>{sectionLabel}</span>
        <span className="ann-breadcrumb-sep">/</span>
        <span className="ann-breadcrumb-active">Announcements</span>
      </p>

      <div className="ann-view-header d-flex flex-column flex-md-row align-items-start justify-content-md-between">
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

      <div className="ann-toolbar">
        <Form.Control
          type="search"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search by subject…"
          className="ann-search-input"
        />
        <div className="ann-filter-pills">
          {FILTER_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              className={`ann-filter-pill${filter === opt.value ? ' ann-filter-pill--active' : ''}`}
              onClick={() => setFilter(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="ann-table-wrap">
        <DataTable
          isExpandable
          isLoading={isLoading}
          data={announcements}
          itemCount={announcements.length}
          columns={columns}
          renderRowSubComponent={RecipientsSubRow}
        >
          <DataTable.Table />
          <DataTable.EmptyTable content="No announcements yet." />
        </DataTable>
      </div>

      {showCreate && (
        <CreateAnnouncementModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />
      )}
      {viewItem && (
        <ViewAnnouncementModal item={viewItem} onClose={() => setViewItem(null)} />
      )}
      {editExpiryItem && (
        <EditBannerExpiryModal
          item={editExpiryItem}
          onClose={() => setEditExpiryItem(null)}
          onSaved={() => { setEditExpiryItem(null); fetchAnnouncements(search, filter); }}
        />
      )}
    </>
  );
};

AnnouncementsView.propTypes = { sectionLabel: PropTypes.string };
AnnouncementsView.defaultProps = { sectionLabel: 'Communications' };

export default AnnouncementsView;
