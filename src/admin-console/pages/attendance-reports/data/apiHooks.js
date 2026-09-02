import { useQuery } from '@tanstack/react-query';
import { getAttendanceReports, getAttendanceDetails } from './api';

export const attendanceReportQueryKeys = {
  list: params => ['attendance-reports', 'list', params],
  attendanceDetails: params => ['attendance-reports', 'attendance-details', params],
};

export const useAttendanceReports = ({
  program, instructor, city, startDate, endDate, page, pageSize,
}, { enabled = true } = {}) => useQuery({
  queryKey: attendanceReportQueryKeys.list({
    program, instructor, city, startDate, endDate, page, pageSize,
  }),
  queryFn: () => getAttendanceReports({
    program, instructor, city, startDate, endDate, page, pageSize,
  }),
  placeholderData: previousData => previousData,
  enabled,
});

export const useAttendanceDetails = ({
  learnerId, programKey, startDate, endDate,
}, { enabled = true } = {}) => useQuery({
  queryKey: attendanceReportQueryKeys.attendanceDetails({
    learnerId, programKey, startDate, endDate,
  }),
  queryFn: () => getAttendanceDetails({
    learnerId, programKey, startDate, endDate,
  }),
  enabled: enabled && !!learnerId,
});
