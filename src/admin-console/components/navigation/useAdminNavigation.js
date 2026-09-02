import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { NAV_SECTIONS } from '../../constants';
import { useAdminConsoleBootstrap } from '../../data/apiHooks';
import { getReportsCapabilities } from '../../data/permissions';
import { useSignupApprovals } from '../../pages/signup-approvals/data/apiHooks';
import { useBiodataEditRequests } from '../../pages/biodata-edit-requests/data/apiHooks';

const SIGNUP_APPROVALS_ITEM_ID = 'signup-approvals';
const BIODATA_EDIT_REQUESTS_ITEM_ID = 'biodata-edit-requests';

const normalizeRole = role => String(role || '').toLowerCase();

const canAccessNavItem = (item, roles, capabilities) => {
  if (item.capabilityKey) {
    return Boolean(capabilities[item.capabilityKey]);
  }

  if (!item.allowedRoles) {
    return true;
  }

  const normalizedRoles = roles.map(normalizeRole);
  return item.allowedRoles.some(role => normalizedRoles.includes(normalizeRole(role)));
};

// Every console route is a single segment under the app's basename, which is
// what each nav item's `path` holds.
const getActivePathSegment = pathname => pathname.replace(/^\/+/, '').split('/')[0];

/**
 * Nav data shared by the desktop sidebar and the mobile context bar / sheet:
 * permission-filtered sections, pending-work badge counts and the item the
 * current route belongs to. The badge queries are keyed identically in both
 * consumers, so React Query dedupes them into one request per count.
 */
const useAdminNavigation = () => {
  const { pathname } = useLocation();

  const { data: approvalsData } = useSignupApprovals({ page: 1, pageSize: 1, search: '' });
  const { data: editRequestsData } = useBiodataEditRequests({ page: 1, pageSize: 1, statusFilter: 'pending' });
  const { data: bootstrapData } = useAdminConsoleBootstrap();

  const callerRoles = bootstrapData?.callerProfile?.roles;
  const pendingApprovalsCount = approvalsData?.total ?? 0;
  const pendingEditRequestsCount = editRequestsData?.total ?? 0;

  const sections = useMemo(() => {
    const roles = callerRoles || [];
    const capabilities = getReportsCapabilities(roles);

    return NAV_SECTIONS
      .map(section => ({
        ...section,
        items: section.items.filter(item => canAccessNavItem(item, roles, capabilities)),
      }))
      .filter(section => section.items.length > 0);
  }, [callerRoles]);

  const badgeCounts = useMemo(() => ({
    [SIGNUP_APPROVALS_ITEM_ID]: pendingApprovalsCount,
    [BIODATA_EDIT_REQUESTS_ITEM_ID]: pendingEditRequestsCount,
  }), [pendingApprovalsCount, pendingEditRequestsCount]);

  // Rolled up from visible items only, so the context bar never advertises
  // pending work behind a nav item the caller cannot open.
  const totalBadgeCount = useMemo(() => sections.reduce(
    (total, section) => total + section.items.reduce(
      (sectionTotal, item) => sectionTotal + (badgeCounts[item.id] || 0),
      0,
    ),
    0,
  ), [sections, badgeCounts]);

  const activeSegment = getActivePathSegment(pathname);
  const activeMatch = useMemo(() => sections
    .flatMap(section => section.items.map(item => ({ section, item })))
    .find(({ item }) => item.path === activeSegment) || null, [sections, activeSegment]);

  return {
    sections,
    badgeCounts,
    totalBadgeCount,
    activeItem: activeMatch?.item || null,
    activeSectionId: activeMatch?.section.id || null,
  };
};

export default useAdminNavigation;
