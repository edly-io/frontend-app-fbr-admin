import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Button, DataTable } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import UserIdentity from '../../components/UserIdentity';
import messages from './messages';

const ROWS_PER_PAGE = 25;

const EmptyValue = () => <span className="hrms-table__empty-value">-</span>;

const EmployeeCell = ({ row }) => {
  const intl = useIntl();
  const employee = row.original;

  return (
    <UserIdentity
      name={employee.fullName}
      badges={[intl.formatMessage(messages.employeeBadge)]}
      size="compact"
      avatarValue={employee.initials}
    />
  );
};

EmployeeCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      fullName: PropTypes.string.isRequired,
      initials: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

const TextCell = ({ value }) => (
  value ? <span>{value}</span> : <EmptyValue />
);

TextCell.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

TextCell.defaultProps = {
  value: '',
};

const EmailCell = ({ value }) => (
  value ? <span className="hrms-table__email">{value}</span> : <EmptyValue />
);

EmailCell.propTypes = {
  value: PropTypes.string,
};

EmailCell.defaultProps = {
  value: '',
};

const ActionCell = ({ row, column }) => {
  const intl = useIntl();

  return (
    <Button
      variant="outline-primary"
      size="sm"
      onClick={() => column.onAssign(row.original)}
    >
      {intl.formatMessage(messages.assignRoleButton)}
    </Button>
  );
};

ActionCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({}).isRequired,
  }).isRequired,
  column: PropTypes.shape({
    onAssign: PropTypes.func.isRequired,
  }).isRequired,
};

const HrmsEmployeesTable = ({
  employees,
  emptyMessage,
  onAssign,
}) => {
  const intl = useIntl();

  const columns = useMemo(() => [
    {
      Header: intl.formatMessage(messages.columnEmployee),
      accessor: 'fullName',
      Cell: EmployeeCell,
    },
    {
      Header: intl.formatMessage(messages.columnEmployeeCode),
      accessor: 'employeeCode',
      Cell: TextCell,
    },
    {
      Header: intl.formatMessage(messages.columnCnic),
      accessor: 'cnic',
      Cell: TextCell,
    },
    {
      Header: intl.formatMessage(messages.columnPhone),
      accessor: 'phone',
      Cell: TextCell,
    },
    {
      Header: intl.formatMessage(messages.columnEmployeeId),
      accessor: 'employeeId',
      Cell: TextCell,
    },
    {
      Header: intl.formatMessage(messages.columnEmail),
      accessor: 'email',
      Cell: EmailCell,
    },
    {
      Header: intl.formatMessage(messages.columnAction),
      id: 'action',
      accessor: 'id',
      disableSortBy: true,
      onAssign,
      Cell: ActionCell,
    },
  ], [intl, onAssign]);

  return (
    <div className="hrms-table">
      <DataTable
        isSortable
        isPaginated
        initialState={{ pageSize: ROWS_PER_PAGE, pageIndex: 0 }}
        data={employees}
        itemCount={employees.length}
        columns={columns}
      >
        <DataTable.Table />
        <DataTable.EmptyTable content={emptyMessage} />
        {employees.length > ROWS_PER_PAGE && <DataTable.TableFooter />}
      </DataTable>
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
  emptyMessage: PropTypes.string.isRequired,
  onAssign: PropTypes.func.isRequired,
};

export default HrmsEmployeesTable;
