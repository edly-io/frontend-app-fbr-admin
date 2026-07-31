import React, { useMemo, useState } from 'react';
import { Button, Toast } from '@openedx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExport } from '@fortawesome/free-solid-svg-icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import Breadcrumb from '../../components/breadcrumb/Breadcrumb';
import FilterBar from '../../components/filter-bar/FilterBar';
import ReportDataTable from './ReportDataTable';
import ReportStatCards from './ReportStatCards';
import { buildProgramReportData, getFilterOptionLists } from './data/mockData';
import messages from './messages';
import './reports-styles.scss';

const DEFAULT_FILTERS = { program: 'all', instructor: 'all', city: 'all' };

/**
 * Program Report page: a Program/Instructor/City filter row driving a data
 * table. Data range and any backend integration are intentionally out of
 * scope for this iteration (UI-only, static mock data).
 */
const ProgramReportsPage = () => {
  const intl = useIntl();

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [showToast, setShowToast] = useState(false);

  const filterOptions = useMemo(() => getFilterOptionLists(), []);
  const { rows, stats } = useMemo(
    () => buildProgramReportData(filters),
    [filters],
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
      id: 'city',
      label: intl.formatMessage(messages.filterCity),
      value: filters.city,
      onChange: handleFilterChange('city'),
      options: [
        { value: 'all', label: intl.formatMessage(messages.filterAllCities) },
        ...filterOptions.cities.map(name => ({ value: name, label: name })),
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

      <ReportStatCards stats={stats} />

      <ReportDataTable rows={rows} />

      <Toast show={showToast} onClose={() => setShowToast(false)}>
        {intl.formatMessage(messages.exportToast)}
      </Toast>
    </div>
  );
};

export default ProgramReportsPage;
