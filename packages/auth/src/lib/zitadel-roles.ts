// Maps Zitadel project roles onto the app's `user.role` column.
//
// Zitadel puts the roles granted on the requesting app's project into this claim
// (when the `urn:zitadel:iam:org:project:roles` scope is requested), shaped as
//   { "<roleKey>": { "<orgId>": "<orgDomain>" }, ... }

export const ZITADEL_ROLES_SCOPE = "urn:zitadel:iam:org:project:roles";
const ZITADEL_ROLES_CLAIM = "urn:zitadel:iam:org:project:roles";

export const ADMIN_ROLE = "site_admin";
export const DEFAULT_ROLE = "user";

export function zitadelRoleKeys(claims: Record<string, unknown>): string[] {
  const roles = claims[ZITADEL_ROLES_CLAIM];
  if (!roles || typeof roles !== "object" || Array.isArray(roles)) return [];
  return Object.keys(roles);
}

// Zitadel is the source of truth: anyone without the admin role there is a
// regular user here, including when the claim is missing entirely.
export function appRoleFromZitadel(claims: Record<string, unknown>): string {
  return zitadelRoleKeys(claims).includes(ADMIN_ROLE)
    ? ADMIN_ROLE
    : DEFAULT_ROLE;
}
