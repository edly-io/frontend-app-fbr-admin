/**
 * Static sample data + report-building logic for the Reports page UI.
 *
 * This is UI-only (no backend integration - see task constraints): the
 * shapes below mirror what a real "sessions / programs / learners" reporting
 * API would eventually return, so swapping this module for a React Query
 * data layer later is a drop-in replacement rather than a rewrite.
 */

const PROGRAMS = [
  {
    name: 'Income Tax Assessment Fundamentals', category: 'Taxation', instructor: 'Ayesha Khan', enrolled: 32, completed: 24, completion: 75, score: 82,
  },
  {
    name: 'Customs Valuation & Classification', category: 'Customs', instructor: 'Bilal Ahmed', enrolled: 24, completed: 15, completion: 63, score: 76,
  },
  {
    name: 'Sales Tax Audit Procedures', category: 'Audit', instructor: 'Sana Malik', enrolled: 28, completed: 18, completion: 64, score: 79,
  },
  {
    name: 'Anti-Money Laundering Essentials', category: 'Compliance', instructor: 'Usman Raza', enrolled: 20, completed: 17, completion: 85, score: 88,
  },
  {
    name: 'Digital Filing (IRIS) Systems', category: 'Digital', instructor: 'Hina Sheikh', enrolled: 26, completed: 12, completion: 46, score: 71,
  },
  {
    name: 'Taxpayer Facilitation & Ethics', category: 'Ethics', instructor: 'Kamran Iqbal', enrolled: 18, completed: 14, completion: 78, score: 84,
  },
];

const INSTRUCTORS = [
  {
    name: 'Ayesha Khan', program: 'Income Tax Assessment Fundamentals', sessions: 14, hours: 42, avgAttendance: 92, avgFeedback: 4.6,
  },
  {
    name: 'Bilal Ahmed', program: 'Customs Valuation & Classification', sessions: 11, hours: 33, avgAttendance: 87, avgFeedback: 4.3,
  },
  {
    name: 'Sana Malik', program: 'Sales Tax Audit Procedures', sessions: 12, hours: 36, avgAttendance: 84, avgFeedback: 4.4,
  },
  {
    name: 'Usman Raza', program: 'Anti-Money Laundering Essentials', sessions: 9, hours: 27, avgAttendance: 90, avgFeedback: 4.7,
  },
  {
    name: 'Hina Sheikh', program: 'Digital Filing (IRIS) Systems', sessions: 13, hours: 39, avgAttendance: 79, avgFeedback: 4.1,
  },
  {
    name: 'Kamran Iqbal', program: 'Taxpayer Facilitation & Ethics', sessions: 8, hours: 24, avgAttendance: 88, avgFeedback: 4.5,
  },
  {
    name: 'Faisal Dar', program: 'Customs Valuation & Classification', sessions: 6, hours: 18, avgAttendance: 83, avgFeedback: 4.2,
  },
  {
    name: 'Nadia Aslam', program: 'Sales Tax Audit Procedures', sessions: 7, hours: 21, avgAttendance: 86, avgFeedback: 4.4,
  },
];

const LEARNERS = [
  {
    name: 'Zainab Riaz', department: 'Inland Revenue', region: 'Lahore', program: 'Income Tax Assessment Fundamentals', cohort: 'FY26 Q1', enrolledDate: '04 Mar 2026', status: 'Completed', progress: 100, modulesDone: 8, totalModules: 8, lastActivity: '20 Jul 2026', sessionsAttended: 12, sessionsTotal: 12,
  },
  {
    name: 'Bilal Sattar', department: 'RTO Lahore', region: 'Lahore', program: 'Income Tax Assessment Fundamentals', cohort: 'FY26 Q1', enrolledDate: '04 Mar 2026', status: 'In progress', progress: 75, modulesDone: 6, totalModules: 8, lastActivity: '25 Jul 2026', sessionsAttended: 10, sessionsTotal: 12,
  },
  {
    name: 'Ayesha Siddiqui', department: 'RTO Lahore', region: 'Lahore', program: 'Income Tax Assessment Fundamentals', cohort: 'FY26 Q1', enrolledDate: '04 Mar 2026', status: 'Overdue', progress: 40, modulesDone: 3, totalModules: 8, lastActivity: '28 Jun 2026', sessionsAttended: 5, sessionsTotal: 12,
  },
  {
    name: 'Maria Jamil', department: 'Customs', region: 'Karachi', program: 'Customs Valuation & Classification', cohort: 'FY26 Q2', enrolledDate: '02 Apr 2026', status: 'In progress', progress: 48, modulesDone: 4, totalModules: 9, lastActivity: '18 Jul 2026', sessionsAttended: 6, sessionsTotal: 10,
  },
  {
    name: 'Owais Ahmed', department: 'Customs', region: 'Karachi', program: 'Customs Valuation & Classification', cohort: 'FY26 Q2', enrolledDate: '02 Apr 2026', status: 'Not started', progress: 0, modulesDone: 0, totalModules: 9, lastActivity: '10 May 2026', sessionsAttended: 0, sessionsTotal: 10,
  },
  {
    name: 'Hamza Tariq', department: 'Audit', region: 'Islamabad', program: 'Sales Tax Audit Procedures', cohort: 'FY26 Q1', enrolledDate: '11 Mar 2026', status: 'In progress', progress: 62, modulesDone: 5, totalModules: 8, lastActivity: '24 Jul 2026', sessionsAttended: 8, sessionsTotal: 11,
  },
  {
    name: 'Rabia Khan', department: 'Audit', region: 'Islamabad', program: 'Sales Tax Audit Procedures', cohort: 'FY26 Q1', enrolledDate: '11 Mar 2026', status: 'Completed', progress: 100, modulesDone: 8, totalModules: 8, lastActivity: '08 Jul 2026', sessionsAttended: 11, sessionsTotal: 11,
  },
  {
    name: 'Fatima Noor', department: 'Inland Revenue', region: 'Islamabad', program: 'Anti-Money Laundering Essentials', cohort: 'FY26 Q1', enrolledDate: '20 Feb 2026', status: 'Completed', progress: 100, modulesDone: 6, totalModules: 6, lastActivity: '15 Jul 2026', sessionsAttended: 9, sessionsTotal: 9,
  },
  {
    name: 'Nida Farooq', department: 'RTO Karachi', region: 'Karachi', program: 'Anti-Money Laundering Essentials', cohort: 'FY26 Q1', enrolledDate: '20 Feb 2026', status: 'In progress', progress: 83, modulesDone: 5, totalModules: 6, lastActivity: '23 Jul 2026', sessionsAttended: 8, sessionsTotal: 9,
  },
  {
    name: 'Ali Hassan', department: 'IT Wing', region: 'Islamabad', program: 'Digital Filing (IRIS) Systems', cohort: 'FY26 Q2', enrolledDate: '15 Apr 2026', status: 'Overdue', progress: 30, modulesDone: 3, totalModules: 10, lastActivity: '30 Jun 2026', sessionsAttended: 4, sessionsTotal: 12,
  },
  {
    name: 'Junaid Malik', department: 'IT Wing', region: 'Lahore', program: 'Digital Filing (IRIS) Systems', cohort: 'FY26 Q2', enrolledDate: '15 Apr 2026', status: 'In progress', progress: 55, modulesDone: 5, totalModules: 10, lastActivity: '22 Jul 2026', sessionsAttended: 7, sessionsTotal: 12,
  },
  {
    name: 'Tariq Mehmood', department: 'Customs', region: 'Karachi', program: 'Digital Filing (IRIS) Systems', cohort: 'FY26 Q2', enrolledDate: '15 Apr 2026', status: 'Not started', progress: 0, modulesDone: 0, totalModules: 10, lastActivity: '05 May 2026', sessionsAttended: 0, sessionsTotal: 12,
  },
  {
    name: 'Sadia Aslam', department: 'HR', region: 'Islamabad', program: 'Taxpayer Facilitation & Ethics', cohort: 'FY26 Q3', enrolledDate: '01 May 2026', status: 'Completed', progress: 100, modulesDone: 5, totalModules: 5, lastActivity: '12 Jul 2026', sessionsAttended: 8, sessionsTotal: 8,
  },
  {
    name: 'Kashif Raza', department: 'Inland Revenue', region: 'Lahore', program: 'Taxpayer Facilitation & Ethics', cohort: 'FY26 Q3', enrolledDate: '01 May 2026', status: 'In progress', progress: 60, modulesDone: 3, totalModules: 5, lastActivity: '19 Jul 2026', sessionsAttended: 5, sessionsTotal: 8,
  },
];

const SESSIONS = [
  {
    date: '02 Jul 2026', program: 'Income Tax Assessment Fundamentals', title: 'Assessment Orders & Rectification', instructor: 'Ayesha Khan', region: 'Lahore', attended: 28, capacity: 32, status: 'Completed',
  },
  {
    date: '03 Jul 2026', program: 'Customs Valuation & Classification', title: 'WTO Valuation Methods', instructor: 'Bilal Ahmed', region: 'Karachi', attended: 20, capacity: 24, status: 'Completed',
  },
  {
    date: '05 Jul 2026', program: 'Sales Tax Audit Procedures', title: 'Input Tax Adjustment Audit', instructor: 'Sana Malik', region: 'Islamabad', attended: 23, capacity: 28, status: 'Completed',
  },
  {
    date: '09 Jul 2026', program: 'Anti-Money Laundering Essentials', title: 'STR Red Flags & Reporting', instructor: 'Usman Raza', region: 'Islamabad', attended: 18, capacity: 20, status: 'Completed',
  },
  {
    date: '10 Jul 2026', program: 'Digital Filing (IRIS) Systems', title: 'e-Filing Workflow in IRIS', instructor: 'Hina Sheikh', region: 'Lahore', attended: 19, capacity: 26, status: 'Completed',
  },
  {
    date: '14 Jul 2026', program: 'Taxpayer Facilitation & Ethics', title: 'Code of Conduct Case Studies', instructor: 'Kamran Iqbal', region: 'Islamabad', attended: 15, capacity: 18, status: 'Completed',
  },
  {
    date: '16 Jul 2026', program: 'Customs Valuation & Classification', title: 'HS Code Classification Lab', instructor: 'Faisal Dar', region: 'Karachi', attended: 17, capacity: 24, status: 'Completed',
  },
  {
    date: '21 Jul 2026', program: 'Sales Tax Audit Procedures', title: 'Audit Documentation Standards', instructor: 'Nadia Aslam', region: 'Islamabad', attended: 21, capacity: 28, status: 'Completed',
  },
  {
    date: '29 Jul 2026', program: 'Income Tax Assessment Fundamentals', title: 'Appeals & Remedies', instructor: 'Ayesha Khan', region: 'Lahore', attended: 0, capacity: 32, status: 'Scheduled',
  },
  {
    date: '04 Aug 2026', program: 'Digital Filing (IRIS) Systems', title: 'Bulk Return Uploads', instructor: 'Hina Sheikh', region: 'Lahore', attended: 0, capacity: 26, status: 'Scheduled',
  },
];

const FEEDBACK = [
  {
    program: 'Income Tax Assessment Fundamentals', session: 'Assessment Orders & Rectification', instructor: 'Ayesha Khan', region: 'Lahore', responses: 26, content: 4.6, instructorRating: 4.7, relevance: 4.5, nps: 62,
  },
  {
    program: 'Customs Valuation & Classification', session: 'WTO Valuation Methods', instructor: 'Bilal Ahmed', region: 'Karachi', responses: 19, content: 4.3, instructorRating: 4.4, relevance: 4.2, nps: 51,
  },
  {
    program: 'Sales Tax Audit Procedures', session: 'Input Tax Adjustment Audit', instructor: 'Sana Malik', region: 'Islamabad', responses: 22, content: 4.4, instructorRating: 4.5, relevance: 4.3, nps: 55,
  },
  {
    program: 'Anti-Money Laundering Essentials', session: 'STR Red Flags & Reporting', instructor: 'Usman Raza', region: 'Islamabad', responses: 18, content: 4.7, instructorRating: 4.8, relevance: 4.6, nps: 71,
  },
  {
    program: 'Digital Filing (IRIS) Systems', session: 'e-Filing Workflow in IRIS', instructor: 'Hina Sheikh', region: 'Lahore', responses: 17, content: 4.0, instructorRating: 4.1, relevance: 4.2, nps: 44,
  },
  {
    program: 'Taxpayer Facilitation & Ethics', session: 'Code of Conduct Case Studies', instructor: 'Kamran Iqbal', region: 'Islamabad', responses: 15, content: 4.5, instructorRating: 4.6, relevance: 4.4, nps: 60,
  },
  {
    program: 'Customs Valuation & Classification', session: 'HS Code Classification Lab', instructor: 'Faisal Dar', region: 'Karachi', responses: 16, content: 4.2, instructorRating: 4.2, relevance: 4.3, nps: 48,
  },
  {
    program: 'Sales Tax Audit Procedures', session: 'Audit Documentation Standards', instructor: 'Nadia Aslam', region: 'Islamabad', responses: 20, content: 4.4, instructorRating: 4.5, relevance: 4.3, nps: 57,
  },
];

const round = (value) => Math.round(value);
const average = (values) => (values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : 0);

// A `null` shadow field means that dimension doesn't apply to this report
// (e.g. the Program report has no per-row instructor), so that filter is
// bypassed rather than treated as a non-match.
const matchesFilters = (record, filters) => (
  (filters.program === 'all' || record.filterProgram == null || record.filterProgram === filters.program)
  && (
    filters.instructor === 'all'
    || record.filterInstructor == null
    || record.filterInstructor === filters.instructor
  )
  && (filters.region === 'all' || record.filterRegion == null || record.filterRegion === filters.region)
);

const REPORT_BUILDERS = {
  sessionsPerInstructor: (filters) => {
    const rows = INSTRUCTORS
      .map(i => ({
        instructor: i.name,
        primaryProgram: i.program,
        sessions: i.sessions,
        hours: i.hours,
        avgAttendance: i.avgAttendance,
        avgFeedback: i.avgFeedback.toFixed(1),
        filterInstructor: i.name,
        filterProgram: i.program,
        filterRegion: null,
      }))
      .filter(row => matchesFilters(row, filters));
    return {
      rows,
      stats: [
        ['totalSessions', rows.reduce((sum, r) => sum + r.sessions, 0)],
        ['totalHours', rows.reduce((sum, r) => sum + r.hours, 0)],
        ['avgFeedback', average(rows.map(r => Number(r.avgFeedback))).toFixed(1)],
      ],
    };
  },
  program: (filters) => {
    const rows = PROGRAMS
      .map(p => ({
        program: p.name,
        category: p.category,
        instructor: p.instructor,
        enrolled: p.enrolled,
        completed: p.completed,
        completion: p.completion,
        avgScore: p.score,
        filterProgram: p.name,
        filterInstructor: p.instructor,
        filterRegion: null,
      }))
      .filter(row => matchesFilters(row, filters));
    return {
      rows,
      stats: [
        ['programCount', rows.length],
        ['avgCompletion', `${round(average(rows.map(r => r.completion)))}%`],
        ['avgScore', round(average(rows.map(r => r.avgScore)))],
      ],
    };
  },
  session: (filters) => {
    const rows = SESSIONS
      .map(s => ({
        date: s.date,
        program: s.program,
        session: s.title,
        instructor: s.instructor,
        region: s.region,
        attendance: s.capacity ? round((s.attended / s.capacity) * 100) : 0,
        status: s.status,
        filterProgram: s.program,
        filterInstructor: s.instructor,
        filterRegion: s.region,
      }))
      .filter(row => matchesFilters(row, filters));
    return {
      rows,
      stats: [
        ['sessionCount', rows.length],
        ['completedCount', rows.filter(r => r.status === 'Completed').length],
        ['avgAttendance', `${round(average(rows.map(r => r.attendance)))}%`],
      ],
    };
  },
  attendance: (filters) => {
    const rows = LEARNERS
      .map(l => ({
        learner: l.name,
        program: l.program,
        region: l.region,
        attended: `${l.sessionsAttended} / ${l.sessionsTotal}`,
        attendanceRate: l.sessionsTotal ? round((l.sessionsAttended / l.sessionsTotal) * 100) : 0,
        status: l.status,
        filterProgram: l.program,
        filterRegion: l.region,
        filterInstructor: null,
      }))
      .filter(row => matchesFilters(row, filters));
    return {
      rows,
      stats: [
        ['learnerCount', rows.length],
        ['avgAttendance', `${round(average(rows.map(r => r.attendanceRate)))}%`],
        ['belowSixty', rows.filter(r => r.attendanceRate < 60).length],
      ],
    };
  },
  feedback: (filters) => {
    const rows = FEEDBACK
      .map(f => ({
        program: f.program,
        session: f.session,
        instructor: f.instructor,
        responses: f.responses,
        content: f.content.toFixed(1),
        instructorRating: f.instructorRating.toFixed(1),
        relevance: f.relevance.toFixed(1),
        nps: f.nps,
        filterProgram: f.program,
        filterInstructor: f.instructor,
        filterRegion: f.region,
      }))
      .filter(row => matchesFilters(row, filters));
    return {
      rows,
      stats: [
        ['responseCount', rows.reduce((sum, r) => sum + r.responses, 0)],
        [
          'avgRating',
          average(
            rows.flatMap(r => [Number(r.content), Number(r.instructorRating), Number(r.relevance)]),
          ).toFixed(1),
        ],
        ['avgNps', round(average(rows.map(r => r.nps)))],
      ],
    };
  },
  enrolled: (filters) => {
    const rows = LEARNERS
      .map(l => ({
        learner: l.name,
        department: l.department,
        region: l.region,
        program: l.program,
        cohort: l.cohort,
        enrolledDate: l.enrolledDate,
        status: l.status,
        filterProgram: l.program,
        filterRegion: l.region,
        filterInstructor: null,
      }))
      .filter(row => matchesFilters(row, filters));
    return {
      rows,
      stats: [
        ['enrolledCount', rows.length],
        ['activeCount', rows.filter(r => r.status === 'In progress').length],
        ['notStartedCount', rows.filter(r => r.status === 'Not started').length],
      ],
    };
  },
  progress: (filters) => {
    const rows = LEARNERS
      .map(l => ({
        learner: l.name,
        program: l.program,
        region: l.region,
        modules: `${l.modulesDone} / ${l.totalModules}`,
        progress: l.progress,
        lastActivity: l.lastActivity,
        status: l.status,
        filterProgram: l.program,
        filterRegion: l.region,
        filterInstructor: null,
      }))
      .filter(row => matchesFilters(row, filters));
    return {
      rows,
      stats: [
        ['learnerCount', rows.length],
        ['avgProgress', `${round(average(rows.map(r => r.progress)))}%`],
        ['completedCount', rows.filter(r => r.status === 'Completed').length],
      ],
    };
  },
};

export const buildReportData = (reportKey, filters) => {
  const builder = REPORT_BUILDERS[reportKey] || REPORT_BUILDERS.program;
  return builder(filters);
};

export const getFilterOptionLists = () => ({
  programs: PROGRAMS.map(p => p.name),
  instructors: [...new Set(INSTRUCTORS.map(i => i.name))],
  regions: [...new Set(LEARNERS.map(l => l.region))],
});
