import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from 'react-intl';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AdminConsolePage from './AdminConsolePage';
import useAdminNavigation from './components/navigation/useAdminNavigation';

jest.mock('./components/navigation/useAdminNavigation');

const icon = { iconName: 'stub', prefix: 'fas', icon: [1, 1, [], '', ''] };

const sections = [
  {
    id: 'communications',
    items: [
      { id: 'announcements', path: '/announcements', icon },
      { id: 'documents', path: '/documents', icon },
    ],
  },
];

const renderShell = () => render(
  <IntlProvider locale="en">
    <MemoryRouter initialEntries={['/documents']}>
      <Routes>
        <Route path="/" element={<AdminConsolePage />}>
          <Route path="documents" element={<p>Documents page</p>} />
        </Route>
      </Routes>
    </MemoryRouter>
  </IntlProvider>,
);

const rail = () => screen.getByRole('complementary');
const contextBarTrigger = () => screen.getByRole('button', { name: /Change section/ });

beforeEach(() => {
  window.matchMedia = jest.fn(query => ({
    media: query,
    matches: query === '(max-width: 992px)',
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }));

  useAdminNavigation.mockReturnValue({
    sections,
    badgeCounts: {},
    totalBadgeCount: 0,
    activeItem: sections[0].items[1],
    activeSectionId: 'communications',
  });
});

afterEach(() => jest.clearAllMocks());

describe('AdminConsolePage shell', () => {
  it('renders the routed page in the content area', () => {
    renderShell();

    expect(screen.getByText('Documents page')).toBeInTheDocument();
  });

  it('keeps both navigations mounted so the breakpoint swap stays a CSS concern', () => {
    // Neither is conditionally rendered on a media query in JS: a resize must
    // not remount the navigation or tear down the sheet's state.
    renderShell();

    expect(rail()).toBeInTheDocument();
    expect(contextBarTrigger()).toBeInTheDocument();
  });

  it('drives both navigations from the same nav data', () => {
    renderShell();

    expect(within(rail()).getByRole('link', { name: /Documents/ })).toBeInTheDocument();
    expect(contextBarTrigger()).toHaveAccessibleName(
      'Change section. Currently viewing Communications, Documents.',
    );
  });
});
