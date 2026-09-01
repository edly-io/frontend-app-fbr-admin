import React, { useState } from 'react';
import {
  Alert, Button, Spinner,
} from '@openedx/paragon';
import { Download } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import Breadcrumb from '../../components/breadcrumb/Breadcrumb';
import FilterBar from '../../components/filter-bar/FilterBar';
import PermissionDeniedAlert from '../../components/PermissionDeniedAlert';
import ReportDataTable from './ReportDataTable';
import ReportStatCards from './ReportStatCards';
import { useProgramReports } from './data/apiHooks';
import { exportProgramReports } from './data/api';
import { useReportsAccess, useReportFilters } from '../../data/apiHooks';
import { downloadBlob } from '../../utils/download';
import { REPORT_PAGE_SIZE } from './constants';
import messages from './messages';
import shellMessages from '../../messages';
import '../../../assets/scss/reports-styles.scss';
import './styles.scss';

const DEFAULT_FILTERS = {
  program: 'all', instructor: 'all', city: 'all', startDate: '', endDate: '',
};
const EMPTY_FILTER_OPTIONS = { programs: [], instructors: [], cities: [] };
const EMPTY_KPIS = { programCount: 0, certificatesAwarded: 0 };

// Date range filter can't select the future, and its end date can't precede
// its start date - see the matching handlers below for the input-level bounds.
const getTodayIsoDate = () => new Date().toISOString().slice(0, 10);

/**
 * Program Report page: a Program/Instructor/City filter row driving a
 * server-paginated data table backed by `GET /fbr/api/reports/program/`.
 * The dropdown filters themselves come from `GET /fbr/api/reports/filters/`
 * and are sent to the report endpoint as query params; changing any filter
 * resets the listing back to page 1. Download CSV exports every row matching
 * the applied filters; the Action column's per-row button downloads that one
 * program's summary sheet (see `ReportDataTable`).
 */
const ProgramReportsPage = () => {
  const intl = useIntl();

  const { capabilities, isLoading: isAccessLoading } = useReportsAccess();

  // Filter edits only update `draftFilters` (bound to the inputs); the query
  // itself runs off `appliedFilters`, which only changes on Apply/Clear, so
  // picking filter values doesn't fire a request on every keystroke/click.
  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const today = getTodayIsoDate();

  const isAccessReady = !isAccessLoading && capabilities.canAccessPrograms;

  const { data: filterOptionsData, isError: isFilterError } = useReportFilters({
    enabled: isAccessReady,
  });
  const filterOptions = filterOptionsData || EMPTY_FILTER_OPTIONS;

  const {
    data, isError, error, isFetching,
  } = useProgramReports(
    { ...appliedFilters, page, pageSize: REPORT_PAGE_SIZE },
    { enabled: isAccessReady },
  );

  const rows = data?.rows || [];
  const count = data?.count || 0;
  const kpis = data?.kpis || EMPTY_KPIS;
  const stats = [
    ['programCount', kpis.programCount],
    ['certificatesAwarded', kpis.certificatesAwarded],
  ];

  const errorMessage = (isError || isFilterError)
    ? (error?.response?.data?.detail || intl.formatMessage(messages.loadError))
    : '';

  const handleFilterChange = (key) => (value) => {
    setDraftFilters(previous => ({ ...previous, [key]: value }));
  };

  const handleStartDateChange = (value) => {
    const startDate = value > today ? today : value;
    setDraftFilters(previous => ({
      ...previous,
      startDate,
      endDate: previous.endDate && previous.endDate < startDate ? startDate : previous.endDate,
    }));
  };

  const handleEndDateChange = (value) => {
    setDraftFilters(previous => {
      const endDate = value > today ? today : value;
      return {
        ...previous,
        endDate: previous.startDate && endDate < previous.startDate ? previous.startDate : endDate,
      };
    });
  };

  // The backend builds and streams the CSV over the *applied* filters, so the
  // file covers every program the filtered table can page through - not just
  // the page in view.
  const handleDownloadCsv = async () => {
    if (isExporting) { return; }
    setIsExporting(true);
    setExportError('');
    try {
      const { blob, filename } = await exportProgramReports(appliedFilters);
      downloadBlob(blob, filename);
    } catch (exportRequestError) {
      setExportError(exportRequestError?.response?.data?.detail || intl.formatMessage(messages.exportError));
    } finally {
      setIsExporting(false);
    }
  };

  const handleApplyFilters = () => {
    setAppliedFilters(draftFilters);
    setPage(1);
  };

  const handleClearAll = () => {
    setDraftFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  const isClearAllDisabled = Object.keys(DEFAULT_FILTERS)
    .every(key => draftFilters[key] === DEFAULT_FILTERS[key] && appliedFilters[key] === DEFAULT_FILTERS[key]);

  const isApplyDisabled = Object.keys(DEFAULT_FILTERS)
    .every(key => draftFilters[key] === appliedFilters[key]);

  const filterConfig = [
    {
      id: 'program',
      label: intl.formatMessage(messages.filterProgram),
      value: draftFilters.program,
      onChange: handleFilterChange('program'),
      options: [
        { value: 'all', label: intl.formatMessage(messages.filterAllPrograms) },
        ...filterOptions.programs,
      ],
    },
    {
      id: 'instructor',
      label: intl.formatMessage(messages.filterInstructor),
      value: draftFilters.instructor,
      onChange: handleFilterChange('instructor'),
      options: [
        { value: 'all', label: intl.formatMessage(messages.filterAllInstructors) },
        ...filterOptions.instructors,
      ],
    },
    {
      id: 'city',
      label: intl.formatMessage(messages.filterCity),
      value: draftFilters.city,
      onChange: handleFilterChange('city'),
      options: [
        { value: 'all', label: intl.formatMessage(messages.filterAllCities) },
        ...filterOptions.cities,
      ],
    },
    {
      id: 'dateRange',
      type: 'dateRange',
      label: intl.formatMessage(messages.filterDateRange),
      startValue: draftFilters.startDate,
      endValue: draftFilters.endDate,
      startLabel: intl.formatMessage(messages.filterDateRangeStart),
      endLabel: intl.formatMessage(messages.filterDateRangeEnd),
      onStartChange: handleStartDateChange,
      onEndChange: handleEndDateChange,
      startMax: today,
      endMin: draftFilters.startDate || undefined,
      endMax: today,
    },
  ];

  if (isAccessLoading) {
    return (
      <div className="reports-page d-flex justify-content-center py-5">
        <Spinner animation="border" screenReaderText={intl.formatMessage(messages.pageTitle)} />
      </div>
    );
  }

  if (!capabilities.canAccessPrograms) {
    return (
      <div className="reports-page">
        <Breadcrumb
          root={intl.formatMessage(shellMessages.breadcrumbReports)}
          leaf={intl.formatMessage(messages.breadcrumbLeaf)}
        />
        <PermissionDeniedAlert />
      </div>
    );
  }

  return (
    <div className="reports-page">
      <Breadcrumb
        root={intl.formatMessage(shellMessages.breadcrumbReports)}
        leaf={intl.formatMessage(messages.breadcrumbLeaf)}
      />

      <h1 className="h3 fw-bold mb-1">
        {intl.formatMessage(messages.pageTitle)}
      </h1>
      <p className="reports-page__subtitle small mb-3">
        {intl.formatMessage(messages.pageSubtitle)}
      </p>

      <ReportStatCards stats={stats} />

      {errorMessage && <Alert variant="danger" className="mb-3">{errorMessage}</Alert>}
      {exportError && <Alert variant="danger" className="mb-3">{exportError}</Alert>}

      <FilterBar
        filters={filterConfig}
        onApply={handleApplyFilters}
        applyLabel={intl.formatMessage(messages.applyFilters)}
        isApplyDisabled={isApplyDisabled}
        onClearAll={handleClearAll}
        clearAllLabel={intl.formatMessage(messages.clearAllFilters)}
        isClearAllDisabled={isClearAllDisabled}
        trailingActions={(
          <Button
            variant="outline-primary"
            iconBefore={Download}
            onClick={handleDownloadCsv}
            disabled={isExporting || count === 0}
          >
            {isExporting ? intl.formatMessage(messages.downloadingCsv) : intl.formatMessage(messages.downloadCsv)}
          </Button>
        )}
      />

      <ReportDataTable
        rows={rows}
        count={count}
        pageSize={REPORT_PAGE_SIZE}
        page={page}
        onPageChange={setPage}
        isLoading={isFetching}
      />
    </div>
  );
};

export default ProgramReportsPage;
