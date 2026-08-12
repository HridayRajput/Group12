import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";

interface LoginPageProps {
  onLogin: (identifier: string, password: string) => Promise<void>;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await onLogin(identifier.trim(), password);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-6xl px-4 py-6 sm:px-6">
      <header className="flex flex-col items-stretch gap-4 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-600 font-bold text-white">
            G12
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Group 12 Electronics</p>
            <strong className="text-slate-900">Secure storefront</strong>
          </div>
        </div>

        <nav className="flex items-center gap-2" aria-label="Public navigation">
          <Link
            className="rounded-full px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50"
            to="/login"
          >
            Login
          </Link>
          <Link
            className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            to="/register"
          >
            Register
          </Link>
        </nav>
      </header>

      <main className="mt-6 grid gap-6 lg:grid-cols-5">
        <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-blue-50 p-8 shadow-sm lg:col-span-3">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Welcome back</p>
          <h1 className="mt-2 text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
            Sign in to your member panel
          </h1>
          <p className="mt-4 max-w-md text-slate-600">
            Sign in to browse the catalog, place orders, and use AI-assisted shopping tools.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-white/80 p-4 ring-1 ring-blue-100">
              <span className="text-xl">🛒</span>
              <p className="mt-2 text-sm font-semibold text-slate-800">Live catalog</p>
              <p className="mt-1 text-xs text-slate-500">Real-time stock and pricing.</p>
            </div>
            <div className="rounded-xl bg-white/80 p-4 ring-1 ring-blue-100">
              <span className="text-xl">🔒</span>
              <p className="mt-2 text-sm font-semibold text-slate-800">Secure access</p>
              <p className="mt-1 text-xs text-slate-500">JWT sessions, hashed passwords.</p>
            </div>
            <div className="rounded-xl bg-white/80 p-4 ring-1 ring-blue-100">
              <span className="text-xl">✨</span>
              <p className="mt-2 text-sm font-semibold text-slate-800">AI assisted</p>
              <p className="mt-1 text-xs text-slate-500">Smart descriptions & picks.</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Welcome back</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">Sign in</h2>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              Ready to sign in
            </span>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
            <label className="grid gap-1.5 text-sm font-medium text-slate-600">
              Username or email
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                type="text"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder="Enter your username or email"
                autoComplete="username"
                required
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-600">
              Password
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </label>

            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <button
              className="mt-1 rounded-full bg-blue-600 px-4 py-2.5 font-semibold text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

            <p className="text-center text-sm text-slate-500">
              New here?{" "}
              <Link to="/register" className="font-semibold text-blue-700 hover:underline">
                Create an account
              </Link>
            </p>
          </form>
        </section>
      </main>
    </div>
  );
}
