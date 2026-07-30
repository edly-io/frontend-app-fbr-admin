import React, { useMemo, useState } from 'react';
import { Button, Toast } from '@openedx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExport } from '@fortawesome/free-solid-svg-icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import Breadcrumb from '../components/breadcrumb/Breadcrumb';
import FilterBar from '../components/filter-bar/FilterBar';
import ReportTypeTabs from './ReportTypeTabs';
import ReportStatCards from './ReportStatCards';
import ReportDataTable from './ReportDataTable';
import { buildReportData, getFilterOptionLists } from './data/mockData';
import { DEFAULT_REPORT_ID } from './constants';
import messages from './messages';
import './reports-styles.scss';

const DEFAULT_FILTERS = { program: 'all', instructor: 'all', region: 'all' };

/**
 * Reports page: report-type pills + a Program/Instructor/Region filter row
 * driving a dynamic stat-card + data-table pair. Data range/Category/
 * Department filters and any backend integration are intentionally out of
 * scope for this iteration (UI-only, static mock data).
 */
const ReportsPage = () => {
  const intl = useIntl();

  const [selectedReport, setSelectedReport] = useState(DEFAULT_REPORT_ID);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [showToast, setShowToast] = useState(false);

  const filterOptions = useMemo(() => getFilterOptionLists(), []);
  const { rows, stats } = useMemo(
    () => buildReportData(selectedReport, filters),
    [selectedReport, filters],
  );

  const handleFilterChange = (key) => (value) => {
    setFilters(previous => ({ ...previous, [key]: value }));
  };

  const handleExport = () => {
    setShowToast(true);
    setTimeout(() => window.print(), 150);
  };

  const filterConfig = [
    {
      id: 'program',
      label: intl.formatMessage(messages.filterProgram),
      value: filters.program,
      onChange: handleFilterChange('program'),
      options: [
        { value: 'all', label: intl.formatMessage(messages.filterAllPrograms) },
        ...filterOptions.programs.map(name => ({ value: name, label: name })),
      ],
    },
    {
      id: 'instructor',
      label: intl.formatMessage(messages.filterInstructor),
      value: filters.instructor,
      onChange: handleFilterChange('instructor'),
      options: [
        { value: 'all', label: intl.formatMessage(messages.filterAllInstructors) },
        ...filterOptions.instructors.map(name => ({ value: name, label: name })),
      ],
    },
    {
      id: 'region',
      label: intl.formatMessage(messages.filterRegion),
      value: filters.region,
      onChange: handleFilterChange('region'),
      options: [
        { value: 'all', label: intl.formatMessage(messages.filterAllRegions) },
        ...filterOptions.regions.map(name => ({ value: name, label: name })),
      ],
    },
  ];

  return (
    <div className="reports-page">
      <Breadcrumb leaf={intl.formatMessage(messages.breadcrumbLeaf)} />

      <div className="d-flex justify-content-between align-items-start mb-1">
        <h1 className="h3 fw-bold mb-0">
          {intl.formatMessage(messages.pageTitle)}
        </h1>
        <Button variant="outline-primary" size="sm" onClick={handleExport}>
          <FontAwesomeIcon icon={faFileExport} className="mr-2" />
          {intl.formatMessage(messages.exportButton)}
        </Button>
      </div>
      <p className="reports-page__subtitle small mb-3">
        {intl.formatMessage(messages.pageSubtitle)}
      </p>

      <FilterBar filters={filterConfig} />

      <ReportTypeTabs selectedReport={selectedReport} onChange={setSelectedReport} />

      <ReportStatCards stats={stats} />

      <ReportDataTable reportId={selectedReport} rows={rows} />

      <Toast show={showToast} onClose={() => setShowToast(false)}>
        {intl.formatMessage(messages.exportToast)}
      </Toast>
    </div>
  );
};

export default ReportsPage;
