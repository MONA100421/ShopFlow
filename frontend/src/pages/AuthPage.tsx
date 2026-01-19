import { useParams } from "react-router-dom";
import AuthForm from "../components/AuthForm";

type AuthMode = "login" | "register" | "reset" | "reset-success";

export default function AuthPage() {
  const { mode } = useParams<{ mode?: string }>();
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
