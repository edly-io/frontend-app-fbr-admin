import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getAdminConsoleBootstrap,
  createUserProfile,
  assignUserRole,
  bulkImportUsers,
  getReportFilters,
} from './api';
import { getReportsCapabilities } from './permissions';
import { usersQueryKeys } from '../pages/users/data/apiHooks';
import { signupApprovalsQueryKeys } from '../pages/signup-approvals/data/apiHooks';

export const adminConsoleQueryKeys = {
  all: ['adminConsole'],
  bootstrap: ['adminConsole', 'bootstrap'],
};

const REPORT_FILTERS_STALE_TIME = 5 * 60 * 1000;

export const reportFiltersQueryKey = ['reportFilters'];

const retryExceptClientErrors = (failureCount, error) => {
  if ([403, 404].includes(error?.response?.status)) {
    return false;
  }
  return failureCount < 3;
};

/**
 * Loads the shared bootstrap data (caller profile / cities / batches) used to
 * drive the Add User + Bulk Import modals. The original implementation
 * fetched all three with `Promise.all` and fell back all three to defaults
 * if any single request failed; `getAdminConsoleBootstrap` preserves that
 * exact all-or-nothing behavior, so this query never rejects.
 */
export const useAdminConsoleBootstrap = () => useQuery({
  queryKey: adminConsoleQueryKeys.bootstrap,
  queryFn: getAdminConsoleBootstrap,
  retry: retryExceptClientErrors,
});

/**
 * Derives the caller's Reports capabilities from the shared bootstrap query,
 * so page-level gating and sidebar visibility both read from the same
 * capability computation instead of duplicating role checks.
 */
export const useReportsAccess = () => {
  const query = useAdminConsoleBootstrap();

  return {
    ...query,
    capabilities: getReportsCapabilities(query.data?.callerProfile?.roles),
  };
};

export const useReportFilters = ({ enabled = true } = {}) => useQuery({
  queryKey: reportFiltersQueryKey,
  queryFn: getReportFilters,
  staleTime: REPORT_FILTERS_STALE_TIME,
  enabled,
});

export const useCreateUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUserProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.all });
    },
  });
};

export const useAssignUserRoleMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: assignUserRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: signupApprovalsQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.all });
    },
  });
};

export const useBulkImportUsersMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkImportUsers,
    onSuccess: (data, variables) => {
      if (!variables.dryRun) {
        queryClient.invalidateQueries({ queryKey: usersQueryKeys.all });
      }
    },
  });
};
