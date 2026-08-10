import React, {
  useCallback, useMemo, useState,
} from 'react';
import PropTypes from 'prop-types';
import {
  DataTable, IconButton, IconButtonWithTooltip, OverlayTrigger, Pagination, Tooltip,
} from '@openedx/paragon';
import { InfoOutline, Visibility } from '@openedx/paragon/icons';
import { UserIdentity } from '@edly-io/frontend-component-fbr';
import { useIntl } from '@edx/frontend-platform/i18n';
import SessionDetailsSheet from './SessionDetailsSheet';
import {
  COLUMN_LABEL_MESSAGE_KEYS, COLUMN_TOOLTIP_MESSAGE_KEYS, DEFAULT_SEGMENT_CLASS,
  SESSION_TYPE_SEGMENT_CLASSES, SESSIONS_INSTRUCTOR_COLUMNS,
} from './constants';
import messages from './messages';

const ColumnHeaderWithTooltip = ({ label, tooltipText, tooltipAlt }) => (
  <span className="report-column-header d-inline-flex align-items-center gap-1">
    {label}
    <IconButtonWithTooltip
      src={InfoOutline}
      size="inline"
      alt={tooltipAlt}
      tooltipPlacement="top"
      tooltipContent={tooltipText}
      className="report-column-header__info-icon"
      onClick={(event) => event.stopPropagation()}
    />
  </span>
);

ColumnHeaderWithTooltip.propTypes = {
  label: PropTypes.string.isRequired,
  tooltipText: PropTypes.string.isRequired,
  tooltipAlt: PropTypes.string.isRequired,
};

// Paragon's TableRow keys body cells with `${cell.column.Header}${rowId}`.
// Every React element stringifies to the same "[object Object]" literal, so
// two JSX-element Headers collide on every row. Wrapping the element in a
// plain function component (functions aren't frozen, so we can override
// toString) gives each column header a unique string while still rendering
// the original element correctly.
const makeHeaderRenderer = (element, uniqueId) => {
  const HeaderRenderer = () => element;
  HeaderRenderer.toString = () => uniqueId;
  return HeaderRenderer;
};

const TextCell = ({ value, column }) => (
  <span className={column.strong ? 'report-text-cell--strong' : undefined}>{value}</span>
);

TextCell.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  column: PropTypes.shape({ strong: PropTypes.bool }).isRequired,
};

const NumCell = ({ value }) => <span>{value}</span>;

NumCell.propTypes = { value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired };

const InstructorCell = ({ row }) => (
  <UserIdentity
    name={row.original.instructor}
    badges={['Instructor']}
    size="compact"
    avatarValue={row.original.avatarValue}
    showAvatar
  />
);

InstructorCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      instructor: PropTypes.string,
      avatarValue: PropTypes.string,
    }).isRequired,
  }).isRequired,
};

const SessionCountCell = ({ row, column }) => {
  const intl = useIntl();
  const count = row.original.sessions || 0;

  return (
    <span className="report-people-count d-inline-flex align-items-center gap-2">
      <IconButton
        src={Visibility}
        size="inline"
        alt={intl.formatMessage(messages.sessionCountAria, {
          count,
          instructor: row.original.instructor,
        })}
        className="report-count-btn"
        onClick={() => column.onOpenSheet(row.original)}
      />
      <span className="report-people-count__value">({count})</span>
    </span>
  );
};

SessionCountCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      instructor: PropTypes.string,
      sessions: PropTypes.number,
    }).isRequired,
  }).isRequired,
  column: PropTypes.shape({
    onOpenSheet: PropTypes.func,
  }).isRequired,
};

const HoursBreakdownCell = ({ row }) => {
  const { id, hoursByType, hours } = row.original;
  const total = hours || 1;
  const tooltipText = hoursByType
    .map(segment => `${segment.label}: ${segment.hours}h`)
    .join(' · ');

  return (
    <OverlayTrigger
      trigger={['hover', 'focus']}
      placement="top"
      overlay={(
        <Tooltip id={`hours-breakdown-tooltip-${id}`}>
          {tooltipText}
        </Tooltip>
      )}
    >
      <div
        className="report-hours-bar"
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        role="img"
        aria-label={tooltipText}
      >
        <div className="report-hours-bar__track d-flex">
          {hoursByType.map(segment => (
            <span
              key={segment.sessionType}
              className={`report-hours-bar__segment ${SESSION_TYPE_SEGMENT_CLASSES[segment.sessionType] || DEFAULT_SEGMENT_CLASS}`}
              style={{ width: `${(segment.hours / total) * 100}%` }}
            />
          ))}
        </div>
      </div>
    </OverlayTrigger>
  );
};

HoursBreakdownCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.string,
      hours: PropTypes.number,
      hoursByType: PropTypes.arrayOf(PropTypes.shape({
        sessionType: PropTypes.string,
        label: PropTypes.string,
        hours: PropTypes.number,
      })),
    }).isRequired,
  }).isRequired,
};

const CELL_RENDERERS = {
  text: TextCell,
  num: NumCell,
  instructor: InstructorCell,
  sessionCount: SessionCountCell,
  hoursBar: HoursBreakdownCell,
};

const HoursBreakdownLegend = ({ segments }) => {
  if (!segments.length) { return null; }

  return (
    <div className="report-hours-legend d-flex flex-wrap gap-3 mb-2">
      {segments.map(segment => (
        <span key={segment.sessionType} className="report-hours-legend__item d-inline-flex align-items-center gap-1">
          <span
            className={`report-hours-legend__swatch ${SESSION_TYPE_SEGMENT_CLASSES[segment.sessionType] || DEFAULT_SEGMENT_CLASS}`}
          />
          {segment.label}
        </span>
      ))}
    </div>
  );
};

HoursBreakdownLegend.propTypes = {
  segments: PropTypes.arrayOf(PropTypes.shape({
    sessionType: PropTypes.string,
    label: PropTypes.string,
  })).isRequired,
};

const ReportDataTable = ({
  rows, count, pageSize, page, onPageChange, isLoading,
}) => {
  const intl = useIntl();
  const [sheet, setSheet] = useState({ show: false, row: null });

  const pageCount = Math.max(1, Math.ceil(count / pageSize));
  const firstRow = rows.length ? (page - 1) * pageSize + 1 : 0;
  const lastRow = firstRow + rows.length - 1;

  const legendSegments = useMemo(() => {
    const seen = new Map();
    rows.forEach(row => {
      (row.hoursByType || []).forEach(segment => {
        if (!seen.has(segment.sessionType)) { seen.set(segment.sessionType, segment); }
      });
    });
    return Array.from(seen.values());
  }, [rows]);

  const openSheet = useCallback((row) => {
    setSheet({ show: true, row });
  }, []);

  const closeSheet = useCallback(() => {
    setSheet(previous => ({ ...previous, show: false }));
  }, []);

  const columns = useMemo(() => SESSIONS_INSTRUCTOR_COLUMNS.map(column => {
    const label = intl.formatMessage(messages[COLUMN_LABEL_MESSAGE_KEYS[column.key]]);
    const tooltipKey = COLUMN_TOOLTIP_MESSAGE_KEYS[column.key];

    return {
      Header: tooltipKey ? makeHeaderRenderer(
        <ColumnHeaderWithTooltip
          label={label}
          tooltipText={intl.formatMessage(messages[tooltipKey])}
          tooltipAlt={intl.formatMessage(messages[`${tooltipKey}Alt`])}
        />,
        column.key,
      ) : label,
      id: column.key,
      accessor: column.key,
      strong: column.strong,
      onOpenSheet: column.kind === 'sessionCount' ? openSheet : undefined,
      Cell: CELL_RENDERERS[column.kind],
      // The stepped hours bar has nothing meaningful to sort by.
      disableSortBy: column.kind === 'hoursBar',
    };
  }), [intl, openSheet]);

  return (
    <div className="report-data-table">
      <HoursBreakdownLegend segments={legendSegments} />

      <DataTable
        isSortable
        isLoading={isLoading}
        data={rows}
        columns={columns}
      >
        <DataTable.Table />
        <DataTable.EmptyTable content={intl.formatMessage(messages.emptyState)} />
      </DataTable>

      {rows.length > 0 && (
        <div className="report-data-table__footer d-flex flex-wrap align-items-center justify-content-between gap-2 mt-2">
          <span className="small text-muted" data-testid="row-status">
            {intl.formatMessage(messages.rowStatus, { firstRow, lastRow, itemCount: count })}
          </span>
          {pageCount > 1 && (
            <Pagination
              paginationLabel={intl.formatMessage(messages.paginationLabel)}
              pageCount={pageCount}
              currentPage={page}
              className="mx-auto"
              size="small"
              variant="secondary"
              onPageSelect={onPageChange}
            />
          )}
        </div>
      )}

      {sheet.row && (
        <SessionDetailsSheet
          show={sheet.show}
          instructor={sheet.row.instructor}
          program={sheet.row.program}
          instructorId={sheet.row.instructorId}
          programKey={sheet.row.programKey}
          onClose={closeSheet}
        />
      )}
    </div>
  );
};

ReportDataTable.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  count: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  page: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

ReportDataTable.defaultProps = {
  isLoading: false,
};

export default ReportDataTable;
