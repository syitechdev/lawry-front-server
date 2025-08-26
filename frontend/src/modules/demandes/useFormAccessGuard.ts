import { useMemo } from "react";
import { getCurrentUserSafe, isAuthenticated, isAdminUser } from "@/lib/user";

export function useFormAccessGuard() {
  const auth = isAuthenticated();
  const me = getCurrentUserSafe();
  const isAdmin = auth && isAdminUser(me);

  const blocked = !!isAdmin;
  const reason = isAdmin
    ? "Les comptes administrateur ne peuvent pas soumettre de demande."
    : null;

  return { blocked, reason, auth, me };
}
