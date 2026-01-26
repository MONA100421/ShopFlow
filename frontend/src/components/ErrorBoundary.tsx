import React, { Component, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * real Error Boundary component
 */
class ErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  /**
   * When an error is thrown in a child component, update state to show fallback UI
   */
  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  /**
   * Log the error details (could be sent to an external logging service)
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}

/**
 * Fallback UI component displayed when an error occurs
 */
function ErrorFallback() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f8f8f8",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "2rem",
          borderRadius: "8px",
          textAlign: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ marginBottom: "1rem" }}>
          Something went wrong
        </h1>
        <p style={{ marginBottom: "1.5rem", color: "#666" }}>
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "0.5rem 1.2rem",
            borderRadius: "4px",
            border: "none",
            background: "#000",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Go Home
        </button>
      </div>
    </div>
  );
}

export default ErrorBoundary;
