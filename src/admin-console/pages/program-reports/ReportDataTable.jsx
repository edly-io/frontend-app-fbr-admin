import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import PropTypes from 'prop-types';
import {
  Badge, DataTable, IconButton, IconButtonWithTooltip, Pagination,
} from '@openedx/paragon';
import { pdf } from '@react-pdf/renderer';
import { Download, InfoOutline, Visibility } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import PeopleSheet from './PeopleSheet';
import ProgramReportPdf from './pdf/ProgramReportPdf';
import { useProgramPeople } from './data/apiHooks';
import {
  COLUMN_LABEL_MESSAGE_KEYS, COLUMN_TOOLTIP_MESSAGE_KEYS, PEOPLE_SHEET_CONFIG, PROGRAM_COLUMNS,
  STATUS_LABEL_MESSAGE_KEYS, getStatusVariant,
} from './constants';
import { formatDate } from '../../utils/date';
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

const PeopleCountCell = ({ row, column }) => {
  const intl = useIntl();
  const count = row.original[column.dataKey] || 0;

  return (
    <span className="report-people-count d-inline-flex align-items-center gap-2">
      <IconButton
        src={Visibility}
        size="inline"
        alt={intl.formatMessage(column.ariaMessage, {
          count,
          program: row.original.program,
        })}
        className="report-count-btn"
        onClick={() => column.onOpenSheet(row.original.programKey, row.original.program)}
      />
      <span className="report-people-count__value">({count})</span>
    </span>
  );
};

PeopleCountCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      program: PropTypes.string,
      programKey: PropTypes.string,
    }).isRequired,
  }).isRequired,
  column: PropTypes.shape({
    dataKey: PropTypes.string,
    ariaMessage: PropTypes.shape({}),
    onOpenSheet: PropTypes.func,
  }).isRequired,
};

const ActionCell = ({ row }) => {
  const intl = useIntl();
  const { program, city, programKey } = row.original;
  const [downloading, setDownloading] = useState(false);
  const { data: people, isFetching } = useProgramPeople(programKey, { enabled: downloading });

  const fileName = useMemo(
    () => `${program.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}-report.pdf`,
    [program],
  );

  useEffect(() => {
    if (!downloading || isFetching || !people) { return; }

    const pdfDocument = (
      <ProgramReportPdf
        programName={program}
        city={city}
        instructors={people.instructors}
        certificates={people.certified}
        generatedOn={formatDate(new Date())}
        instructorsEmptyText={intl.formatMessage(messages.instructorsEmptyState)}
        certificatesEmptyText={intl.formatMessage(messages.certificatesEmptyState)}
      />
    );

    pdf(pdfDocument).toBlob().then(blob => {
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(objectUrl);
    }).finally(() => setDownloading(false));
  }, [downloading, isFetching, people, program, city, fileName, intl]);

  return (
    <IconButton
      src={Download}
      size="inline"
      alt={intl.formatMessage(messages.downloadPdfAria, { program })}
      className={`report-download-pdf-btn${downloading ? ' report-download-pdf-btn--loading' : ''}`}
      onClick={() => setDownloading(true)}
    />
  );
};

ActionCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      program: PropTypes.string,
      city: PropTypes.string,
      programKey: PropTypes.string,
    }),
  }).isRequired,
};

const CELL_RENDERERS = {
  text: TextCell,
  num: NumCell,
  status: StatusCell,
  peopleCount: PeopleCountCell,
  action: ActionCell,
};

const ReportDataTable = ({
  rows, count, pageSize, page, onPageChange, isLoading,
}) => {
  const intl = useIntl();
  const [sheet, setSheet] = useState({
    show: false, kind: null, programKey: '', program: '',
  });

  const pageCount = Math.max(1, Math.ceil(count / pageSize));
  const firstRow = rows.length ? (page - 1) * pageSize + 1 : 0;
  const lastRow = firstRow + rows.length - 1;

  const openSheet = useCallback((kind) => (programKey, program) => {
    setSheet({
      show: true, kind, programKey, program,
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
      Header: tooltipKey ? makeHeaderRenderer(
        <ColumnHeaderWithTooltip
          label={label}
          tooltipText={intl.formatMessage(messages[tooltipKey])}
          tooltipAlt={intl.formatMessage(messages[`${tooltipKey}Alt`])}
        />,
        column.key,
      ) : label,
      id: column.key,
      accessor: isPeopleCount ? column.countKey : column.key,
      strong: column.strong,
      dataKey: isPeopleCount ? column.countKey : undefined,
      ariaMessage: isPeopleCount ? messages[peopleConfig.ariaKey] : undefined,
      onOpenSheet: isPeopleCount ? openSheet(column.key) : undefined,
      // The Action column has nothing meaningful to sort by - it just
      // renders the per-row Download PDF button.
      disableSortBy: column.kind === 'action',
      Cell: CELL_RENDERERS[column.kind],
    };
  }), [intl, openSheet]);

  const sheetConfig = sheet.kind ? PEOPLE_SHEET_CONFIG[sheet.kind] : null;
  const { data: sheetPeopleData } = useProgramPeople(sheet.programKey);
  const sheetPeople = sheetConfig
    ? (sheetPeopleData?.[sheetConfig.groupKey] || [])
    : [];

  return (
    <div className="report-data-table">
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

      {sheetConfig && (
        <PeopleSheet
          show={sheet.show}
          program={sheet.program}
          people={sheetPeople}
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
