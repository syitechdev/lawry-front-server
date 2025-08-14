import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isAuthenticated, hasRole } from "@/lib/auth";

type Props = {
  roles?: string[];
  redirectTo?: string;
};

export default function RequireAuth({ roles, redirectTo = "/login" }: Props) {
  const location = useLocation();

  if (!isAuthenticated()) {
    const to = roles?.includes("Admin") ? `${redirectTo}?expired=1` : redirectTo;
    return <Navigate to={to} replace state={{ from: location }} />;
  }


  if (roles && roles.length > 0) {
    const ok = roles.some((r) => hasRole(r));
    if (!ok) {
   
      return <Navigate to="/login" replace />;
    }
  }

  return <Outlet />;
}
