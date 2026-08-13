/**
 * Mock data for the dashboard sections that have no endpoint yet.
 *
 * Program performance, Users and Sessions & training hours are live against
 * `/fbr/api/reports/dashboard/`; what is left here backs Attendance overview,
 * Feedback overview and the programme-level signals in Needs attention. Delete
 * each block as its endpoint lands - nothing below feeds an API-backed card.
 *
 * Components never read it directly: they consume the view model from
 * `./selectors.js`.
 */

export const RESULTS_STATUS = {
  finalized: 'finalized',
  draft: 'draft',
  none: 'none',
};

export const RATING_IDS = {
  excellent: 'excellent',
  veryGood: 'very-good',
  good: 'good',
  fair: 'fair',
  poor: 'poor',
};

/** Attendance below this percentage puts a trainee at risk of failing. */
export const ATTENDANCE_THRESHOLD = 75;

export const PROGRAMS = [
  {
    id: 'income-tax-assessment-fundamentals',
    name: 'Income Tax Assessment Fundamentals',
    enrolled: 32,
    completed: 24,
    resultsStatus: RESULTS_STATUS.finalized,
    certificates: 24,
    attendance: 91,
  },
  {
    id: 'customs-valuation-and-classification',
    name: 'Customs Valuation & Classification',
    enrolled: 24,
    completed: 15,
    resultsStatus: RESULTS_STATUS.draft,
    certificates: 9,
    attendance: 84,
  },
  {
    id: 'sales-tax-audit-procedures',
    name: 'Sales Tax Audit Procedures',
    enrolled: 28,
    completed: 18,
    resultsStatus: RESULTS_STATUS.finalized,
    certificates: 18,
    attendance: 88,
  },
  {
    id: 'anti-money-laundering-essentials',
    name: 'Anti-Money Laundering Essentials',
    enrolled: 20,
    completed: 17,
    resultsStatus: RESULTS_STATUS.finalized,
    certificates: 17,
    attendance: 93,
  },
  {
    id: 'digital-filing-iris-systems',
    name: 'Digital Filing (IRIS) Systems',
    enrolled: 26,
    completed: 12,
    resultsStatus: RESULTS_STATUS.none,
    certificates: 0,
    attendance: 76,
  },
  {
    id: 'taxpayer-facilitation-and-ethics',
    name: 'Taxpayer Facilitation & Ethics',
    enrolled: 18,
    completed: 14,
    resultsStatus: RESULTS_STATUS.draft,
    certificates: 11,
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

export const FEEDBACK = {
  averageRating: 4.2,
  maximumRating: 5,
  responded: 132,
  invited: 148,
  distribution: [
    { id: RATING_IDS.excellent, percentage: 42 },
    { id: RATING_IDS.veryGood, percentage: 31 },
    { id: RATING_IDS.good, percentage: 18 },
    { id: RATING_IDS.fair, percentage: 6 },
    { id: RATING_IDS.poor, percentage: 3 },
  ],
  highestRated: {
    name: 'Usman Raza',
    program: 'Anti-Money Laundering Essentials',
    score: 4.8,
  },
  lowestRated: {
    name: 'Hina Sheikh',
    program: 'Digital Filing (IRIS) Systems',
    score: 3.4,
  },
  quote: {
    text: 'Sessions were well structured and the practical exercises were the most useful '
      + 'part of the module.',
    respondent: 'Respondent 14',
    program: 'Anti-Money Laundering Essentials',
  },
};

export const dashboardMockData = {
  attendanceThreshold: ATTENDANCE_THRESHOLD,
  programs: PROGRAMS,
  attendance: ATTENDANCE,
  feedback: FEEDBACK,
};
