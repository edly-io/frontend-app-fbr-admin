import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router-dom';
import AdminNavLinks, { NAV_ITEM_LABEL_MESSAGES, SECTION_TITLE_MESSAGES } from './AdminNavLinks';
import { NAV_SECTIONS } from '../../constants';

// ── Fixtures ─────────────────────────────────────────────────────────────────
// Absolute paths so `NavLink`'s active matching does not depend on a
// surrounding route hierarchy.

const icon = { iconName: 'stub', prefix: 'fas', icon: [1, 1, [], '', ''] };

const sections = [
  {
    id: 'administration',
    items: [
      { id: 'dashboard', path: '/dashboard', icon },
      { id: 'signup-approvals', path: '/signup-approvals', icon },
    ],
  },
  {
    id: 'communications',
    items: [{ id: 'documents', path: '/documents', icon }],
  },
];

const renderLinks = (props = {}, route = '/dashboard') => render(
  <IntlProvider locale="en">
    <MemoryRouter initialEntries={[route]}>
      <AdminNavLinks sections={sections} {...props} />
    </MemoryRouter>
  </IntlProvider>,
);

// ── Tests ────────────────────────────────────────────────────────────────────

describe('AdminNavLinks message coverage', () => {
  // `AdminNavLinks` resolves every label through these maps by nav item id, so
  // a nav item added to `constants.js` without a matching entry hands
  // `formatMessage` an undefined descriptor and blows up the whole rail and
  // sheet at render time.
  const navItemIds = NAV_SECTIONS.flatMap(section => section.items).map(item => item.id);

  it.each(navItemIds)('has a label message for the "%s" nav item', (id) => {
    expect(NAV_ITEM_LABEL_MESSAGES[id]).toBeDefined();
  });

  it.each(NAV_SECTIONS.map(section => section.id))('has a title message for the "%s" section', (id) => {
    expect(SECTION_TITLE_MESSAGES[id]).toBeDefined();
  });

  it('renders every configured nav item without a missing-message crash', () => {
    renderLinks({ sections: NAV_SECTIONS }, '/');

    navItemIds.forEach((id) => {
      const { defaultMessage } = NAV_ITEM_LABEL_MESSAGES[id];
      expect(screen.getByText(defaultMessage)).toBeInTheDocument();
    });
  });
});

describe('AdminNavLinks', () => {
  it('groups items under their section headings', () => {
    renderLinks();

    expect(screen.getByText('Administration')).toBeInTheDocument();
    expect(screen.getByText('Communications')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Dashboard/ })).toHaveAttribute('href', '/dashboard');
    expect(screen.getByRole('link', { name: /Documents/ })).toHaveAttribute('href', '/documents');
  });

  it('shows a badge only for items with pending work', () => {
    renderLinks({ badgeCounts: { 'signup-approvals': 3, dashboard: 0 } });

    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('marks the active row for screen readers only when asked', () => {
    const { unmount } = renderLinks({ withActiveIndicator: true }, '/dashboard');

    expect(screen.getByRole('link', { name: /Dashboard/ })).toHaveTextContent('Current page');
    expect(screen.getByRole('link', { name: /Documents/ })).not.toHaveTextContent('Current page');

    unmount();

    // The desktop rail leaves it off: colour and weight already carry the state
    // there, and the check icon is sheet-only chrome.
    renderLinks({}, '/dashboard');
    expect(screen.getByRole('link', { name: /Dashboard/ })).not.toHaveTextContent('Current page');
  });

  it('gives the active row its own class', () => {
    renderLinks({}, '/documents');

    expect(screen.getByRole('link', { name: /Documents/ }).className)
      .toContain('admin-sidebar__nav-link--active');
    expect(screen.getByRole('link', { name: /Dashboard/ }).className)
      .not.toContain('admin-sidebar__nav-link--active');
  });

  it('notifies its host on navigation so the sheet can dismiss itself', () => {
    const onNavigate = jest.fn();
    renderLinks({ onNavigate });

    fireEvent.click(screen.getByRole('link', { name: /Documents/ }));

    expect(onNavigate).toHaveBeenCalledTimes(1);
  });

  it('does not require a badge map', () => {
    expect(() => renderLinks()).not.toThrow();
  });
});
