/**
 * Mock data for the dashboard sections that have no endpoint yet.
 *
 * Needs attention, Program performance, Users and Sessions & training hours are
 * live against `/fbr/api/reports/dashboard/`; what is left here backs Attendance
 * overview alone. Delete each block as its endpoint lands - nothing below feeds
 * an API-backed card.
 *
 * Components never read it directly: they consume the view model from
 * `./selectors.js`.
 */

/** Attendance below this percentage puts a trainee at risk of failing. */
export const ATTENDANCE_THRESHOLD = 75;

export const PROGRAMS = [
  {
    id: 'income-tax-assessment-fundamentals',
    name: 'Income Tax Assessment Fundamentals',
    enrolled: 32,
    attendance: 91,
  },
  {
    id: 'customs-valuation-and-classification',
    name: 'Customs Valuation & Classification',
    enrolled: 24,
    attendance: 84,
  },
  {
    id: 'sales-tax-audit-procedures',
    name: 'Sales Tax Audit Procedures',
    enrolled: 28,
    attendance: 88,
  },
  {
    id: 'anti-money-laundering-essentials',
    name: 'Anti-Money Laundering Essentials',
    enrolled: 20,
    attendance: 93,
  },
  {
    id: 'digital-filing-iris-systems',
    name: 'Digital Filing (IRIS) Systems',
    enrolled: 26,
    attendance: 76,
  },
  {
    id: 'taxpayer-facilitation-and-ethics',
    name: 'Taxpayer Facilitation & Ethics',
    enrolled: 18,
    attendance: 89,
  },
];

export const ATTENDANCE = {
  present: 87.2,
  absent: 8.6,
  onLeave: 4.2,
  traineesBelowThreshold: 11,
  sessionsMarkedToday: 5,
  sessionsToday: 6,
  attendanceChange: 2.4,
};

export const dashboardMockData = {
  attendanceThreshold: ATTENDANCE_THRESHOLD,
  programs: PROGRAMS,
  attendance: ATTENDANCE,
};
