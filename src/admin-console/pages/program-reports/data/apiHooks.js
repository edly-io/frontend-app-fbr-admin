import { useQuery } from '@tanstack/react-query';
import { getProgramReports, getProgramPeople } from './api';

const PEOPLE_STALE_TIME = 5 * 60 * 1000;

export const programReportQueryKeys = {
  list: params => ['program-reports', 'list', params],
  people: programKey => ['program-reports', 'people', programKey],
};

export const useProgramReports = ({
  program, city, instructor, startDate, endDate, page, pageSize,
}, { enabled = true } = {}) => useQuery({
  queryKey: programReportQueryKeys.list({
    program, city, instructor, startDate, endDate, page, pageSize,
  }),
  queryFn: () => getProgramReports({
    program, city, instructor, startDate, endDate, page, pageSize,
  }),
  placeholderData: previousData => previousData,
  enabled,
});

export const useProgramPeople = (programKey, { enabled = true } = {}) => useQuery({
  queryKey: programReportQueryKeys.people(programKey),
  queryFn: () => getProgramPeople(programKey),
  enabled: Boolean(programKey) && enabled,
  staleTime: PEOPLE_STALE_TIME,
});
