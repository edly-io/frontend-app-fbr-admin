import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from 'react-intl';
import ActionMenu from './ActionMenu';

const onEdit = jest.fn();

const renderMenu = (props = {}) => render(
  <IntlProvider locale="en">
    <ActionMenu
      userId={42}
      userStatus="Active"
      onView={jest.fn()}
      onEdit={onEdit}
      onDeactivate={jest.fn()}
      openId={42}
      setOpenId={jest.fn()}
      {...props}
    />
  </IntlProvider>,
);

afterEach(() => jest.clearAllMocks());

describe('ActionMenu edit item', () => {
  it('is a link when a profile URL is given', () => {
    renderMenu({ editHref: 'http://apps.lms.test/profile/u/?for_user=42' });

    const edit = screen.getByRole('link', { name: /edit user/i });

    expect(edit).toHaveAttribute('href', 'http://apps.lms.test/profile/u/?for_user=42');
    expect(edit).toHaveAttribute('target', '_blank');
    expect(edit).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('falls back to the click handler without one', () => {
    renderMenu();

    expect(screen.queryByRole('link', { name: /edit user/i })).toBeNull();
    fireEvent.click(screen.getByText('Edit User'));

    expect(onEdit).toHaveBeenCalled();
  });
});
