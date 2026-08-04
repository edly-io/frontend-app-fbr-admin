import React, { useState } from 'react';
import { Alert } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import Breadcrumb from '../../components/breadcrumb/Breadcrumb';
import FilterBar from '../../components/filter-bar/FilterBar';
import ReportDataTable from './ReportDataTable';
import ReportStatCards from './ReportStatCards';
import { useProgramReports, useReportFilters } from './data/apiHooks';
import { REPORT_PAGE_SIZE } from './constants';
import messages from './messages';
import './reports-styles.scss';

const DEFAULT_FILTERS = { program: 'all', instructor: 'all', city: 'all' };
const EMPTY_FILTER_OPTIONS = { programs: [], instructors: [], cities: [] };
const EMPTY_KPIS = { programCount: 0, certificatesAwarded: 0 };

/**
 * Program Report page: a Program/Instructor/City filter row driving a
 * server-paginated data table backed by `GET /fbr/api/reports/program/`.
 * The dropdown filters themselves come from `GET /fbr/api/reports/filters/`
 * and are sent to the report endpoint as query params; changing any filter
 * resets the listing back to page 1. PDF export happens per-row (see
 * `ReportDataTable`'s Action column) rather than for the whole page.
 */
const ProgramReportsPage = () => {
  const intl = useIntl();

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);

  const { data: filterOptionsData, isError: isFilterError } = useReportFilters();
  const filterOptions = filterOptionsData || EMPTY_FILTER_OPTIONS;

  const {
    data, isError, error, isFetching,
  } = useProgramReports({ ...filters, page, pageSize: REPORT_PAGE_SIZE });

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
    setFilters(previous => ({ ...previous, [key]: value }));
    setPage(1);
  };

  const handleClearAll = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  const isClearAllDisabled = Object.keys(DEFAULT_FILTERS)
    .every(key => filters[key] === DEFAULT_FILTERS[key]);

  const filterConfig = [
    {
      id: 'program',
      label: intl.formatMessage(messages.filterProgram),
      value: filters.program,
      onChange: handleFilterChange('program'),
      options: [
        { value: 'all', label: intl.formatMessage(messages.filterAllPrograms) },
        ...filterOptions.programs,
      ],
    },
    {
      id: 'instructor',
      label: intl.formatMessage(messages.filterInstructor),
      value: filters.instructor,
      onChange: handleFilterChange('instructor'),
      options: [
        { value: 'all', label: intl.formatMessage(messages.filterAllInstructors) },
        ...filterOptions.instructors,
      ],
    },
    {
      id: 'city',
      label: intl.formatMessage(messages.filterCity),
      value: filters.city,
      onChange: handleFilterChange('city'),
      options: [
        { value: 'all', label: intl.formatMessage(messages.filterAllCities) },
        ...filterOptions.cities,
      ],
    },
  ];

  return (
    <div className="reports-page">
      <Breadcrumb leaf={intl.formatMessage(messages.breadcrumbLeaf)} />

      <h1 className="h3 fw-bold mb-1">
        {intl.formatMessage(messages.pageTitle)}
      </h1>
      <p className="reports-page__subtitle small mb-3">
        {intl.formatMessage(messages.pageSubtitle)}
      </p>

      <ReportStatCards stats={stats} />

      {errorMessage && <Alert variant="danger" className="mb-3">{errorMessage}</Alert>}

      <FilterBar
        filters={filterConfig}
        onClearAll={handleClearAll}
        clearAllLabel={intl.formatMessage(messages.clearAllFilters)}
        isClearAllDisabled={isClearAllDisabled}
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
