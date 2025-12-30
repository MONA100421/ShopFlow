import { useParams } from "react-router-dom";
import AuthForm from "../components/AuthForm";

type AuthMode = "login" | "register" | "reset";

export default function AuthPage() {
  const { mode } = useParams<{ mode: AuthMode }>();

  // Ensure mode is one of the expected values
  const safeMode: AuthMode =
    mode === "register" || mode === "reset" ? mode : "login";

  return (
    <div className="container">
      <AuthForm mode={safeMode} />
    </div>
  );
}
