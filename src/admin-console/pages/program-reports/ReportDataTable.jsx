import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Badge, Button, DataTable, IconButtonWithTooltip,
} from '@openedx/paragon';
import { InfoOutline } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import PeopleSheet from './PeopleSheet';
import {
  COLUMN_LABEL_MESSAGE_KEYS, COLUMN_TOOLTIP_MESSAGE_KEYS, PEOPLE_SHEET_CONFIG, PROGRAM_COLUMNS,
  ROWS_PER_PAGE, STATUS_LABEL_MESSAGE_KEYS, getStatusVariant,
} from './constants';
import messages from './messages';

/**
 * Column header label with an info icon + tooltip, used for headers that
 * need extra explanation (e.g. "Completed" - finalized in the Add Trainees
 * Results tab). `IconButtonWithTooltip` renders a real, natively focusable
 * `<button>` (with its own accessible name via `alt`) wrapped in the same
 * hover/focus `OverlayTrigger` Paragon uses elsewhere, so no manual
 * `tabIndex` is needed. `stopPropagation` keeps a click meant for the
 * tooltip from also toggling the column's sort order.
 */
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

const TextCell = ({ value, column }) => (
  <span className={column.strong ? 'report-text-cell--strong' : undefined}>{value}</span>
);

TextCell.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  column: PropTypes.shape({ strong: PropTypes.bool }).isRequired,
};

const NumCell = ({ value }) => <span>{value}</span>;

NumCell.propTypes = { value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired };

const StatusCell = ({ value }) => {
  const intl = useIntl();
  const labelKey = STATUS_LABEL_MESSAGE_KEYS[value];

  return (
    <Badge variant={getStatusVariant(value)}>
      {labelKey ? intl.formatMessage(messages[labelKey]) : value}
    </Badge>
  );
};

StatusCell.propTypes = { value: PropTypes.string.isRequired };

/**
 * Clickable count used by every "people" column (Instructors, Certificate).
 * `column.dataKey` picks the row's people array, `column.ariaMessage` is the
 * i18n message for the accessible label, and `column.onOpenSheet` opens the
 * shared right-side `PeopleSheet` with that list.
 */
const PeopleCountCell = ({ row, column }) => {
  const intl = useIntl();
  const people = row.original[column.dataKey] || [];

  return (
    <Button
      variant="link"
      size="inline"
      className="report-count-btn p-0"
      aria-label={intl.formatMessage(column.ariaMessage, {
        count: people.length,
        program: row.original.program,
      })}
      onClick={() => column.onOpenSheet(row.original.program, people)}
    >
      {people.length}
    </Button>
  );
};

PeopleCountCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({ program: PropTypes.string }).isRequired,
  }).isRequired,
  column: PropTypes.shape({
    dataKey: PropTypes.string,
    ariaMessage: PropTypes.shape({}),
    onOpenSheet: PropTypes.func,
  }).isRequired,
};

const CELL_RENDERERS = {
  text: TextCell,
  num: NumCell,
  status: StatusCell,
  peopleCount: PeopleCountCell,
};

/**
 * Paragon `DataTable` for the Program Report. Columns are built from the
 * `PROGRAM_COLUMNS` config - each entry's `kind` picks the cell renderer and
 * `strong` bolds the primary identifying column. Every "people" count cell
 * (Instructors, Certificate) opens the same right-side `PeopleSheet`,
 * configured per column via `PEOPLE_SHEET_CONFIG`.
 */
const ReportDataTable = ({ rows }) => {
  const intl = useIntl();
  const [sheet, setSheet] = useState({
    show: false, kind: null, program: '', people: [],
  });

  const openSheet = useCallback((kind) => (program, people) => {
    setSheet({
      show: true, kind, program, people,
    });
  }, []);

  const closeSheet = useCallback(() => {
    setSheet(previous => ({ ...previous, show: false }));
  }, []);

  const columns = useMemo(() => PROGRAM_COLUMNS.map(column => {
    const isPeopleCount = column.kind === 'peopleCount';
    const peopleConfig = isPeopleCount ? PEOPLE_SHEET_CONFIG[column.key] : undefined;
    const label = intl.formatMessage(messages[COLUMN_LABEL_MESSAGE_KEYS[column.key]]);
    const tooltipKey = COLUMN_TOOLTIP_MESSAGE_KEYS[column.key];

    return {
      Header: tooltipKey ? (
        <ColumnHeaderWithTooltip
          label={label}
          tooltipText={intl.formatMessage(messages[tooltipKey])}
          tooltipAlt={intl.formatMessage(messages[`${tooltipKey}Alt`])}
        />
      ) : label,
      id: column.key,
      // Sort people-count columns by the number of people rather than the
      // array itself.
      accessor: isPeopleCount ? (row => row[column.key].length) : column.key,
      strong: column.strong,
      dataKey: isPeopleCount ? column.key : undefined,
      ariaMessage: isPeopleCount ? messages[peopleConfig.ariaKey] : undefined,
      onOpenSheet: isPeopleCount ? openSheet(column.key) : undefined,
      Cell: CELL_RENDERERS[column.kind],
    };
  }), [intl, openSheet]);

  const sheetConfig = sheet.kind ? PEOPLE_SHEET_CONFIG[sheet.kind] : null;

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

      {sheetConfig && (
        <PeopleSheet
          show={sheet.show}
          program={sheet.program}
          people={sheet.people}
          badgeLabel={sheetConfig.badgeLabel}
          eyebrow={intl.formatMessage(messages[sheetConfig.eyebrowKey])}
          emptyText={intl.formatMessage(messages[sheetConfig.emptyKey])}
          closeLabel={intl.formatMessage(messages[sheetConfig.closeKey])}
          onClose={closeSheet}
        />
      )}
    </div>
  );
};

ReportDataTable.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

export default ReportDataTable;
