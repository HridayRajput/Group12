import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { authApi } from "./api";
import type { User } from "./types";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import Dashboard from "./components/Dashboard";

type AuthState =
  | { status: "loading" }
  | { status: "authenticated"; user: User }
  | { status: "unauthenticated" };

export default function App() {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    let mounted = true;

    authApi
      .getCurrentUser()
      .then((user) => {
        if (mounted) {
          setAuthState({ status: "authenticated", user });
        }
      })
      .catch(() => {
        if (mounted) {
          setAuthState({ status: "unauthenticated" });
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleLogin = async (identifier: string, password: string) => {
    const user = await authApi.login(identifier, password);
    setAuthState({ status: "authenticated", user });
    navigate("/app", { replace: true });
  };

  const handleRegister = async (payload: {
    fullName: string;
    username: string;
    email: string;
    password: string;
  }) => {
    const user = await authApi.register(payload);
    setAuthState({ status: "authenticated", user });
    navigate("/app", { replace: true });
  };

  const handleLogout = async () => {
    await authApi.logout();
    setAuthState({ status: "unauthenticated" });
    navigate("/login", { replace: true });
  };

  if (authState.status === "loading") {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-slate-600 shadow-sm">
          Loading secure storefront...
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          authState.status === "authenticated" ? (
            <Navigate to="/app" replace />
          ) : (
            <LoginPage onLogin={handleLogin} />
          )
        }
      />
      <Route
        path="/register"
        element={
          authState.status === "authenticated" ? (
            <Navigate to="/app" replace />
          ) : (
            <RegisterPage onRegister={handleRegister} />
          )
        }
      />
      <Route
        path="/app/*"
        element={
          authState.status === "authenticated" ? (
            <Dashboard user={authState.user} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="*"
        element={<Navigate to={authState.status === "authenticated" ? "/app" : "/login"} replace />}
      />
    </Routes>
  );
}