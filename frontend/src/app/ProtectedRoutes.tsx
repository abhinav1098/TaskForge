import { Navigate } from "react-router-dom";
import { useAuth } from "../features/auth/context";

type Props = {
  children: React.ReactNode;
};

export default function ProtectedRoute({ children }: Props) {
  const { accessToken } = useAuth();

  if (!accessToken) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
