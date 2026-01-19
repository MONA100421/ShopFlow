import { useNavigate } from "react-router-dom";
import errorCircle from "../assets/error-circle.svg";
import "./NotFoundPage.css";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="error-page">
      <div className="error-card">
        <img
          src={errorCircle}
          alt="error"
          className="error-icon"
        />

        {/* Error Title */}
        <h1 className="error-title">
          Oops, something went wrong!
        </h1>

        {/* Action Button */}
        <button
          className="error-btn"
          onClick={() => navigate("/")}
        >
          Go Home
        </button>
      </div>
    </div>
  );
}
