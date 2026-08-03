import React, { useMemo, useState } from 'react';
import {
  Alert, Card, Spinner, Toast,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import DebouncedSearchInput from '../../shared/DebouncedSearchInput';
import HrmsAssignRoleModal from './HrmsAssignRoleModal';
import HrmsEmployeesTable from './HrmsEmployeesTable';
import HrmsToolbar from './HrmsToolbar';
import { useHrmsEmployees } from './data/apiHooks';
import messages from './messages';
import './hrms-styles.scss';

const getHrmsErrorMessage = (intl, error) => {
  if (error?.response?.status === 403) {
    return intl.formatMessage(messages.forbiddenError);
  }

  return error?.response?.data?.detail || intl.formatMessage(messages.loadError);
};

const employeeMatchesSearch = (employee, search) => {
  const query = search.trim().toLowerCase();
  if (!query) {
    return true;
  }

  return [
    employee.fullName,
    employee.employeeCode,
    String(employee.employeeId || ''),
    employee.email,
    employee.cnic,
    employee.phone,
  ].some(value => String(value || '').toLowerCase().includes(query));
};

const HrmsPage = () => {
  const intl = useIntl();
  const [search, setSearch] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const {
    data, isLoading, isFetching, isError, error, refetch,
  } = useHrmsEmployees();

  const employees = useMemo(() => data?.employees ?? [], [data]);
  const filteredEmployees = useMemo(
    () => employees.filter(employee => employeeMatchesSearch(employee, search)),
    [employees, search],
  );
  const displayedCount = search.trim() ? filteredEmployees.length : data?.total ?? 0;
  const emptyMessage = search.trim()
    ? intl.formatMessage(messages.emptySearchState)
    : intl.formatMessage(messages.emptyState);
  const errorMessage = isError ? getHrmsErrorMessage(intl, error) : '';

  const handleAssignSuccess = () => {
    setSelectedEmployee(null);
    setShowToast(true);
  };

  return (
    <div className="hrms-page">
      <HrmsToolbar isRefreshing={isFetching} onRefresh={refetch} />

      <div className="hrms-page__controls">
        <DebouncedSearchInput
          value={search}
          onChange={setSearch}
          placeholder={intl.formatMessage(messages.searchPlaceholder)}
        />
        <span className="hrms-page__count">
          {intl.formatMessage(messages.employeesCount, { count: displayedCount })}
        </span>
      </div>

      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

      {isLoading ? (
        <Card className="hrms-page__state-card">
          <Card.Body>
            <Spinner animation="border" screenReaderText={intl.formatMessage(messages.pageTitle)} />
          </Card.Body>
        </Card>
      ) : (
        <HrmsEmployeesTable
          key={search}
          employees={filteredEmployees}
          emptyMessage={emptyMessage}
          onAssign={setSelectedEmployee}
        />
      )}

      {selectedEmployee && (
        <HrmsAssignRoleModal
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
          onSuccess={handleAssignSuccess}
        />
      )}

      <Toast show={showToast} onClose={() => setShowToast(false)}>
        {intl.formatMessage(messages.assignRoleSuccess)}
      </Toast>
    </div>
  );
};

export default HrmsPage;
