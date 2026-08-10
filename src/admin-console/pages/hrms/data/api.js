import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getInitials, getLmsUrl } from '../../../data/api';

export const PAYPEOPLE_EMPLOYEES_PATH = '/fbr/api/biodata/v1/users/paypeople-employees/';
export const PAYPEOPLE_EMPLOYEE_ASSIGN_ROLE_PATH = '/fbr/api/biodata/v1/users/paypeople-employees/assign-role/';

const getFullName = (firstName, lastName, email) => (
  [firstName, lastName].filter(Boolean).join(' ') || email || 'Unnamed employee'
);

export const mapPayPeopleEmployee = employee => {
  const firstName = employee?.first_name || employee?.FirstName || '';
  const lastName = employee?.last_name || employee?.LastName || '';
  const email = employee?.email || employee?.EmailAddress || '';
  const employeeId = employee?.employee_id ?? employee?.EmployeeID;
  const fullName = getFullName(firstName, lastName, email);

  return {
    id: String(employeeId),
    paypeopleEmployeeId: employeeId,
    employeeId,
    employeeCode: employee?.employee_code || employee?.EmployeeCode || '',
    firstName,
    lastName,
    fullName,
    email,
    cnic: employee?.cnic || '',
    phone: employee?.phone || '',
    initials: getInitials(fullName),
  };
};

export const getHrmsEmployees = async () => {
  const { data } = await getAuthenticatedHttpClient().get(getLmsUrl(PAYPEOPLE_EMPLOYEES_PATH));
  const employees = Array.isArray(data?.employees) ? data.employees : [];

  return {
    employees: employees.map(mapPayPeopleEmployee),
    total: typeof data?.count === 'number' ? data.count : employees.length,
  };
};

export const assignHrmsEmployeeRole = async payload => {
  const { data } = await getAuthenticatedHttpClient().post(
    getLmsUrl(PAYPEOPLE_EMPLOYEE_ASSIGN_ROLE_PATH),
    payload,
  );
  return data;
};
