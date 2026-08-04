import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { assignHrmsEmployeeRole, getHrmsEmployees } from './api';
import { usersQueryKeys } from '../../users/data/apiHooks';

export const hrmsQueryKeys = {
  all: ['hrms'],
  employees: ['hrms', 'employees'],
};

const retryExceptClientErrors = (failureCount, error) => {
  if ([403, 404].includes(error?.response?.status)) {
    return false;
  }
  return failureCount < 3;
};

export const useHrmsEmployees = () => useQuery({
  queryKey: hrmsQueryKeys.employees,
  queryFn: getHrmsEmployees,
  retry: retryExceptClientErrors,
});

export const useAssignHrmsEmployeeRoleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: assignHrmsEmployeeRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrmsQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.all });
    },
  });
};
