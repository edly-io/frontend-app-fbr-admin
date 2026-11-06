import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from 'react-intl';
import ViewUserModal from './ViewUserModal';

jest.mock('@edx/frontend-platform', () => ({
  getConfig: () => ({ LMS_BASE_URL: 'http://lms.test' }),
}));

jest.mock('@edly-io/frontend-component-fbr', () => ({
  /* eslint-disable react/prop-types */
  UserIdentity: function MockUserIdentity({ name }) {
    return <div>{name}</div>;
  },
}));

const USER = {
  id: 1,
  full_name: 'Adeel Farooq',
  name: 'Adeel Farooq',
  email: 'trainee01@fbr.test',
  initials: 'AF',
  status: 'Active',
  statusValue: 'active',
  roles: ['trainee'],
};

const onClose = jest.fn();
const onEdit = jest.fn();

const renderModal = ({ user = USER, callerRoles = [] } = {}) => render(
  <IntlProvider locale="en">
    <ViewUserModal
      user={user}
      callerProfile={{ roles: callerRoles, city: { id: 1 } }}
      onClose={onClose}
      onEdit={onEdit}
    />
  </IntlProvider>,
);

afterEach(() => jest.clearAllMocks());

describe('ViewUserModal', () => {
  it('closes from the header close icon', () => {
    const { baseElement } = renderModal();

    fireEvent.click(baseElement.querySelector('.view-user-modal__close-btn'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes from the footer button', () => {
    renderModal();

    fireEvent.click(screen.getByRole('button', { name: /close/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes and hands the user over when editing', () => {
    renderModal();

    fireEvent.click(screen.getByRole('button', { name: /edit user/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onEdit).toHaveBeenCalledWith(USER);
  });

  it('renders nothing without a user', () => {
    const { baseElement } = render(
      <IntlProvider locale="en">
        <ViewUserModal user={null} onClose={onClose} onEdit={onEdit} />
      </IntlProvider>,
    );

    expect(baseElement.querySelector('.view-user-modal')).toBeNull();
  });

  it.each(['data_admin', 'middle_admin', 'super_admin'])(
    'shows Add instructor role to a %s viewing a trainee',
    (callerRole) => {
      renderModal({ callerRoles: [callerRole] });

      expect(screen.getByRole('button', { name: /add instructor role/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /add trainee role/i })).not.toBeInTheDocument();
    },
  );

  it('offers only the trainee role when the target is an instructor', () => {
    renderModal({
      callerRoles: ['data_admin'],
      user: { ...USER, roles: ['instructor'] },
    });

    expect(screen.getByRole('button', { name: /add trainee role/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /add instructor role/i })).not.toBeInTheDocument();
  });

  it('hides Add role from a non-admin caller', () => {
    renderModal({ callerRoles: ['instructor'] });

    expect(screen.queryByRole('button', { name: /add .* role/i })).not.toBeInTheDocument();
  });

  it('hides Add role when the target has no roles', () => {
    renderModal({ callerRoles: ['data_admin'], user: { ...USER, roles: [] } });

    expect(screen.queryByRole('button', { name: /add .* role/i })).not.toBeInTheDocument();
  });

  it('hides Add role when the target has an admin role', () => {
    renderModal({ callerRoles: ['super_admin'], user: { ...USER, roles: ['data_admin'] } });

    expect(screen.queryByRole('button', { name: /add .* role/i })).not.toBeInTheDocument();
  });

  it('hides Add role when the target is deactivated', () => {
    renderModal({
      callerRoles: ['data_admin'],
      user: { ...USER, status: 'Deactivated', statusValue: 'deactivated' },
    });

    expect(screen.queryByRole('button', { name: /add .* role/i })).not.toBeInTheDocument();
  });

  it('hides Add role when the target already holds both supported roles', () => {
    renderModal({
      callerRoles: ['data_admin'],
      user: { ...USER, roles: ['trainee', 'instructor'] },
    });

    expect(screen.queryByRole('button', { name: /add .* role/i })).not.toBeInTheDocument();
  });
});
