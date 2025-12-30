import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface Props {
  children: ReactNode;
}

export default function RequireAdmin({ children }: Props) {
  const { isAuthenticated, user, initialized } = useSelector(
    (state: RootState) => state.auth
  );
  if (!initialized) {
    return null; // or a loading spinner
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
