import { useQuery } from '@tanstack/react-query';
import {
  getAttendanceReports, getAttendanceReportFilters, getAttendanceDetails,
} from './api';

const FILTER_OPTIONS_STALE_TIME = 5 * 60 * 1000;

export const attendanceReportQueryKeys = {
  list: params => ['attendance-reports', 'list', params],
  filters: ['attendance-reports', 'filters'],
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

export const useReportFilters = ({ enabled = true } = {}) => useQuery({
  queryKey: attendanceReportQueryKeys.filters,
  queryFn: getAttendanceReportFilters,
  staleTime: FILTER_OPTIONS_STALE_TIME,
  enabled,
});

export const useAttendanceDetails = ({
  learnerId, programKey,
}, { enabled = true } = {}) => useQuery({
  queryKey: attendanceReportQueryKeys.attendanceDetails({ learnerId, programKey }),
  queryFn: () => getAttendanceDetails({ learnerId, programKey }),
  enabled: enabled && !!learnerId,
});
