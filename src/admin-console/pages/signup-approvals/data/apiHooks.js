import { useQuery } from '@tanstack/react-query';

import { getSignupApprovals } from './api';

export const signupApprovalsQueryKeys = {
  all: ['signupApprovals'],
  list: params => ['signupApprovals', 'list', params],
};

const retryExceptClientErrors = (failureCount, error) => {
  if ([403, 404].includes(error?.response?.status)) {
    return false;
  }
  return failureCount < 3;
};

export const useSignupApprovals = ({ page, pageSize, search }) => useQuery({
  queryKey: signupApprovalsQueryKeys.list({ page, pageSize, search }),
  queryFn: () => getSignupApprovals({ page, pageSize, search }),
  retry: retryExceptClientErrors,
  placeholderData: previousData => previousData,
});
