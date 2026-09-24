/* eslint-disable react/prop-types */
/* eslint-disable react/no-unstable-nested-components */
import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow, Alert, Badge, Button, DataTable, Form, Icon, ModalDialog, Pagination, Spinner,
} from '@openedx/paragon';
import {
  Difference, History, InfoOutline, Search,
} from '@openedx/paragon/icons';
import UserIdentity from '../admin-console/components/UserIdentity';
import { useAuditLogs, useRecordHistory } from './auditLogApiHooks';
import './AuditLogTable.scss';

const ROLE_LABELS = {
  super_admin: 'Super Admin',
  middle_admin: 'Middle Admin',
  data_admin: 'Data Admin',
  instructor: 'Instructor',
  trainee: 'Trainee',
};

const PAGE_SIZE = 20;

const ACTION_VARIANT = {
  created: 'success',
  updated: 'primary',
  deleted: 'danger',
};

const ACTION_OPTIONS = [
  { value: '', label: 'All actions' },
  { value: '0', label: 'Created' },
  { value: '1', label: 'Updated' },
  { value: '2', label: 'Deleted' },
];

const MODEL_ACTION_LABELS = {
  fbrprofile: { created: 'Registered' },
  fbrprofilerole: { created: 'Role Assigned', deleted: 'Role Removed' },
  biodataeditrequest: { created: 'Submitted', updated: 'Resolved' },
};

// Filter dropdown options per model — shown when a single model is active.
const MODEL_FILTER_LABELS = {
  fbrprofile: { 0: 'Registered', 1: 'Updated', 2: 'Deleted' },
  biodataeditrequest: { 0: 'Submitted', 1: 'Resolved', 2: 'Deleted' },
};

// Filter dropdown options for known multi-model combinations (keyed by sorted, comma-joined model names).
const MULTI_MODEL_FILTER_LABELS = {
  'biodataeditrequest,fbrprofile,fbrprofilerole': { 0: 'Registered / Submitted', 1: 'Updated / Resolved', 2: 'Deleted / Removed' },
};

const getFilterOptions = (models) => {
  if (!models || models.length === 0) { return ACTION_OPTIONS; }
  if (models.length === 1 && MODEL_FILTER_LABELS[models[0]]) {
    const labels = MODEL_FILTER_LABELS[models[0]];
    return [
      { value: '', label: 'All actions' },
      { value: '0', label: labels[0] },
      { value: '1', label: labels[1] },
      { value: '2', label: labels[2] },
    ];
  }
  const multiKey = [...models].sort().join(',');
  const multiLabels = MULTI_MODEL_FILTER_LABELS[multiKey];
  if (multiLabels) {
    return [
      { value: '', label: 'All actions' },
      { value: '0', label: multiLabels[0] },
      { value: '1', label: multiLabels[1] },
      { value: '2', label: multiLabels[2] },
    ];
  }
  return ACTION_OPTIONS;
};

const getActionLabel = (action, recordType) => {
  const overrides = MODEL_ACTION_LABELS[recordType];
  return (overrides && overrides[action]) || action;
};

function groupLogs(logs, expandedBatches) {
  const rows = [];
  let i = 0;
  while (i < logs.length) {
    const entry = logs[i];
    const entryBatchId = entry.additional_data?.batch_id;
    let advanced = false;
    if (entryBatchId) {
      const batchEntries = [entry];
      let j = i + 1;
      while (j < logs.length && logs[j].additional_data?.batch_id === entryBatchId) {
        batchEntries.push(logs[j]);
        j++;
      }
      if (batchEntries.length > 1) {
        const first = batchEntries[0];
        rows.push({
          ...first,
          id: `batch-${entryBatchId}`,
          rowType: 'batch',
          batchId: entryBatchId,
          batchCount: batchEntries.length,
          batchEntries,
          action: 'batch',
        });
        if (expandedBatches.has(entryBatchId)) {
          batchEntries.forEach((e) => rows.push({ ...e, rowType: 'batch-child', batchId: entryBatchId }));
        }
        i = j;
        advanced = true;
      }
    }
    if (!advanced) {
      rows.push({ ...entry, rowType: 'entry' });
      i += 1;
    }
  }
  return rows;
}

const RECORD_TYPE_LABELS = {
  fbrprofile: 'User Profile',
  fbrprofilerole: 'User Role',
  instructorprofile: 'Instructor Profile',
  traineeprofile: 'Trainee Profile',
  biodataeditrequest: 'Edit Request',
  session: 'Session',
  sessioninstructor: 'Session Instructor',
  attendancerecord: 'Attendance Record',
  leaverequest: 'Leave Request',
  remotesessionrequest: 'Remote Session Request',
  substituterequest: 'Substitute Request',
  location: 'Location',
  publicholiday: 'Public Holiday',
};

// ─── Changes detail modal ─────────────────────────────────────────────────────

const ChangesModal = ({ entry, onClose }) => {
  const {
    changes, object_repr: repr, timestamp, actor_name: actorName, actor_email: actorEmail, action,
  } = entry;
  const date = new Date(timestamp);

  const changeRows = Object.entries(changes || {}).map(([field, [oldVal, newVal]]) => ({
    field, oldValue: String(oldVal ?? '—'), newValue: String(newVal ?? '—'),
  }));

  return (
    <ModalDialog
      isOpen
      onClose={onClose}
      title={`Change Details — ${repr}`}
      size="lg"
      hasCloseButton
      isFullscreenOnMobile
      className="audit-modal"
    >
      <ModalDialog.Header>
        <ModalDialog.Title>Change Details — {repr}</ModalDialog.Title>
        <small className="audit-modal__subtitle">
          {date.toLocaleString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
          })}
          {' · '}
          <Badge variant={ACTION_VARIANT[action] || 'light'}>{action}</Badge>
          {' · '}
          {actorName || 'System'}
          {actorEmail && ` (${actorEmail})`}
        </small>
      </ModalDialog.Header>

      <ModalDialog.Body>
        {changeRows.length === 0 ? (
          <p className="audit-modal__empty">No field-level diff recorded for this entry.</p>
        ) : (
          <div className="audit-log__table-scroll audit-log__table-scroll--narrow">
            <DataTable
              data={changeRows}
              itemCount={changeRows.length}
              columns={[
                { Header: 'Field', accessor: 'field', cellClassName: 'audit-modal__td--field' },
                { Header: 'Old value', accessor: 'oldValue', cellClassName: 'audit-modal__td--old' },
                { Header: 'New value', accessor: 'newValue', cellClassName: 'audit-modal__td--new' },
              ]}
            >
              <DataTable.Table />
            </DataTable>
          </div>
        )}
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <ActionRow>
          <Button variant="outline-primary" onClick={onClose}>Close</Button>
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

ChangesModal.propTypes = {
  entry: PropTypes.shape({
    changes: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.any)),
    object_repr: PropTypes.string,
    timestamp: PropTypes.string,
    actor_name: PropTypes.string,
    actor_email: PropTypes.string,
    action: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

// ─── Record history modal ─────────────────────────────────────────────────────

const RecordHistoryModal = ({
  appLabel, recordType, objectId, objectRepr, onClose,
}) => {
  const [page, setPage] = useState(1);
  const [changesEntry, setChangesEntry] = useState(null);

  const { data, isPending, error: queryError } = useRecordHistory({
    appLabel,
    models: recordType ? [recordType] : [],
    objectId,
    page,
    pageSize: PAGE_SIZE,
  });

  const logs = data?.results ?? [];
  const count = data?.count ?? 0;
  const loading = isPending;
  const error = queryError ? (queryError.message || 'Failed to load history.') : '';

  const pageCount = Math.ceil(count / PAGE_SIZE);

  return (
    <ModalDialog
      isOpen
      onClose={onClose}
      title="Full History"
      size="xl"
      hasCloseButton
      isFullscreenOnMobile
      className="audit-modal"
    >
      <ModalDialog.Header>
        <ModalDialog.Title>Full History</ModalDialog.Title>
        <small className="audit-modal__subtitle">{objectRepr}</small>
      </ModalDialog.Header>

      <ModalDialog.Body>

        {loading && (
          <div className="text-center py-4">
            <Spinner animation="border" screenReaderText="Loading history" />
          </div>
        )}
        {!loading && error && <Alert variant="danger">{error}</Alert>}
        {!loading && !error && (
          <>
            <div className="audit-log__table-scroll audit-log__table-scroll--narrow">
              <DataTable
                data={logs}
                itemCount={count}
                columns={[
                  {
                    Header: 'Timestamp',
                    id: 'timestamp',
                    Cell: ({ row }) => new Date(row.original.timestamp).toLocaleString('en-GB', {
                      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                    }),
                    cellClassName: 'audit-log__timestamp',
                  },
                  {
                    Header: 'Actor',
                    id: 'actor',
                    Cell: ({ row }) => (row.original.actor_name ? (
                      <>
                        <UserIdentity
                          name={row.original.actor_name}
                          badges={[ROLE_LABELS[row.original.actor_role] || '']}
                          size="compact"
                        />
                        {row.original.actor_email && (
                          <small className="audit-log__actor-email">{row.original.actor_email}</small>
                        )}
                      </>
                    ) : <span className="text-muted">System</span>),
                  },
                  {
                    Header: 'Action',
                    id: 'action',
                    Cell: ({ row }) => (
                      <Badge variant={ACTION_VARIANT[row.original.action] || 'light'}>
                        {row.original.action}
                      </Badge>
                    ),
                  },
                  {
                    Header: 'Fields changed',
                    id: 'fields',
                    Cell: ({ row }) => {
                      const fieldCount = row.original.changes
                        ? Object.keys(row.original.changes).length : 0;
                      if (fieldCount === 0) { return '—'; }
                      return (
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => setChangesEntry(row.original)}
                          className="audit-log__changes-btn"
                          iconBefore={Difference}
                        >
                          {fieldCount} field{fieldCount !== 1 ? 's' : ''} changed
                        </Button>
                      );
                    },
                  },
                ]}
              >
                <DataTable.Table />
                <DataTable.EmptyTable content="No history recorded yet." />
              </DataTable>
            </div>
            {pageCount > 1 && (
              <Pagination
                paginationLabel="History pagination"
                pageCount={pageCount}
                currentPage={page}
                onPageSelect={setPage}
                size="small"
                className="mt-3"
              />
            )}
          </>
        )}
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <ActionRow>
          <Button variant="outline-primary" onClick={onClose}>Close</Button>
        </ActionRow>
      </ModalDialog.Footer>

      {changesEntry && <ChangesModal entry={changesEntry} onClose={() => setChangesEntry(null)} />}
    </ModalDialog>
  );
};

RecordHistoryModal.propTypes = {
  appLabel: PropTypes.string.isRequired,
  recordType: PropTypes.string,
  objectId: PropTypes.string.isRequired,
  objectRepr: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};
RecordHistoryModal.defaultProps = { recordType: undefined };

// ─── Main table ───────────────────────────────────────────────────────────────

const AuditLogTable = ({
  appLabel, models, objectId, recordFilter, onClearFilter,
}) => {
  const [page, setPage] = useState(1);

  const [actionFilter, setActionFilter] = useState('');
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [changesModal, setChangesModal] = useState(null);
  const [historyModal, setHistoryModal] = useState(null);
  const [expandedBatches, setExpandedBatches] = useState(new Set());

  const hasActiveFilters = actionFilter !== '' || searchText !== '' || dateFrom !== '' || dateTo !== '' || !!recordFilter;
  const handleClearFilters = () => {
    setActionFilter('');
    setSearchText('');
    setDebouncedSearch('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
    onClearFilter?.();
  };

  const activeObjectId = objectId || recordFilter;

  const searchTimer = useRef(null);
  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(e.target.value);
      setPage(1);
    }, 400);
  };

  const handleActionChange = (e) => {
    setActionFilter(e.target.value);
    setPage(1);
  };

  const handleDateFromChange = (e) => {
    setDateFrom(e.target.value);
    setPage(1);
  };

  const handleDateToChange = (e) => {
    setDateTo(e.target.value);
    setPage(1);
  };

  const { data, isPending, error: queryError } = useAuditLogs({
    appLabel,
    models,
    objectId: activeObjectId,
    action: actionFilter || undefined,
    search: debouncedSearch || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  const logs = data?.results ?? [];
  const count = data?.count ?? 0;
  const displayRows = groupLogs(logs, expandedBatches);
  const loading = isPending;
  const error = queryError
    ? (queryError.response?.data?.detail || queryError.message || 'Failed to load audit log.')
    : '';

  const isPageLevel = !objectId;
  const pageCount = Math.ceil(count / PAGE_SIZE);

  const columns = [
    {
      Header: 'Timestamp',
      accessor: 'timestamp',
      Cell: ({ row }) => {
        const date = new Date(row.original.timestamp);
        return (
          <span className="audit-log__timestamp">
            {date.toLocaleString('en-GB', {
              day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
            })}
          </span>
        );
      },
    },
    {
      Header: 'Actor',
      accessor: 'actor_name',
      Cell: ({ row }) => {
        const { actor_name: name, actor_role: role } = row.original;
        if (!name) {
          return <span className="text-muted">System</span>;
        }
        return (
          <UserIdentity
            name={name}
            badges={[ROLE_LABELS[role] || '']}
            size="compact"
          />
        );
      },
    },
    {
      Header: 'Action',
      accessor: 'action',
      Cell: ({ row }) => {
        const {
          action, record_type: rt, rowType, batchId, batchCount,
        } = row.original;
        if (rowType === 'batch') {
          return (
            <Button
              variant="link"
              size="sm"
              onClick={() => setExpandedBatches((prev) => {
                const next = new Set(prev);
                if (next.has(batchId)) { next.delete(batchId); } else { next.add(batchId); }
                return next;
              })}
              className="audit-log__batch-toggle"
            >
              <Badge variant="light">{batchCount} entries</Badge>
              {' '}{expandedBatches.has(batchId) ? '▲' : '▼'}
            </Button>
          );
        }
        return (
          <Badge variant={ACTION_VARIANT[action] || 'light'}>
            {getActionLabel(action, rt)}
          </Badge>
        );
      },
    },
    ...(isPageLevel ? [{
      Header: 'Record Type',
      accessor: 'record_type',
      Cell: ({ row }) => {
        const { record_type: rt } = row.original;
        return (
          <span className="audit-log__record-type">
            {RECORD_TYPE_LABELS[rt] || rt || '—'}
          </span>
        );
      },
    }] : []),
    {
      Header: 'Record',
      accessor: 'object_repr',
      // The id and the history link were each on their own line, with the link's
      // icon stacked above its label - four lines per row for one record. They
      // are one meta line under the name now.
      Cell: ({ row }) => {
        const entry = row.original;
        if (entry.rowType === 'batch') {
          return (
            <div>
              <div className="audit-log__record-repr audit-log__batch-summary">
                {entry.batchCount} records created together
              </div>
            </div>
          );
        }
        const prefix = entry.rowType === 'batch-child' ? '↳ ' : '';
        return (
          <div className={entry.rowType === 'batch-child' ? 'audit-log__record audit-log__record--child' : 'audit-log__record'}>
            <div className="audit-log__record-repr">{prefix}{entry.object_repr || '—'}</div>
            <div className="audit-log__record-meta">
              {entry.object_pk && (
                <span className="audit-log__record-id">ID: {entry.object_pk}</span>
              )}
              {entry.rowType !== 'batch-child' && (
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => setHistoryModal(entry)}
                  className="audit-log__history-btn"
                  iconBefore={History}
                  aria-label={`Full history for ${entry.object_repr || `record ${entry.object_pk}`}`}
                >
                  Full history
                </Button>
              )}
            </div>
          </div>
        );
      },
    },
    {
      Header: 'Changes',
      accessor: 'changes',
      disableSortBy: true,
      // A row says *what* changed; the before/after values live one click away in
      // the detail modal. Dumping three raw `field: old -> new` lines per row
      // made the listing a wall of text that was hard to scan and repeated what
      // the modal already shows properly.
      Cell: ({ row }) => {
        const { changes } = row.original;
        const fields = changes ? Object.keys(changes) : [];
        if (fields.length === 0) {
          return <span className="text-muted audit-log__record-type">—</span>;
        }
        return (
          <div className="audit-log__changes">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => setChangesModal(row.original)}
              className="audit-log__changes-btn"
              iconBefore={Difference}
              aria-label={`${fields.length} field${fields.length !== 1 ? 's' : ''} changed`
                + `, view details for ${row.original.object_repr || 'this record'}`}
            >
              {fields.length} field{fields.length !== 1 ? 's' : ''} changed
            </Button>
            <span className="audit-log__changes-fields">
              {fields.slice(0, 3).join(', ')}
              {fields.length > 3 ? ` +${fields.length - 3} more` : ''}
            </span>
          </div>
        );
      },
    },
  ];

  return (
    <div className="audit-log">
      {recordFilter && (
        <Alert
          variant="info"
          icon={InfoOutline}
          className="audit-log__filter-banner"
          actions={onClearFilter ? [
            <Button onClick={onClearFilter}>Show all records</Button>,
          ] : undefined}
        >
          Showing full history for record <strong>#{recordFilter}</strong>
        </Alert>
      )}

      <div className="audit-log__filters">
        <div className="audit-log__search">
          <Form.Control
            type="text"
            value={searchText}
            onChange={handleSearchChange}
            placeholder="Search by record name…"
            leadingElement={<Icon src={Search} className="text-gray-500" />}
            aria-label="Search by record name"
          />
        </div>
        <div className="audit-log__action">
          <Form.Control
            as="select"
            value={actionFilter}
            onChange={handleActionChange}
            aria-label="Filter by action"
          >
            {getFilterOptions(models).map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Form.Control>
        </div>
        <div className="audit-log__date-range">
          <div className="audit-log__date-field">
            <Form.Label htmlFor="audit-date-from-admin" className="audit-log__date-label">From</Form.Label>
            <Form.Control
              id="audit-date-from-admin"
              type="date"
              value={dateFrom}
              onChange={handleDateFromChange}
              className="audit-log__date-input"
            />
          </div>
          <div className="audit-log__date-field">
            <Form.Label htmlFor="audit-date-to-admin" className="audit-log__date-label">To</Form.Label>
            <Form.Control
              id="audit-date-to-admin"
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={handleDateToChange}
              className="audit-log__date-input"
            />
          </div>
        </div>
        <span className="audit-log__count">
          {count} result{count !== 1 ? 's' : ''}
        </span>
        {hasActiveFilters && (
          <Button
            variant="tertiary"
            size="sm"
            onClick={handleClearFilters}
            className="audit-log__clear-btn"
          >
            Clear filters
          </Button>
        )}
      </div>

      {loading && (
        <div className="text-center py-4">
          <Spinner animation="border" screenReaderText="Loading audit log" />
        </div>
      )}
      {!loading && error && <Alert variant="danger">{error}</Alert>}
      {!loading && !error && (
        <>
          <div className="audit-log__table-scroll">
            <DataTable isSortable data={displayRows} columns={columns} itemCount={count}>
              <DataTable.Table />
              <DataTable.EmptyTable content="No activity recorded yet." />
            </DataTable>
          </div>
          {pageCount > 1 && (
            <Pagination
              paginationLabel="Audit log pagination"
              pageCount={pageCount}
              currentPage={page}
              onPageSelect={setPage}
              size="small"
              className="mt-3"
            />
          )}
        </>
      )}

      {changesModal && (
        <ChangesModal entry={changesModal} onClose={() => setChangesModal(null)} />
      )}
      {historyModal && (
        <RecordHistoryModal
          appLabel={appLabel}
          recordType={historyModal.record_type}
          objectId={String(historyModal.object_pk)}
          objectRepr={historyModal.object_repr || ''}
          onClose={() => setHistoryModal(null)}
        />
      )}
    </div>
  );
};

AuditLogTable.propTypes = {
  appLabel: PropTypes.string.isRequired,
  models: PropTypes.arrayOf(PropTypes.string),
  objectId: PropTypes.string,
  recordFilter: PropTypes.string,
  onClearFilter: PropTypes.func,
};

AuditLogTable.defaultProps = {
  models: [],
  objectId: undefined,
  recordFilter: undefined,
  onClearFilter: undefined,
};

export default AuditLogTable;
