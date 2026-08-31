import React, {
  useCallback, useMemo, useState,
} from 'react';
import PropTypes from 'prop-types';
import {
  Alert, Badge, DataTable, Icon, IconButton, OverlayTrigger, Pagination, Tooltip,
} from '@openedx/paragon';
import {
  Download, ExpandLess, ExpandMore, Visibility,
} from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import PeopleSheet from './PeopleSheet';
import ProgramOverviewPanel from './ProgramOverviewPanel';
import TraineeProgressSheet from './TraineeProgressSheet';
import { useProgramPeople } from './data/apiHooks';
import { exportProgramPeople } from './data/api';
import { downloadBlob } from '../../utils/download';
import {
  COLUMN_LABEL_MESSAGE_KEYS, EMPTY_CELL_VALUE, PEOPLE_SHEET_CONFIG, PROGRAM_COLUMNS,
  STATUS_LABEL_MESSAGE_KEYS, getStatusVariant,
} from './constants';
import { formatDate } from '../../utils/date';
import messages from './messages';

const TextCell = ({ value, column }) => (
  <span className={column.strong ? 'report-text-cell--strong' : undefined}>{value}</span>
);

TextCell.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  column: PropTypes.shape({ strong: PropTypes.bool }).isRequired,
};

const DateCell = ({ value }) => (
  <span className="report-date-cell">{formatDate(value) || EMPTY_CELL_VALUE}</span>
);

DateCell.propTypes = { value: PropTypes.string };

DateCell.defaultProps = { value: '' };

// A program description can run to several paragraphs, so the cell shows a
// single truncated line and puts the full text in a Paragon Tooltip. The
// trigger fires on `hover` *and* `focus` and is tabbable, so keyboard-only
// users reach the full description exactly like mouse users do.
const DescriptionCell = ({ value, row }) => {
  const intl = useIntl();
  const description = (value || '').trim();

  if (!description) {
    return (
      <span className="report-description-cell" aria-label={intl.formatMessage(messages.programDescriptionEmpty)}>
        {EMPTY_CELL_VALUE}
      </span>
    );
  }

  return (
    <OverlayTrigger
      trigger={['hover', 'focus']}
      placement="top"
      overlay={(
        <Tooltip id={`program-description-tooltip-${row.original.id}`}>
          {description}
        </Tooltip>
      )}
    >
      <span
        className="report-description-cell"
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        role="note"
        aria-label={intl.formatMessage(messages.programDescriptionAria, {
          program: row.original.program,
          description,
        })}
      >
        {description}
      </span>
    </OverlayTrigger>
  );
};

DescriptionCell.propTypes = {
  value: PropTypes.string,
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.string,
      program: PropTypes.string,
    }).isRequired,
  }).isRequired,
};

DescriptionCell.defaultProps = { value: '' };

const ProgramExpandCell = ({ value, row }) => {
  const intl = useIntl();
  const { onClick } = row.getToggleRowExpandedProps();

  return (
    <button
      type="button"
      className="report-expand-btn btn btn-link p-0 text-body text-left text-decoration-none report-text-cell--strong d-inline-flex align-items-center gap-2"
      aria-expanded={row.isExpanded}
      title={intl.formatMessage(messages.toggleProgramOverviewAria, { program: value })}
      onClick={onClick}
    >
      <Icon src={row.isExpanded ? ExpandLess : ExpandMore} className="report-expand-btn__icon" />
      <span>{value}</span>
    </button>
  );
};

ProgramExpandCell.propTypes = {
  value: PropTypes.string.isRequired,
  row: PropTypes.shape({
    isExpanded: PropTypes.bool,
    getToggleRowExpandedProps: PropTypes.func.isRequired,
  }).isRequired,
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

const ActionCell = ({ row, column }) => {
  const intl = useIntl();
  const { program, programKey } = row.original;
  const [isExporting, setIsExporting] = useState(false);

  const handleDownload = async () => {
    if (isExporting) { return; }
    setIsExporting(true);
    try {
      const { blob, filename } = await exportProgramPeople(programKey);
      downloadBlob(blob, filename);
      column.onExportError('');
    } catch (exportRequestError) {
      column.onExportError(
        exportRequestError?.response?.data?.detail || intl.formatMessage(messages.exportError),
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <IconButton
      src={Download}
      size="inline"
      alt={intl.formatMessage(messages.downloadCsvAria, { program })}
      className={`report-download-btn${isExporting ? ' report-download-btn--loading' : ''}`}
      disabled={isExporting}
      onClick={handleDownload}
    />
  );
};

ActionCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      program: PropTypes.string,
      programKey: PropTypes.string,
    }),
  }).isRequired,
  column: PropTypes.shape({ onExportError: PropTypes.func.isRequired }).isRequired,
};

const CELL_RENDERERS = {
  text: TextCell,
  num: NumCell,
  date: DateCell,
  description: DescriptionCell,
  status: StatusCell,
  peopleCount: PeopleCountCell,
  action: ActionCell,
  programExpand: ProgramExpandCell,
};

const ReportDataTable = ({
  rows, count, pageSize, page, onPageChange, isLoading,
}) => {
  const intl = useIntl();
  const [sheet, setSheet] = useState({
    show: false, kind: null, programKey: '', program: '',
  });
  const [traineeSheet, setTraineeSheet] = useState({
    show: false, trainee: null, program: '', programKey: '',
  });
  const [exportError, setExportError] = useState('');

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

  const openTraineeSheet = useCallback((trainee, program, programKey) => {
    setTraineeSheet({
      show: true, trainee, program, programKey,
    });
  }, []);

  const closeTraineeSheet = useCallback(() => {
    setTraineeSheet(previous => ({ ...previous, show: false }));
  }, []);

  const renderRowSubComponent = useCallback(({ row }) => (
    <ProgramOverviewPanel
      programKey={row.original.programKey}
      onViewTrainee={(trainee) => openTraineeSheet(trainee, row.original.program, row.original.programKey)}
    />
  ), [openTraineeSheet]);

  const columns = useMemo(() => PROGRAM_COLUMNS.map(column => {
    const isPeopleCount = column.kind === 'peopleCount';
    const peopleConfig = isPeopleCount ? PEOPLE_SHEET_CONFIG[column.key] : undefined;
    const label = intl.formatMessage(messages[COLUMN_LABEL_MESSAGE_KEYS[column.key]]);

    return {
      Header: label,
      id: column.key,
      accessor: isPeopleCount ? column.countKey : column.key,
      strong: column.strong,
      dataKey: isPeopleCount ? column.countKey : undefined,
      ariaMessage: isPeopleCount ? messages[peopleConfig.ariaKey] : undefined,
      onOpenSheet: isPeopleCount ? openSheet(column.key) : undefined,
      onExportError: column.kind === 'action' ? setExportError : undefined,
      // The Action column has nothing meaningful to sort by - it just
      // renders the per-row Download CSV button.
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
      {exportError && <Alert variant="danger" className="mb-3">{exportError}</Alert>}

      <DataTable
        isSortable
        isExpandable
        renderRowSubComponent={renderRowSubComponent}
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

      <TraineeProgressSheet
        show={traineeSheet.show}
        trainee={traineeSheet.trainee?.name ?? ''}
        email={traineeSheet.trainee?.email ?? ''}
        program={traineeSheet.program}
        traineeId={traineeSheet.trainee?.id ?? null}
        programKey={traineeSheet.programKey}
        onClose={closeTraineeSheet}
      />
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
