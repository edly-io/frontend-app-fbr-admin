import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

// ─── Dashboard endpoints ───────────────────────────────────────────────────
//
// One endpoint per card, so a section renders (or fails) independently of the
// others. None of them take query parameters: the caller's active, city-scoped
// programs are the scope, and the backend derives that from the session.

export const DASHBOARD_KPIS_PATH = '/fbr/api/reports/dashboard/kpis/';
export const DASHBOARD_USERS_PATH = '/fbr/api/reports/dashboard/users/';
export const DASHBOARD_SESSIONS_PATH = '/fbr/api/reports/dashboard/sessions/';

export const getDashboardKpisUrl = () => `${getConfig().LMS_BASE_URL}${DASHBOARD_KPIS_PATH}`;
export const getDashboardUsersUrl = () => `${getConfig().LMS_BASE_URL}${DASHBOARD_USERS_PATH}`;
export const getDashboardSessionsUrl = () => `${getConfig().LMS_BASE_URL}${DASHBOARD_SESSIONS_PATH}`;

/**
 * The dashboard endpoints return `null`, not `0`, for a figure with nothing to
 * measure yet - "nobody has been marked" is a different claim from "everyone
 * scored zero". The distinction is preserved all the way to the tile, which
 * renders a dash rather than a fabricated zero.
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
  facultyRating: nullableNumber(data?.faculty_rating),
});

/**
 * Role counts answer "how many people do this job", so someone holding two
 * roles is counted under each - which means the role counts can add up to more
 * than `totalUsers`, which counts people. The composition bar therefore sizes
 * its segments against `roleTotal` (the sum of the segments) and never against
 * the head-count.
 *
 * `visibleRoles` is however many role buckets the caller outranks (5, 4 or 3),
 * so the total can be labelled honestly instead of hardcoding "across 5 roles".
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

/**
 * `hoursPerWeek` always carries exactly 8 Monday-to-Sunday buckets, oldest
 * first, with quiet weeks present as 0 - so the chart keeps a stable shape.
 * The last bucket is the current, still-running week.
 */
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
