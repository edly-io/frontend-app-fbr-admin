import { useQuery } from '@tanstack/react-query';

import { getAuditLogs } from './auditLogApi';

export const auditLogQueryKeys = {
  all: ['auditLogs'],
  list: params => ['auditLogs', 'list', params],
  history: params => ['auditLogs', 'history', params],
};

const retryExceptClientErrors = (failureCount, error) => {
  if ([403, 404].includes(error?.response?.status)) {
    return false;
  }
  return failureCount < 3;
};

/**
 * An audit trail must not be served from a warm cache: the app-wide client sets
 * a one hour `staleTime`, so these queries opt out of it to keep the previous
 * fetch-on-every-change behavior.
 */
const auditLogQueryOptions = params => ({
  queryFn: () => getAuditLogs(params),
  enabled: !!params.appLabel,
  retry: retryExceptClientErrors,
  placeholderData: previousData => previousData,
  staleTime: 0,
});

export const useAuditLogs = params => useQuery({
  queryKey: auditLogQueryKeys.list(params),
  ...auditLogQueryOptions(params),
});

export const useRecordHistory = params => useQuery({
  queryKey: auditLogQueryKeys.history(params),
  ...auditLogQueryOptions(params),
});
