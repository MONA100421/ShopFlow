import { useParams } from "react-router-dom";
import AuthForm from "../components/AuthForm";

/**
 * All supported auth modes
 */
type AuthMode = "login" | "register" | "reset" | "reset-success";

export default function AuthPage() {
  const { mode } = useParams<{ mode?: string }>();

  /**
   * Ensure mode is always valid
   * Fallback to "login" for any unknown value
   */
  const safeMode: AuthMode =
    mode === "register" ||
    mode === "reset" ||
    mode === "reset-success"
      ? mode
      : "login";

  return (
    <div className="auth-page">
      <AuthForm mode={safeMode} />
    </div>
  );
}
