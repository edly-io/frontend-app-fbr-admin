/**
 * Temporary stand-in for the not-yet-built
 * `GET /fbr/api/reports/instructors/:id/sessions/` endpoint. The response is
 * shaped exactly like the real endpoint is expected to return - a paginated
 * envelope (`results`/`count`) of course objects, each carrying its own
 * `sessions` - so `getInstructorSessionDetails` in `api.js` only has to swap
 * this call for the real HTTP request once the backend ships. Nothing
 * downstream (the mapping helpers, `apiHooks`, `SessionDetailsSheet`) needs
 * to change.
 *
 * TODO(sessions-api): delete this file and the mock call site in `api.js`
 * once the endpoint exists.
 */
const MOCK_COURSES = [
  {
    course_key: 'course-v1:FBR+CE101+2025',
    course_title: 'Customs & Excise Enforcement Fundamentals',
    sessions: [
      { id: 501, title: 'Orientation & Legal Framework', duration_minutes: 90, start_date: '2025-01-12' },
      { id: 502, title: 'Case Study Workshop', duration_minutes: 120, start_date: '2025-01-19' },
      { id: 503, title: 'Field Practicum', duration_minutes: 180, start_date: '2025-01-26' },
    ],
  },
  {
    course_key: 'course-v1:FBR+CE102+2025',
    course_title: 'Advanced Risk Assessment',
    sessions: [
      { id: 504, title: 'Risk Scoring Models', duration_minutes: 60, start_date: '2025-02-02' },
      { id: 505, title: 'Applied Simulation', duration_minutes: 90, start_date: '2025-02-09' },
    ],
  },
  {
    course_key: 'course-v1:FBR+CE103+2025',
    course_title: 'Interagency Coordination',
    sessions: [
      { id: 506, title: 'Coordination Protocols', duration_minutes: 45, start_date: '2025-02-16' },
    ],
  },
];

export const getMockInstructorSessionDetails = async () => ({
  data: {
    results: MOCK_COURSES,
    count: MOCK_COURSES.length,
  },
});
