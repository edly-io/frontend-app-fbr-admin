import React from 'react';
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import useAdminNavigation from './useAdminNavigation';
import { useAdminConsoleBootstrap } from '../../data/apiHooks';
import { useSignupApprovals } from '../../pages/signup-approvals/data/apiHooks';
import { useBiodataEditRequests } from '../../pages/biodata-edit-requests/data/apiHooks';

// ── Mocks ────────────────────────────────────────────────────────────────────
// Only the queries are stubbed: `NAV_SECTIONS` and the capability model are the
// real ones, so this covers the wiring the rail and the sheet actually share.

jest.mock('../../data/apiHooks', () => ({ useAdminConsoleBootstrap: jest.fn() }));
jest.mock('../../pages/signup-approvals/data/apiHooks', () => ({ useSignupApprovals: jest.fn() }));
jest.mock('../../pages/biodata-edit-requests/data/apiHooks', () => ({ useBiodataEditRequests: jest.fn() }));

const setUp = ({
  roles = [], approvals = 0, editRequests = 0, route = '/dashboard',
} = {}) => {
  useAdminConsoleBootstrap.mockReturnValue({ data: { callerProfile: { roles } } });
  useSignupApprovals.mockReturnValue({ data: { total: approvals } });
  useBiodataEditRequests.mockReturnValue({ data: { total: editRequests } });

  return renderHook(() => useAdminNavigation(), {
    wrapper: ({ children }) => <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>,
  });
};

const sectionIds = result => result.current.sections.map(section => section.id);
const itemIds = (result, sectionId) => result.current.sections
  .find(section => section.id === sectionId)?.items.map(item => item.id);

afterEach(() => jest.clearAllMocks());

// ── Tests ────────────────────────────────────────────────────────────────────

describe('useAdminNavigation permissions', () => {
  it('hides the whole Reports section from a caller without reports access', () => {
    const { result } = setUp({ roles: ['instructor'] });

    expect(sectionIds(result)).not.toContain('reports');
  });

  it('shows the Reports section to a reports admin', () => {
    const { result } = setUp({ roles: ['super_admin'] });

    expect(sectionIds(result)).toContain('reports');
    expect(itemIds(result, 'reports')).toEqual(['program', 'sessions-instructor', 'attendance']);
  });

  it('filters role-gated items without dropping their section', () => {
    const { result } = setUp({ roles: ['instructor'] });

    // `hrms` is role-gated; the rest of Administration stays.
    expect(sectionIds(result)).toContain('administration');
    expect(itemIds(result, 'administration')).not.toContain('hrms');

    const { result: adminResult } = setUp({ roles: ['data_admin'] });
    expect(itemIds(adminResult, 'administration')).toContain('hrms');
  });

  it('treats roles case-insensitively', () => {
    const { result } = setUp({ roles: ['DATA_ADMIN'] });

    expect(itemIds(result, 'administration')).toContain('hrms');
  });

  it('survives a bootstrap response that has not arrived yet', () => {
    useAdminConsoleBootstrap.mockReturnValue({ data: undefined });
    useSignupApprovals.mockReturnValue({ data: undefined });
    useBiodataEditRequests.mockReturnValue({ data: undefined });

    const { result } = renderHook(() => useAdminNavigation(), {
      wrapper: ({ children }) => <MemoryRouter initialEntries={['/users']}>{children}</MemoryRouter>,
    });

    expect(sectionIds(result)).toContain('administration');
    expect(result.current.totalBadgeCount).toBe(0);
  });
});

describe('useAdminNavigation badges', () => {
  it('keys pending counts by nav item id', () => {
    const { result } = setUp({ roles: ['super_admin'], approvals: 4, editRequests: 2 });

    expect(result.current.badgeCounts).toMatchObject({
      'signup-approvals': 4,
      'biodata-edit-requests': 2,
    });
  });

  it('rolls the counts up for the context bar', () => {
    const { result } = setUp({ roles: ['super_admin'], approvals: 4, editRequests: 2 });

    expect(result.current.totalBadgeCount).toBe(6);
  });

  it('counts nothing when there is no pending work', () => {
    const { result } = setUp({ roles: ['super_admin'] });

    expect(result.current.totalBadgeCount).toBe(0);
  });
});

describe('useAdminNavigation active route', () => {
  it('resolves the item and section for the current route', () => {
    const { result } = setUp({ roles: ['super_admin'], route: '/sessions-reports' });

    expect(result.current.activeItem?.id).toBe('sessions-instructor');
    expect(result.current.activeSectionId).toBe('reports');
  });

  it('matches on the first path segment only', () => {
    const { result } = setUp({ roles: ['super_admin'], route: '/documents/42/edit' });

    expect(result.current.activeItem?.id).toBe('documents');
    expect(result.current.activeSectionId).toBe('communications');
  });

  it('reports no active item for a route outside the navigation', () => {
    const { result } = setUp({ roles: ['super_admin'], route: '/audit-log' });

    expect(result.current.activeItem).toBeNull();
    expect(result.current.activeSectionId).toBeNull();
  });

  it('reports no active item for a route the caller cannot reach', () => {
    const { result } = setUp({ roles: ['instructor'], route: '/program-reports' });

    expect(result.current.activeItem).toBeNull();
  });
});
