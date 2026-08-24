import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getUserDetail, getUsers, probeSuperAdminAccess, updateUserStatus,
} from './api';

export const usersQueryKeys = {
  all: ['users'],
  list: params => ['users', 'list', params],
  superAdminProbe: ['users', 'super-admin-probe'],
};

const retryExceptClientErrors = (failureCount, error) => {
  if ([403, 404].includes(error?.response?.status)) {
    return false;
  }
  return failureCount < 3;
};

export const useUsers = ({
  page, pageSize, role, search,
}) => useQuery({
  queryKey: usersQueryKeys.list({
    page, pageSize, role, search,
  }),
  queryFn: () => getUsers({
    page, pageSize, role, search,
  }),
  retry: retryExceptClientErrors,
  placeholderData: previousData => previousData,
});

/**
 * Drives Super Admin / Middle Admin tab visibility. The original
 * implementation issued a single probe request with no retries and treated
 * any failure (typically a 403) as "cannot view"; `retry: false` preserves
 * that exact behavior.
 */
export const useSuperAdminAccessProbe = () => {
  const query = useQuery({
    queryKey: usersQueryKeys.superAdminProbe,
    queryFn: probeSuperAdminAccess,
    retry: false,
  });

  return { canViewSuperAdminTabs: query.isSuccess };
};

/**
 * Fetches full detail for a single user on demand (e.g. when opening the
 * View/Edit modal). Modeled as a mutation rather than a query since it is an
 * imperative, user-triggered fetch that isn't cached/re-rendered from.
 */
export const useUserDetailMutation = () => useMutation({ mutationFn: getUserDetail });

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ profileId, status }) => updateUserStatus(profileId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.all });
    },
  });
};
