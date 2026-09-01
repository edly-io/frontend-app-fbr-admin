import React, { useState } from 'react';
import { Alert, Button, Spinner } from '@openedx/paragon';
import { Download } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import Breadcrumb from '../../components/breadcrumb/Breadcrumb';
import FilterBar from '../../components/filter-bar/FilterBar';
import PermissionDeniedAlert from '../../components/PermissionDeniedAlert';
import ReportDataTable from './ReportDataTable';
import ReportStatCards from './ReportStatCards';
import { useAttendanceReports } from './data/apiHooks';
import { exportAttendanceReports } from './data/api';
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
const EMPTY_KPIS = { learners: 0, avgAttendance: 0, sessionsTracked: 0 };

// Date range filter can't select the future and its end date can't precede
// its start date - see the matching handlers below for the input-level bounds.
const getTodayIsoDate = () => new Date().toISOString().slice(0, 10);

/**
 * Attendance Report page: a Program/Instructor/City/Date-Range filter row
 * driving a server-paginated data table backed by `GET /fbr/api/reports/trainees/`.
 * The dropdown filters come from `GET /fbr/api/reports/filters/` and are sent
 * to the report endpoint as query params; changing any filter resets the
 * listing back to page 1. Mirrors `SessionsInstructorReportsPage`'s
 * draft/applied filter pattern and CSV export flow.
 */
const AttendanceReportsPage = () => {
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

  const isAccessReady = !isAccessLoading && capabilities.canAccessAttendance;

  const { data: filterOptionsData, isError: isFilterError } = useReportFilters({
    enabled: isAccessReady,
  });
  const filterOptions = filterOptionsData || EMPTY_FILTER_OPTIONS;

  const {
    data, isError, error, isFetching,
  } = useAttendanceReports(
    { ...appliedFilters, page, pageSize: REPORT_PAGE_SIZE },
    { enabled: isAccessReady },
  );

  const rows = data?.rows || [];
  const count = data?.count || 0;
  const kpis = data?.kpis || EMPTY_KPIS;
  const stats = [
    ['learners', kpis.learners],
    ['avgAttendance', `${kpis.avgAttendance}%`],
    ['sessionsTracked', kpis.sessionsTracked],
  ];

  const errorMessage = (isError || isFilterError)
    ? (error?.response?.data?.detail || intl.formatMessage(messages.loadError))
    : '';

  const handleFilterChange = (key) => (value) => {
    setDraftFilters(previous => ({ ...previous, [key]: value }));
  };

  const handleStartDateChange = (value) => {
    const startDate = value > today ? today : value;
    setDraftFilters(previous => {
      let { endDate } = previous;
      if (endDate && endDate < startDate) {
        endDate = startDate;
      }
      return { ...previous, startDate, endDate };
    });
  };

  const handleEndDateChange = (value) => {
    setDraftFilters(previous => {
      let endDate = value > today ? today : value;
      if (previous.startDate && endDate < previous.startDate) {
        endDate = previous.startDate;
      }
      return { ...previous, endDate };
    });
  };

  const handleDownloadCsv = async () => {
    if (isExporting) { return; }
    setIsExporting(true);
    setExportError('');
    try {
      const { blob, filename } = await exportAttendanceReports(appliedFilters);
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

  const isDownloadDisabled = appliedFilters.program === DEFAULT_FILTERS.program
    && appliedFilters.instructor === DEFAULT_FILTERS.instructor;

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

  if (!capabilities.canAccessAttendance) {
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
            disabled={isExporting || isDownloadDisabled}
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
        startDate={appliedFilters.startDate}
        endDate={appliedFilters.endDate}
      />
    </div>
  );
};

export default AttendanceReportsPage;
