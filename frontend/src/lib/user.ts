export function getCurrentUserSafe(): any {
  try {
    return JSON.parse(localStorage.getItem("current_user") || "{}");
  } catch {
    return {};
  }
}
export function isAuthenticated(): boolean {
  return (
    !!localStorage.getItem("auth_token") ||
    !!localStorage.getItem("access_token")
  );
}
export function userHasRole(user: any, role: string): boolean {
  const roles = Array.isArray(user?.roles) ? user.roles : [];
  return roles.includes(role);
}
export function isAdminUser(user?: any): boolean {
  return userHasRole(user || getCurrentUserSafe(), "Admin");
}
