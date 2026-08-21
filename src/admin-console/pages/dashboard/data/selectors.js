/**
 * Derives the figures for the dashboard sections that are still mock-backed -
 * Attendance overview. Components consume the returned view model and never
 * recompute totals of their own.
 *
 * Needs attention, Program performance, Users and Sessions are fetched from the
 * dashboard API and mapped in `./api.js`; nothing here feeds them.
 */

const sumBy = (items, getValue) => items.reduce((total, item) => total + getValue(item), 0);

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

export const getDashboardMetrics = data => ({
  programs: data.programs,
  attendanceMetrics: getAttendanceMetrics(
    data.attendance,
    data.attendanceThreshold,
    sumBy(data.programs, program => program.enrolled),
  ),
});
