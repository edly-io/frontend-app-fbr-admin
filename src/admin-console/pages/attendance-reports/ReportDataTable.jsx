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
import AttendanceDetailsSheet from './AttendanceDetailsSheet';
import {
  ATTENDANCE_BREAKDOWN_SEGMENTS, ATTENDANCE_COLUMNS, COLUMN_LABEL_MESSAGE_KEYS,
  COLUMN_TOOLTIP_MESSAGE_KEYS, getAttendanceBreakdownSegmentClass,
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

const LearnerCell = ({ row }) => (
  <UserIdentity
    name={row.original.learner}
    badges={['Trainee']}
    size="compact"
    avatarValue={row.original.avatarValue}
    showAvatar
  />
);

LearnerCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      learner: PropTypes.string,
      avatarValue: PropTypes.string,
    }).isRequired,
  }).isRequired,
};

const AttendanceRatioCell = ({ row, column }) => {
  const intl = useIntl();
  const { attended, totalSessions, learner } = row.original;
  const count = attended || 0;

  return (
    <span className="report-people-count d-inline-flex align-items-center gap-2">
      <IconButton
        src={Visibility}
        size="inline"
        alt={intl.formatMessage(messages.attendanceCountAria, { count, learner })}
        className="report-count-btn"
        onClick={() => column.onOpenSheet(row.original)}
      />
      <span className="report-people-count__value">{attended || 0} / {totalSessions || 0}</span>
    </span>
  );
};

AttendanceRatioCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      learner: PropTypes.string,
      attended: PropTypes.number,
      totalSessions: PropTypes.number,
    }).isRequired,
  }).isRequired,
  column: PropTypes.shape({
    onOpenSheet: PropTypes.func,
  }).isRequired,
};

const AttendanceRateCell = ({ row }) => {
  const { attendancePercentage } = row.original;
  const pct = Math.round(attendancePercentage || 0);

  return <span className="report-attendance-rate__value">{pct}%</span>;
};

AttendanceRateCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      attendancePercentage: PropTypes.number,
    }).isRequired,
  }).isRequired,
};

const AttendanceBreakdownCell = ({ row }) => {
  const intl = useIntl();
  const { id, breakdown } = row.original;
  const total = ATTENDANCE_BREAKDOWN_SEGMENTS
    .reduce((sum, segment) => sum + (breakdown[segment.key] || 0), 0) || 1;
  const tooltipText = ATTENDANCE_BREAKDOWN_SEGMENTS
    .map(segment => `${intl.formatMessage(messages[segment.labelKey])}: ${breakdown[segment.key] || 0}`)
    .join(' · ');

  return (
    <OverlayTrigger
      trigger={['hover', 'focus']}
      placement="top"
      overlay={(
        <Tooltip id={`attendance-breakdown-tooltip-${id}`}>
          {tooltipText}
        </Tooltip>
      )}
    >
      <div
        className="report-attendance-breakdown-bar"
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        role="img"
        aria-label={tooltipText}
      >
        <div className="report-attendance-breakdown-bar__track d-flex">
          {ATTENDANCE_BREAKDOWN_SEGMENTS.map(segment => (
            <span
              key={segment.key}
              className={`report-attendance-breakdown-bar__segment ${getAttendanceBreakdownSegmentClass(segment.key)}`}
              style={{ width: `${((breakdown[segment.key] || 0) / total) * 100}%` }}
            />
          ))}
        </div>
      </div>
    </OverlayTrigger>
  );
};

AttendanceBreakdownCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.string,
      breakdown: PropTypes.shape({
        present: PropTypes.number,
        absent: PropTypes.number,
        leave: PropTypes.number,
        pending: PropTypes.number,
      }),
    }).isRequired,
  }).isRequired,
};

const CELL_RENDERERS = {
  text: TextCell,
  learner: LearnerCell,
  attendanceRatio: AttendanceRatioCell,
  attendanceRate: AttendanceRateCell,
  attendanceBreakdownBar: AttendanceBreakdownCell,
};

const AttendanceBreakdownLegend = () => {
  const intl = useIntl();

  return (
    <div className="report-attendance-breakdown-legend d-flex flex-wrap gap-3 mb-2">
      {ATTENDANCE_BREAKDOWN_SEGMENTS.map(segment => (
        <span key={segment.key} className="report-attendance-breakdown-legend__item d-inline-flex align-items-center gap-1">
          <span className={`report-attendance-breakdown-legend__swatch ${getAttendanceBreakdownSegmentClass(segment.key)}`} />
          {intl.formatMessage(messages[segment.labelKey])}
        </span>
      ))}
    </div>
  );
};

const ReportDataTable = ({
  rows, count, pageSize, page, onPageChange, isLoading,
}) => {
  const intl = useIntl();
  const [sheet, setSheet] = useState({ show: false, row: null });

  const pageCount = Math.max(1, Math.ceil(count / pageSize));
  const firstRow = rows.length ? (page - 1) * pageSize + 1 : 0;
  const lastRow = firstRow + rows.length - 1;

  const openSheet = useCallback((row) => {
    setSheet({ show: true, row });
  }, []);

  const closeSheet = useCallback(() => {
    setSheet(previous => ({ ...previous, show: false }));
  }, []);

  const columns = useMemo(() => ATTENDANCE_COLUMNS.map(column => {
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
      onOpenSheet: column.kind === 'attendanceRatio' ? openSheet : undefined,
      Cell: CELL_RENDERERS[column.kind],
      // The stepped breakdown bar has nothing meaningful to sort by.
      disableSortBy: column.kind === 'attendanceBreakdownBar',
    };
  }), [intl, openSheet]);

  return (
    <div className="report-data-table">
      <AttendanceBreakdownLegend />

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
        <AttendanceDetailsSheet
          show={sheet.show}
          learner={sheet.row.learner}
          program={sheet.row.program}
          learnerId={sheet.row.learnerId}
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
