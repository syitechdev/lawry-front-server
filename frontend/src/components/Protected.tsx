import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function Protected({
  children,
  role,
}: {
  children: JSX.Element;
  role?: "Admin" | "Client";
}) {
  const { user, loading, hasRole } = useAuth();
  if (loading) return null; // ou un spinner
  if (!user) return <Navigate to="/login" replace />;
  if (role && !hasRole(role)) return <Navigate to="/" replace />;
  return children;
}
