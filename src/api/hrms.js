import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

const PAYPEOPLE_EMPLOYEES_PATH = '/fbr/api/biodata/v1/users/paypeople-employees/';
const PAYPEOPLE_EMPLOYEE_ASSIGN_ROLE_PATH = '/fbr/api/biodata/v1/users/paypeople-employees/assign-role/';

const getLmsUrl = path => `${getConfig().LMS_BASE_URL}${path}`;

const getInitials = name => (
  (name || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase()
);

const mapPayPeopleEmployee = employee => {
  const firstName = employee?.first_name || employee?.FirstName || '';
  const lastName = employee?.last_name || employee?.LastName || '';
  const email = employee?.email || employee?.EmailAddress || '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || email || 'Unnamed employee';
  const employeeId = employee?.employee_id ?? employee?.EmployeeID;

  return {
    id: employeeId,
    paypeopleEmployeeId: employeeId,
    employeeId,
    employeeCode: employee?.employee_code || employee?.EmployeeCode || '',
    firstName,
    lastName,
    first_name: firstName,
    last_name: lastName,
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
    count: typeof data?.count === 'number' ? data.count : employees.length,
    employees: employees.map(mapPayPeopleEmployee),
  };
};

export const assignHrmsEmployeeRole = async payload => {
  const { data } = await getAuthenticatedHttpClient().post(
    getLmsUrl(PAYPEOPLE_EMPLOYEE_ASSIGN_ROLE_PATH),
    payload,
  );
  return data;
};
