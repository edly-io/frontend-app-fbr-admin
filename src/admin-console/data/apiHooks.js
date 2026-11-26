import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import isBulkImportJobActive from './bulkImportJob';

import {
  getAdminConsoleBootstrap,
  createUserProfile,
  assignUserRole,
  bulkImportUsers,
  getBulkImportFormat,
  getBulkImportJob,
  getBulkImportJobs,
  getReportFilters,
  createBatch,
  addUserRole,
  getCities,
  getBatches,
} from './api';
import { getReportsCapabilities } from './permissions';
import { usersQueryKeys } from '../pages/users/data/apiHooks';
import { signupApprovalsQueryKeys } from '../pages/signup-approvals/data/apiHooks';

export const adminConsoleQueryKeys = {
  all: ['adminConsole'],
  bootstrap: ['adminConsole', 'bootstrap'],
  roleCities: ['adminConsole', 'add-role', 'cities'],
  roleBatches: cityId => ['adminConsole', 'add-role', 'batches', cityId],
  bulkImportFormat: ['adminConsole', 'bulk-import', 'format'],
  bulkImportJobs: ['adminConsole', 'bulk-import', 'jobs'],
  bulkImportJob: jobId => ['adminConsole', 'bulk-import', 'jobs', jobId],
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

export const useBulkImportFormat = () => useQuery({
  queryKey: adminConsoleQueryKeys.bulkImportFormat,
  queryFn: getBulkImportFormat,
  retry: retryExceptClientErrors,
});

export const useAddRoleCities = ({ enabled }) => useQuery({
  queryKey: adminConsoleQueryKeys.roleCities,
  queryFn: getCities,
  enabled,
  retry: retryExceptClientErrors,
});

export const useAddRoleBatches = ({ cityId, enabled }) => useQuery({
  queryKey: adminConsoleQueryKeys.roleBatches(cityId),
  queryFn: () => getBatches(cityId),
  enabled: enabled && !!cityId,
  retry: retryExceptClientErrors,
});

/**
 * Create a batch inline (used by the "+ New batch" affordance on the
 * Add User modal). Optimistically appends the new batch to the bootstrap
 * cache so the picker refreshes without a page reload; also invalidates
 * bootstrap so any other consumer stays in sync.
 */
export const useCreateBatchMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBatch,
    onSuccess: (batch) => {
      queryClient.setQueryData(adminConsoleQueryKeys.bootstrap, (prev) => {
        if (!prev) { return prev; }
        // Server responds with `{ id, name, city: {id, name} }`. The bootstrap
        // cache stores batches in the same shape.
        return { ...prev, batches: [...(prev.batches ?? []), batch] };
      });
      queryClient.invalidateQueries({ queryKey: adminConsoleQueryKeys.bootstrap });
    },
  });
};

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

export const useAddUserRoleMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addUserRole,
    onSuccess: (profile) => {
      // The detail dialog treats this full response as the new source of truth;
      // the list is invalidated so every other cached user representation also
      // picks up the new roles and role-specific profile.
      queryClient.setQueryData(usersQueryKeys.detail(profile.id), profile);
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.all });
    },
  });
};

export const useBulkImportUsersMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkImportUsers,
    onSuccess: (job, variables) => {
      if (!variables.dryRun) {
        // The 202 already describes the new job: seed its query so the modal
        // and the toolbar follow it without fetching it first.
        queryClient.setQueryData(adminConsoleQueryKeys.bulkImportJob(job.id), job);
        queryClient.invalidateQueries({ queryKey: adminConsoleQueryKeys.bulkImportJobs });
      }
    },
  });
};

const BULK_IMPORT_POLL_INTERVAL = 5000;

/**
 * One bulk import job, polled every 5 s while it is active. Every caller
 * (the Import dialog, the toolbar) shares this query, so one request serves
 * them all. The server reports a job still active after 10 minutes as failed,
 * so polling always ends. When a poll sees the job finish, the users list
 * and Recent imports are refreshed once.
 */
export const useBulkImportJob = (jobId) => {
  const queryClient = useQueryClient();
  const queryKey = adminConsoleQueryKeys.bulkImportJob(jobId);
  return useQuery({
    queryKey,
    queryFn: async () => {
      const wasActive = isBulkImportJobActive(queryClient.getQueryData(queryKey));
      const job = await getBulkImportJob(jobId);
      if (wasActive && !isBulkImportJobActive(job)) {
        queryClient.invalidateQueries({ queryKey: usersQueryKeys.all });
        queryClient.invalidateQueries({ queryKey: adminConsoleQueryKeys.bulkImportJobs });
      }
      return job;
    },
    enabled: Boolean(jobId),
    refetchInterval: ({ state }) => (
      isBulkImportJobActive(state.data) ? BULK_IMPORT_POLL_INTERVAL : false
    ),
  });
};

/**
 * The caller's recent imports, as summaries without failed rows. Loaded once;
 * it is refreshed when an import starts or finishes, never on a timer.
 */
export const useBulkImportJobs = () => useQuery({
  queryKey: adminConsoleQueryKeys.bulkImportJobs,
  queryFn: getBulkImportJobs,
});
