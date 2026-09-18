import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from 'react-intl';
import ViewUserModal from './ViewUserModal';

jest.mock('@edx/frontend-platform', () => ({
  getConfig: () => ({ LMS_BASE_URL: 'http://lms.test' }),
}));

jest.mock('../UserIdentity', () => /* eslint-disable react/prop-types */ function MockUserIdentity({ name }) {
  return <div>{name}</div>;
});

const USER = {
  id: 1,
  full_name: 'Adeel Farooq',
  name: 'Adeel Farooq',
  email: 'trainee01@fbr.test',
  initials: 'AF',
  status: 'Active',
};

const onClose = jest.fn();
const onEdit = jest.fn();

const renderModal = () => render(
  <IntlProvider locale="en">
    <ViewUserModal user={USER} onClose={onClose} onEdit={onEdit} />
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
});
