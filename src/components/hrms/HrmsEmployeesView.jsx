import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@openedx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync } from '@fortawesome/free-solid-svg-icons';
import { getHrmsEmployees } from '../../api/hrms';
import DebouncedSearchInput from '../DebouncedSearchInput';
import HrmsEmployeesTable from './HrmsEmployeesTable';

const getHrmsErrorMessage = (error) => {
  if (error?.response?.status === 403) {
    return 'You do not have permission to view HRMS employees.';
  }

  return error?.response?.data?.detail || 'Unable to load HRMS employees.';
};

const employeeMatchesSearch = (employee, search) => {
  if (!search.trim()) {
    return true;
  }

  const query = search.trim().toLowerCase();
  return [
    employee.fullName,
    employee.employeeCode,
    String(employee.employeeId || ''),
    employee.email,
    employee.cnic,
    employee.phone,
  ].some(value => String(value || '').toLowerCase().includes(query));
};

const HrmsEmployeesView = ({ onAssign, reloadKey }) => {
  const [employees, setEmployees] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchEmployees = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const result = await getHrmsEmployees();
        if (!isMounted) {
          return;
        }

        setEmployees(result.employees);
        setTotalCount(result.count);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setEmployees([]);
        setTotalCount(0);
        setErrorMessage(getHrmsErrorMessage(error));
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchEmployees();
    return () => { isMounted = false; };
  }, [refreshKey, reloadKey]);

  const filteredEmployees = useMemo(
    () => employees.filter(employee => employeeMatchesSearch(employee, search)),
    [employees, search],
  );

  const totalEmployees = search.trim() ? filteredEmployees.length : totalCount;
  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / rowsPerPage));
  const page = Math.min(currentPage, totalPages);
  const pageEmployees = filteredEmployees.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const emptyMessage = search.trim()
    ? 'No employees match your search.'
    : 'No HRMS employees found.';

  const handleSearchChange = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleRowsPerPageChange = (value) => {
    setRowsPerPage(value);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    setCurrentPage(1);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <>
      <p style={{ fontSize: '13px', color: 'var(--pgn-color-text-light)', marginBottom: '14px' }}>
        <span>Administration</span>
        <span style={{ margin: '0 8px', opacity: 0.4 }}>/</span>
        <span style={{ color: 'var(--pgn-color-gray-800)', fontWeight: 500 }}>HRMS</span>
      </p>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '6px',
      }}
      >
        <h1 style={{
          fontSize: '22px',
          fontWeight: 700,
          color: 'var(--pgn-color-text-base)',
          margin: 0,
        }}
        >
          HRMS Employees
        </h1>
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
          style={{ marginTop: '2px' }}
        >
          <FontAwesomeIcon icon={faSync} style={{ marginRight: '6px' }} />
          Refresh
        </Button>
      </div>

      <p style={{ color: 'var(--pgn-color-text-light)', fontSize: '13.5px', marginBottom: '24px' }}>
        Employee information synced from PayPeople HRMS.
      </p>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
      }}
      >
        <DebouncedSearchInput
          value={search}
          onChange={handleSearchChange}
          placeholder="Search by name, email, CNIC, phone, employee code or ID..."
        />
        <span style={{ fontSize: '13px', color: 'var(--pgn-color-text-light)', fontWeight: 500 }}>
          {totalEmployees} employees
        </span>
      </div>

      {errorMessage && (
        <div style={{
          background: '#FDE8E8',
          color: '#9B1C1C',
          border: '1px solid #F8B4B4',
          borderRadius: '6px',
          padding: '10px 12px',
          marginBottom: '14px',
          fontSize: '13.5px',
        }}
        >
          {errorMessage}
        </div>
      )}

      <HrmsEmployeesTable
        employees={pageEmployees}
        isLoading={isLoading}
        emptyMessage={emptyMessage}
        page={page}
        rowsPerPage={rowsPerPage}
        totalEmployees={totalEmployees}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onRowsPerPageChange={handleRowsPerPageChange}
        onAssign={onAssign}
      />
    </>
  );
};

HrmsEmployeesView.propTypes = {
  onAssign: PropTypes.func.isRequired,
  reloadKey: PropTypes.number,
};

HrmsEmployeesView.defaultProps = {
  reloadKey: 0,
};

export default HrmsEmployeesView;
