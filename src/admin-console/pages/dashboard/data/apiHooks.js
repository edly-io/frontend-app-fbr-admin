import { useQuery } from '@tanstack/react-query';
import {
  getDashboardAttendanceOverview,
  getDashboardKpis,
  getDashboardNeedsAttention,
  getDashboardSessionDelivery,
  getDashboardUserComposition,
} from './api';

// A landing page an admin bounces in and out of; none of these figures move
// minute to minute.
const DASHBOARD_STALE_TIME = 5 * 60 * 1000;

export const dashboardQueryKeys = {
  all: ['dashboard'],
  kpis: ['dashboard', 'kpis'],
  users: ['dashboard', 'users'],
  sessions: ['dashboard', 'sessions'],
  attendance: ['dashboard', 'attendance'],
  needsAttention: ['dashboard', 'needsAttention'],
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

export const useDashboardAttendanceOverview = ({ enabled = true } = {}) => useQuery({
  queryKey: dashboardQueryKeys.attendance,
  queryFn: getDashboardAttendanceOverview,
  staleTime: DASHBOARD_STALE_TIME,
  enabled,
});

export const useDashboardNeedsAttention = ({ enabled = true } = {}) => useQuery({
  queryKey: dashboardQueryKeys.needsAttention,
  queryFn: getDashboardNeedsAttention,
  staleTime: DASHBOARD_STALE_TIME,
  enabled,
});
