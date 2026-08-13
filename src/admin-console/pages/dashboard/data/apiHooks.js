import { useQuery } from '@tanstack/react-query';
import {
  getDashboardKpis,
  getDashboardSessionDelivery,
  getDashboardUserComposition,
} from './api';

// The dashboard is a landing page an admin bounces in and out of; none of these
// figures move minute to minute, so a short cache keeps navigation instant
// without serving stale numbers.
const DASHBOARD_STALE_TIME = 5 * 60 * 1000;

export const dashboardQueryKeys = {
  all: ['dashboard'],
  kpis: ['dashboard', 'kpis'],
  users: ['dashboard', 'users'],
  sessions: ['dashboard', 'sessions'],
};

export const useDashboardKpis = ({ enabled = true } = {}) => useQuery({
  queryKey: dashboardQueryKeys.kpis,
  queryFn: getDashboardKpis,
  staleTime: DASHBOARD_STALE_TIME,
  enabled,
});

export const useDashboardUserComposition = ({ enabled = true } = {}) => useQuery({
  queryKey: dashboardQueryKeys.users,
  queryFn: getDashboardUserComposition,
  staleTime: DASHBOARD_STALE_TIME,
  enabled,
});

export const useDashboardSessionDelivery = ({ enabled = true } = {}) => useQuery({
  queryKey: dashboardQueryKeys.sessions,
  queryFn: getDashboardSessionDelivery,
  staleTime: DASHBOARD_STALE_TIME,
  enabled,
});
