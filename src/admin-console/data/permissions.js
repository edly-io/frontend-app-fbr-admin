// ─── Reports capability model ──────────────────────────────────────────────
//
// Mirrors frontend-app-authoring's `getProgramCapabilities` pattern: a pure
// function that turns a caller's role list into a capabilities object, used
// for both page-level access gating and sidebar visibility so there is a
// single source of truth for "who can see Reports".

export const REPORTS_ADMIN_ROLES = ['data_admin', 'middle_admin', 'super_admin'];

const NO_REPORTS_ACCESS = {
  canAccessPrograms: false,
  canAccessSessions: false,
};

export const getReportsCapabilities = (roles = []) => {
  const roleSet = new Set(roles);
  const isReportsAdmin = REPORTS_ADMIN_ROLES.some(role => roleSet.has(role));

  if (!isReportsAdmin) {
    return NO_REPORTS_ACCESS;
  }

  return {
    canAccessPrograms: true,
    canAccessSessions: true,
  };
};
