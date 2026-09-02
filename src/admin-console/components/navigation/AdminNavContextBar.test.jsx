import React from 'react';
import {
  render, screen, fireEvent, act, within,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router-dom';
import AdminNavContextBar from './AdminNavContextBar';
import useAdminNavigation from './useAdminNavigation';

// ── Mocks ────────────────────────────────────────────────────────────────────
// The nav data is covered by `useAdminNavigation.test.jsx`; here it is a fixture
// so the assertions are about what the bar does with it. The sheet is the real
// one, since "the trigger opens and dismisses the sheet" is the behaviour.

jest.mock('./useAdminNavigation');

const icon = { iconName: 'stub', prefix: 'fas', icon: [1, 1, [], '', ''] };

const sections = [
  {
    id: 'reports',
    items: [
      { id: 'program', path: '/program-reports', icon },
      { id: 'attendance', path: '/attendance-reports', icon },
    ],
  },
];

const setUp = ({
  activeItem = sections[0].items[0],
  activeSectionId = 'reports',
  badgeCounts = {},
  totalBadgeCount = 0,
} = {}) => {
  useAdminNavigation.mockReturnValue({
    sections, badgeCounts, totalBadgeCount, activeItem, activeSectionId,
  });

  return render(
    <IntlProvider locale="en">
      <MemoryRouter initialEntries={['/program-reports']}>
        <AdminNavContextBar />
      </MemoryRouter>
    </IntlProvider>,
  );
};

const trigger = () => screen.getByRole('button', { name: /Change section/ });
const sheetTitle = () => screen.queryByRole('heading', { name: 'Go to section' });

beforeEach(() => {
  jest.useFakeTimers();
  window.matchMedia = jest.fn(query => ({
    media: query,
    matches: query === '(max-width: 992px)',
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }));
});

afterEach(() => {
  act(() => { jest.runOnlyPendingTimers(); });
  jest.useRealTimers();
  jest.clearAllMocks();
});

// ── Tests ────────────────────────────────────────────────────────────────────

describe('AdminNavContextBar trail', () => {
  it('shows the section and page for the current route', () => {
    setUp();

    expect(screen.getByText('Reports')).toBeInTheDocument();
    expect(screen.getByText('Program')).toBeInTheDocument();
  });

  it('falls back to a prompt on routes outside the navigation', () => {
    setUp({ activeItem: null, activeSectionId: null });

    expect(screen.getByText('Select a section')).toBeInTheDocument();
    // No section of its own, so the trail still needs a left-hand label.
    expect(screen.getByText('Administration')).toBeInTheDocument();
  });

  it('spells the trail out in the trigger\'s accessible name', () => {
    setUp();

    expect(trigger()).toHaveAccessibleName('Change section. Currently viewing Reports, Program.');
  });
});

describe('AdminNavContextBar pending work', () => {
  it('rolls the count into the badge and the accessible name', () => {
    setUp({ totalBadgeCount: 2 });

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(trigger()).toHaveAccessibleName(/2 items need attention\./);
  });

  it('hides the badge when nothing is pending', () => {
    setUp({ totalBadgeCount: 0 });

    expect(screen.queryByText('0')).not.toBeInTheDocument();
    expect(trigger()).toHaveAccessibleName('Change section. Currently viewing Reports, Program.');
  });

  it('keeps the badge out of the accessible name, which already carries the count', () => {
    setUp({ totalBadgeCount: 2 });

    expect(screen.getByText('2')).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('AdminNavContextBar sheet', () => {
  it('opens the navigation sheet from the trigger', () => {
    setUp({ badgeCounts: { attendance: 1 } });

    // Held by reference: once the sheet is up, Paragon's focus lock hides the
    // rest of the document from assistive tech, so the trigger can no longer be
    // found by role.
    const triggerEl = trigger();

    expect(sheetTitle()).not.toBeInTheDocument();
    expect(triggerEl).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(triggerEl);

    expect(sheetTitle()).toBeInTheDocument();
    expect(triggerEl).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: /Attendance/ })).toBeInTheDocument();
  });

  it('closes again on a second press, after the slide-out has played', () => {
    setUp();

    const triggerEl = trigger();

    fireEvent.click(triggerEl);
    fireEvent.click(triggerEl);

    // Still mounted for the animation, but no longer advertised as open.
    expect(triggerEl).toHaveAttribute('aria-expanded', 'false');
    expect(sheetTitle()).toBeInTheDocument();

    act(() => { jest.advanceTimersByTime(200); });

    expect(sheetTitle()).not.toBeInTheDocument();
  });

  it('dismisses itself when a destination is chosen', () => {
    setUp();

    fireEvent.click(trigger());
    fireEvent.click(within(screen.getByRole('navigation')).getByRole('link', { name: /Attendance/ }));

    act(() => { jest.advanceTimersByTime(200); });

    expect(sheetTitle()).not.toBeInTheDocument();
  });

  it('offers a close control inside the sheet', () => {
    setUp();

    fireEvent.click(trigger());
    fireEvent.click(screen.getByRole('button', { name: 'Close section menu' }));

    act(() => { jest.advanceTimersByTime(200); });

    expect(sheetTitle()).not.toBeInTheDocument();
  });

  it('names the sheet nav after its heading', () => {
    setUp();

    fireEvent.click(trigger());

    expect(screen.getByRole('navigation')).toHaveAccessibleName('Go to section');
  });
});
