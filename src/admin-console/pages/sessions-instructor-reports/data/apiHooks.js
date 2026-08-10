import { useQuery } from '@tanstack/react-query';
import { getSessionsInstructorReports, getInstructorSessionDetails } from './api';

export const sessionsReportQueryKeys = {
  list: params => ['sessions-reports', 'list', params],
  sessionDetails: params => ['sessions-reports', 'session-details', params],
};

export const useSessionsInstructorReports = ({
  program, instructor, city, startDate, endDate, page, pageSize,
}, { enabled = true } = {}) => useQuery({
  queryKey: sessionsReportQueryKeys.list({
    program, instructor, city, startDate, endDate, page, pageSize,
  }),
  queryFn: () => getSessionsInstructorReports({
    program, instructor, city, startDate, endDate, page, pageSize,
  }),
  placeholderData: previousData => previousData,
  enabled,
});

export const useInstructorSessionDetails = ({
  instructorId, programKey,
}, { enabled = true } = {}) => useQuery({
  queryKey: sessionsReportQueryKeys.sessionDetails({ instructorId, programKey }),
  queryFn: () => getInstructorSessionDetails({ instructorId, programKey }),
  enabled: enabled && !!instructorId,
});
