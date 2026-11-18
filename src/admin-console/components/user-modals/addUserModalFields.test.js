import { getCreateFieldsForRole } from './addUserModalFields';

const findCnicField = (role, traineeType) => getCreateFieldsForRole(role, traineeType, true)
  .flat()
  .find(field => field.id === 'cnic');

describe('getCreateFieldsForRole', () => {
  it.each([
    ['super_admin', undefined],
    ['middle_admin', undefined],
    ['data_admin', undefined],
    ['instructor', undefined],
    ['trainee', 'stp'],
    ['trainee', 'dst_ist'],
  ])('shows CNIC as optional for %s %s', (role, traineeType) => {
    const cnic = findCnicField(role, traineeType);

    expect(cnic).toBeDefined();
    expect(cnic.required).toBeFalsy();
  });
});
