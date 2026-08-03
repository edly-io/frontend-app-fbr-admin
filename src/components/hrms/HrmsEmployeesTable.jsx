import React from 'react';
import PropTypes from 'prop-types';
import { Button, Form } from '@openedx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import UserIdentity from '../UserIdentity';

const HrmsEmployeesTable = ({
  employees,
  isLoading,
  emptyMessage,
  page,
  rowsPerPage,
  totalEmployees,
  totalPages,
  onPageChange,
  onRowsPerPageChange,
  onAssign,
}) => {
  const start = totalEmployees === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const end = Math.min((page - 1) * rowsPerPage + employees.length, totalEmployees);

  return (
    <div style={{
      background: '#fff',
      borderRadius: '10px',
      border: '1px solid var(--pgn-color-border)',
      overflow: 'hidden',
    }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
        <thead>
          <tr style={{ background: 'var(--pgn-color-gray-100)', borderBottom: '1px solid var(--pgn-color-border)' }}>
            {[
              ['#', '52px'],
              ['EMPLOYEE'],
              ['EMPLOYEE CODE'],
              ['CNIC'],
              ['PHONE'],
              ['EMPLOYEE ID'],
              ['EMAIL ADDRESS'],
              ['ACTION', '120px'],
            ].map(([label, width]) => (
              <th
                key={label}
                style={{
                  padding: '11px 16px',
                  textAlign: label === 'ACTION' ? 'center' : 'left',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--pgn-color-gray-400)',
                  letterSpacing: '0.06em',
                  width,
                }}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr>
              <td colSpan={8} style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--pgn-color-text-light)' }}>
                Loading HRMS employees...
              </td>
            </tr>
          )}
          {!isLoading && employees.length === 0 && (
            <tr>
              <td colSpan={8} style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--pgn-color-text-light)' }}>
                {emptyMessage}
              </td>
            </tr>
          )}
          {!isLoading && employees.map((employee, idx) => (
            <tr
              key={`${employee.employeeId}-${employee.employeeCode}`}
              style={{
                borderBottom: idx < employees.length - 1 ? '1px solid var(--pgn-color-gray-100)' : 'none',
              }}
            >
              <td style={{ padding: '12px 16px', color: 'var(--pgn-color-gray-400)', fontWeight: 500 }}>
                {(page - 1) * rowsPerPage + idx + 1}
              </td>
              <td style={{ padding: '12px 16px' }}>
                <UserIdentity
                  name={employee.fullName}
                  badges={['Employee']}
                  size="compact"
                  avatarValue={employee.initials}
                />
              </td>
              <td style={{ padding: '12px 16px', color: 'var(--pgn-color-gray-700)', fontWeight: 600 }}>
                {employee.employeeCode || '-'}
              </td>
              <td style={{ padding: '12px 16px', color: 'var(--pgn-color-gray-700)' }}>
                {employee.cnic || '-'}
              </td>
              <td style={{ padding: '12px 16px', color: 'var(--pgn-color-gray-700)' }}>
                {employee.phone || '-'}
              </td>
              <td style={{ padding: '12px 16px', color: 'var(--pgn-color-gray-700)' }}>
                {employee.employeeId || '-'}
              </td>
              <td style={{ padding: '12px 16px', color: 'var(--pgn-color-primary-base)' }}>
                {employee.email || '-'}
              </td>
              <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                <Button variant="outline-primary" size="sm" onClick={() => onAssign(employee)}>
                  Assign Role
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        borderTop: '1px solid var(--pgn-color-gray-100)',
        background: 'var(--pgn-color-gray-100)',
      }}
      >
        <span style={{ fontSize: '13px', color: 'var(--pgn-color-text-light)' }}>
          Showing <strong>{start}-{end}</strong> of <strong>{totalEmployees}</strong>
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
          >
            <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: '10px' }} />
          </Button>
          <span style={{ fontSize: '13px', color: 'var(--pgn-color-gray-700)', padding: '0 8px' }}>
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
          >
            <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: '10px' }} />
          </Button>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
          color: 'var(--pgn-color-text-light)',
        }}
        >
          Rows per page
          <Form.Control
            as="select"
            size="sm"
            value={rowsPerPage}
            onChange={event => onRowsPerPageChange(Number(event.target.value))}
            style={{ width: 'auto' }}
          >
            {[10, 25, 50, 100].map(value => <option key={value} value={value}>{value}</option>)}
          </Form.Control>
        </div>
      </div>
    </div>
  );
};

HrmsEmployeesTable.propTypes = {
  employees: PropTypes.arrayOf(PropTypes.shape({
    employeeId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    employeeCode: PropTypes.string,
    fullName: PropTypes.string,
    email: PropTypes.string,
    cnic: PropTypes.string,
    phone: PropTypes.string,
    initials: PropTypes.string,
  })).isRequired,
  isLoading: PropTypes.bool.isRequired,
  emptyMessage: PropTypes.string.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  totalEmployees: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onRowsPerPageChange: PropTypes.func.isRequired,
  onAssign: PropTypes.func.isRequired,
};

export default HrmsEmployeesTable;
