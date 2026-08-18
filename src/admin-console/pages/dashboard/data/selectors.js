/**
 * Derives the figures for the dashboard sections that are still mock-backed -
 * Attendance overview, Feedback overview and the programme signals in Needs
 * attention. Components consume the returned view model and never recompute
 * totals of their own.
 *
 * Program performance, Users and Sessions are fetched from the dashboard API
 * and mapped in `./api.js`; nothing here feeds them.
 */
import { RESULTS_STATUS } from './mockData';

const sumBy = (items, getValue) => items.reduce((total, item) => total + getValue(item), 0);

export const getProgramMetrics = (programs) => {
  const completed = sumBy(programs, program => program.completed);
  const certificates = sumBy(programs, program => program.certificates);

  return {
    programs,
    enrolled: sumBy(programs, program => program.enrolled),
    certificatesPending: completed - certificates,
    programsWithoutResults: programs.filter(
      program => program.resultsStatus === RESULTS_STATUS.none,
    ),
    programsWithDraftResults: programs.filter(
      program => program.resultsStatus === RESULTS_STATUS.draft,
    ),
  };
};

export const getAttendanceMetrics = (attendance, threshold, traineesTracked) => ({
  ...attendance,
  threshold,
  traineesTracked,
  breakdown: [
    { id: 'present', percentage: attendance.present },
    { id: 'absent', percentage: attendance.absent },
    { id: 'onLeave', percentage: attendance.onLeave },
  ],
});

export const getFeedbackMetrics = feedback => ({
  ...feedback,
  responseRate: feedback.invited ? (feedback.responded / feedback.invited) * 100 : 0,
});

export const getDashboardMetrics = (data) => {
  const programMetrics = getProgramMetrics(data.programs);

  return {
    programMetrics,
    attendanceMetrics: getAttendanceMetrics(
      data.attendance,
      data.attendanceThreshold,
      programMetrics.enrolled,
    ),
    feedbackMetrics: getFeedbackMetrics(data.feedback),
  };
};
