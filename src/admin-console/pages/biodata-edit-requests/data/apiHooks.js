import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getEditRequests, resolveEditRequest } from './api';

export const biodataEditRequestsQueryKeys = {
  all: ['biodataEditRequests'],
  list: params => ['biodataEditRequests', 'list', params],
};

const retryExceptClientErrors = (failureCount, error) => {
  if ([403, 404].includes(error?.response?.status)) {
    return false;
  }
  return failureCount < 3;
};

export const useBiodataEditRequests = ({ page, pageSize, statusFilter }) => useQuery({
  queryKey: biodataEditRequestsQueryKeys.list({ page, pageSize, statusFilter }),
  queryFn: () => getEditRequests({ page, pageSize, statusFilter }),
  retry: retryExceptClientErrors,
  placeholderData: previousData => previousData,
});

export const useResolveEditRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resolveEditRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: biodataEditRequestsQueryKeys.all });
    },
  });
};
