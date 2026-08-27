import { useQuery } from '@tanstack/react-query';
import {
  getProgramReports, getProgramPeople, getProgramOverview, getTraineeProgress,
} from './api';

const PEOPLE_STALE_TIME = 5 * 60 * 1000;
const OVERVIEW_STALE_TIME = 5 * 60 * 1000;

export const programReportQueryKeys = {
  list: params => ['program-reports', 'list', params],
  people: programKey => ['program-reports', 'people', programKey],
  overview: programKey => ['program-reports', 'overview', programKey],
  traineeProgress: (programKey, traineeId) => ['program-reports', 'trainee-progress', programKey, traineeId],
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

/**
 * Backs a Program Report row's expanded overview panel. `staleTime` lets a
 * row that's collapsed and re-expanded reuse the cached response instead of
 * re-fetching, since the panel unmounts (and its query is dropped) whenever
 * the row collapses.
 */
export const useProgramOverview = (programKey, { enabled = true } = {}) => useQuery({
  queryKey: programReportQueryKeys.overview(programKey),
  queryFn: () => getProgramOverview(programKey),
  enabled: Boolean(programKey) && enabled,
  staleTime: OVERVIEW_STALE_TIME,
});

export const useTraineeProgress = (programKey, traineeId, { enabled = true } = {}) => useQuery({
  queryKey: programReportQueryKeys.traineeProgress(programKey, traineeId),
  queryFn: () => getTraineeProgress(programKey, traineeId),
  enabled: Boolean(programKey) && Boolean(traineeId) && enabled,
});
