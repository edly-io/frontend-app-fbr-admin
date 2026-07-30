import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { DataTable } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { UserIdentity } from '@edly-io/frontend-component-fbr';
import ReportStatusBadge from './ReportStatusBadge';
import {
  COLUMN_LABEL_MESSAGE_KEYS, REPORT_COLUMNS, ROWS_PER_PAGE, getBarTone, getNpsTone,
} from './constants';
import messages from './messages';

const TextCell = ({ value, column }) => (
  <span className={column.strong ? 'report-text-cell--strong' : undefined}>{value}</span>
);

TextCell.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  column: PropTypes.shape({ strong: PropTypes.bool }).isRequired,
};

const PersonCell = ({ value, column }) => (
  <UserIdentity
    name={value}
    badges={column.badge ? [column.badge] : []}
    size="default"
    showAvatar
    enableHoverCard
  />
);

PersonCell.propTypes = {
  value: PropTypes.string.isRequired,
  column: PropTypes.shape({ badge: PropTypes.string }).isRequired,
};

const NumCell = ({ value }) => <span>{value}</span>;

NumCell.propTypes = { value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired };

const BarCell = ({ value }) => {
  const numericValue = Number(value);
  const tone = getBarTone(numericValue);
  const width = Math.min(100, Math.max(0, numericValue));

  return (
    <div className="report-bar-cell d-flex align-items-center gap-2">
      <div className="report-bar-cell__track flex-grow-1 rounded-pill overflow-hidden">
        <div
          className={`report-bar-cell__fill report-bar-fill-${tone} rounded-pill`}
          style={{ width: `${width}%` }}
        />
      </div>
      <span className="report-bar-cell__value">{`${numericValue}%`}</span>
    </div>
  );
};

BarCell.propTypes = { value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired };

const BadgeCell = ({ value }) => <ReportStatusBadge status={value} />;

BadgeCell.propTypes = { value: PropTypes.string.isRequired };

const NpsCell = ({ value }) => {
  const tone = getNpsTone(Number(value));

  return (
    <span className={`report-tone-${tone} d-inline-block px-2 py-1 rounded-pill`}>
      {`NPS ${value}`}
    </span>
  );
};

NpsCell.propTypes = { value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired };

const CELL_RENDERERS = {
  text: TextCell,
  num: NumCell,
  bar: BarCell,
  badge: BadgeCell,
  nps: NpsCell,
  person: PersonCell,
};

/**
 * Paragon `DataTable` wrapper shared by every report type. Columns are built
 * from the `REPORT_COLUMNS` config for the given `reportId` - each entry's
 * `kind` picks the cell renderer (text/num/bar/badge/nps) and `strong` bolds
 * the primary identifying column, mirroring the source design's `buildCells`
 * templating helper.
 */
const ReportDataTable = ({ reportId, rows }) => {
  const intl = useIntl();

  const columns = useMemo(() => (REPORT_COLUMNS[reportId] || []).map(column => ({
    Header: intl.formatMessage(messages[COLUMN_LABEL_MESSAGE_KEYS[column.key]]),
    accessor: column.key,
    strong: column.strong,
    badge: column.badge,
    Cell: CELL_RENDERERS[column.kind],
  })), [reportId, intl]);

  return (
    <div className="report-data-table">
      <DataTable
        isSortable
        isPaginated
        initialState={{ pageSize: ROWS_PER_PAGE, pageIndex: 0 }}
        data={rows}
        itemCount={rows.length}
        columns={columns}
      >
        <DataTable.Table />
        <DataTable.EmptyTable content={intl.formatMessage(messages.emptyState)} />
        {rows.length > ROWS_PER_PAGE && <DataTable.TableFooter />}
      </DataTable>
    </div>
  );
};

ReportDataTable.propTypes = {
  reportId: PropTypes.string.isRequired,
  rows: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

export default ReportDataTable;
