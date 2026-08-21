import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

// ─── Dashboard endpoints ───────────────────────────────────────────────────
//
// One endpoint per card. None take query parameters: the caller's active,
// city-scoped programs are the scope, derived by the backend from the session.

export const DASHBOARD_KPIS_PATH = '/fbr/api/reports/dashboard/kpis/';
export const DASHBOARD_USERS_PATH = '/fbr/api/reports/dashboard/users/';
export const DASHBOARD_SESSIONS_PATH = '/fbr/api/reports/dashboard/sessions/';
export const DASHBOARD_NEEDS_ATTENTION_PATH = '/fbr/api/reports/dashboard/needs-attention/';

export const getDashboardKpisUrl = () => `${getConfig().LMS_BASE_URL}${DASHBOARD_KPIS_PATH}`;
export const getDashboardUsersUrl = () => `${getConfig().LMS_BASE_URL}${DASHBOARD_USERS_PATH}`;
export const getDashboardSessionsUrl = () => `${getConfig().LMS_BASE_URL}${DASHBOARD_SESSIONS_PATH}`;
export const getDashboardNeedsAttentionUrl = () => `${getConfig().LMS_BASE_URL}${DASHBOARD_NEEDS_ATTENTION_PATH}`;

/**
 * The endpoints return `null`, not `0`, for a figure with nothing to measure -
 * "nobody has been marked" is a different claim from "everyone scored zero", and
 * the tile renders a dash rather than a fabricated zero.
 */
const nullableNumber = (value) => (
  value === null || value === undefined ? null : Number(value)
);

const asCount = (value) => value || 0;

export const mapProgramPerformanceKpis = (data) => ({
  activePrograms: asCount(data?.active_programs),
  enrolledTrainees: asCount(data?.enrolled_trainees),
  overallCompletion: nullableNumber(data?.overall_completion),
  averageScore: nullableNumber(data?.average_score),
  certificatesIssued: asCount(data?.certificates_issued),
});

/**
 * A person holding two roles is counted under each, so the role counts can add
 * up to more than `totalUsers`, which counts people. The composition bar
 * therefore sizes its segments against `roleTotal`, never the head-count.
 */
export const mapUserComposition = (data) => {
  const roles = (data?.roles || []).map((role) => ({
    id: role.role,
    label: role.label,
    count: asCount(role.count),
  }));
  const roleTotal = roles.reduce((total, role) => total + role.count, 0);

  return {
    totalUsers: asCount(data?.total_users),
    visibleRoles: asCount(data?.visible_roles),
    pendingApproval: asCount(data?.pending_approval),
    roleTotal,
    roles: roles.map((role) => ({
      ...role,
      share: roleTotal ? (role.count / roleTotal) * 100 : 0,
    })),
  };
};

/** 8 Monday-to-Sunday buckets, oldest first; the last is the current week. */
export const mapSessionDelivery = (data) => ({
  totalHours: asCount(data?.total_hours),
  sessionsDelivered: asCount(data?.sessions_delivered),
  averageSessionHours: nullableNumber(data?.average_session_hours),
  sessionsThisWeek: asCount(data?.sessions_this_week),
  upcomingSessions: asCount(data?.upcoming_sessions),
  instructorsDelivering: asCount(data?.instructors_delivering),
  hoursByProgram: (data?.hours_by_program || []).map((row) => ({
    id: row.program_key,
    programKey: row.program_key,
    name: row.program_title || row.program_key,
    hours: asCount(row.hours),
    sessions: asCount(row.sessions),
  })),
  hoursPerWeek: (data?.hours_per_week || []).map((week) => ({
    weekStart: week.week_start,
    hours: asCount(week.hours),
  })),
});

/**
 * The marking, requests and substitute screens live in the Sessions MFE, whose
 * base comes from `MFE_CONFIG` like every other cross-MFE link. Returns `null`
 * when it is not configured, and the rows then render without a link rather
 * than a URL guessed from this environment.
 */
const getSessionsMfeBaseUrl = () => {
  const configured = getConfig().SESSIONS_BASE_URL;
  return configured ? configured.replace(/\/+$/, '') : null;
};

/**
 * `:` and `+` are legal in a path segment and the Sessions MFE routes on the
 * raw key, so they are left intact - everything else is still escaped, so a key
 * carrying anything unusual cannot break the URL.
 */
const encodeKey = key => encodeURIComponent(key).replace(/%3A/g, ':').replace(/%2B/g, '+');

const getSessionsMfeUrl = (path) => {
  const base = getSessionsMfeBaseUrl();
  return base ? `${base}${path}` : null;
};

/** The Sessions MFE's sentinel for the sessions that belong to no course. */
const NO_COURSE_VALUE = '__none__';

/**
 * The roster for one session, built the same way the Sessions MFE builds its
 * own session links: `course_id` rides in the query string, where a literal `+`
 * would decode to a space, so it stays fully encoded unlike the path segments.
 * The roster loads on `sessionId` alone; `course_id` only seeds the page's
 * by-course back link, which recognises the sentinel and leaves an empty value
 * on nothing.
 */
export const getSessionAttendanceUrl = (programKey, sessionId, courseId) => getSessionsMfeUrl(
  `/${encodeKey(programKey)}/attendance/sessions/${encodeURIComponent(sessionId)}`
  + `?course_id=${encodeURIComponent(courseId || NO_COURSE_VALUE)}`,
);

/** Lands on the leaves tab, which is where the requests page opens. */
export const getProgramRequestsUrl = programKey => getSessionsMfeUrl(
  `/${encodeKey(programKey)}/requests/leaves`,
);

export const getSubstituteRequestsUrl = programKey => getSessionsMfeUrl(
  `/${encodeKey(programKey)}/requests/substitute-requests`,
);

/** A programme with no title falls back to its key rather than rendering blank. */
const mapAttentionProgram = program => ({
  id: program.program_key,
  programKey: program.program_key,
  name: program.program_title || program.program_key,
});

/** The programme's own figures, as reported - never folded from its courses. */
const markingCounts = program => ({
  sessionCount: asCount(program.sessions),
  unmarkedTrainees: asCount(program.unmarked_trainees),
  daysLeft: asCount(program.days_left),
});

/** Sorted most-urgent-first by the API, and left in that order. */
const mapAttentionSession = session => ({
  id: session.session_id,
  sessionId: session.session_id,
  title: session.title || null,
  startTime: session.scheduled_start_time || null,
  unmarkedTrainees: asCount(session.unmarked_trainees),
  daysLeft: asCount(session.days_left),
});

/**
 * A `null` `course_id` is the sessions belonging to no course: kept and
 * labelled by the card rather than dropped. It heads its sessions like any
 * other course; only the deep link to a course page is missing.
 */
const mapAttentionCourse = (program, course, index) => ({
  id: course.course_id || `${program.program_key}-no-course-${index}`,
  courseId: course.course_id || null,
  title: course.course_title || null,
  sessions: (course.unmarked_sessions || []).map(mapAttentionSession),
});

export const mapNeedsAttention = data => ({
  loginApprovals: asCount(data?.login_approvals),
  biodataEditRequests: asCount(data?.biodata_edit_requests),
  markingWindow: {
    thresholdDays: asCount(data?.marking_window_expiring?.threshold_days),
    totalSessions: asCount(data?.marking_window_expiring?.total_sessions),
    totalUnmarkedTrainees: asCount(data?.marking_window_expiring?.total_unmarked_trainees),
    programs: (data?.marking_window_expiring?.programs || []).map(program => ({
      ...mapAttentionProgram(program),
      ...markingCounts(program),
      courses: (program.courses || [])
        .map((course, index) => mapAttentionCourse(program, course, index)),
    })),
  },
  pendingRequests: {
    totalPrograms: asCount(data?.pending_requests?.total_programs),
    programs: (data?.pending_requests?.programs || []).map(program => ({
      ...mapAttentionProgram(program),
      pending: asCount(program.pending),
    })),
  },
  unassignedSubstitutes: {
    totalSessions: asCount(data?.unassigned_substitutes?.total_sessions),
    programs: (data?.unassigned_substitutes?.programs || []).map(program => ({
      ...mapAttentionProgram(program),
      sessions: asCount(program.sessions),
      soonestSession: program.soonest_session || null,
    })),
  },
});

/** The six Program performance tiles, measured over active programs only. */
export const getDashboardKpis = async () => {
  const { data } = await getAuthenticatedHttpClient().get(getDashboardKpisUrl());
  return mapProgramPerformanceKpis(data);
};

/** Account counts by role, city-scoped and filtered to the caller's rank. */
export const getDashboardUserComposition = async () => {
  const { data } = await getAuthenticatedHttpClient().get(getDashboardUsersUrl());
  return mapUserComposition(data);
};

/** Delivered hours, weekly trend and per-program split across the portfolio. */
export const getDashboardSessionDelivery = async () => {
  const { data } = await getAuthenticatedHttpClient().get(getDashboardSessionsUrl());
  return mapSessionDelivery(data);
};

/** Outstanding work across the caller's active, city-scoped programmes. */
export const getDashboardNeedsAttention = async () => {
  const { data } = await getAuthenticatedHttpClient().get(getDashboardNeedsAttentionUrl());
  return mapNeedsAttention(data);
};
