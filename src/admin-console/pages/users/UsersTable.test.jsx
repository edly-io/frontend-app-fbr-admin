import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from 'react-intl';
import UsersTable from './UsersTable';

jest.mock('@edx/frontend-platform', () => ({
  getConfig: () => ({
    LMS_BASE_URL: 'http://lms.test',
    ACCOUNT_PROFILE_URL: 'http://apps.lms.test/profile',
  }),
}));

jest.mock('@edly-io/frontend-component-fbr', () => /* eslint-disable react/prop-types */ ({
  UserIdentity: function MockUserIdentity({ name }) { return <span>{name}</span>; },
}));

const USER = {
  id: 42, name: 'Adeel Farooq', email: 'trainee01@fbr.test', status: 'Active', roleLabels: ['Trainee'],
};

const renderTable = (props = {}) => render(
  <IntlProvider locale="en">
    <UsersTable
      isLoading={false}
      pageUsers={[USER]}
      rowNumberOffset={0}
      openMenuId={null}
      setOpenMenuId={jest.fn()}
      onView={jest.fn()}
      onEdit={jest.fn()}
      onDeactivate={jest.fn()}
      page={1}
      totalPages={1}
      start={1}
      end={1}
      total={1}
      rowsPerPage={10}
      onPageChange={jest.fn()}
      onRowsPerPageChange={jest.fn()}
      {...props}
    />
  </IntlProvider>,
);

afterEach(() => jest.clearAllMocks());

describe('UsersTable edit action', () => {
  it('is a link to the profile MFE, so it can be copied or opened in a new tab', () => {
    renderTable();

    const edit = screen.getByRole('link', { name: /edit/i });

    expect(edit).toHaveAttribute('href', 'http://apps.lms.test/profile/u/?for_user=42');
    expect(edit).toHaveAttribute('target', '_blank');
    expect(edit).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
