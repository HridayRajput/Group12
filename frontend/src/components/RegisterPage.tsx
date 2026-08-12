import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";

interface RegisterPageProps {
  onRegister: (payload: {
    fullName: string;
    username: string;
    email: string;
    password: string;
  }) => Promise<void>;
}

export default function RegisterPage({ onRegister }: RegisterPageProps) {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await onRegister({
        fullName: fullName.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
      });
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (
    <div className="mx-auto min-h-screen w-full max-w-6xl px-4 py-6 sm:px-6">
      <header className="flex flex-col items-stretch gap-4 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-600 font-bold text-white">
            G12
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Group 12 Electronics</p>
            <strong className="text-slate-900">Create account</strong>
          </div>
        </div>

        <nav className="flex items-center gap-2" aria-label="Public navigation">
          <Link
            className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            to="/login"
          >
            Login
          </Link>
          <Link
            className="rounded-full px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50"
            to="/register"
          >
            Register
          </Link>
        </nav>
      </header>

      <main className="mt-6 grid gap-6 lg:grid-cols-5">
        <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-blue-50 p-8 shadow-sm lg:col-span-3">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-700">New user</p>
          <h1 className="mt-2 text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
            Create your member account
          </h1>
          <p className="mt-4 max-w-md text-slate-600">
            Register now to immediately access the product, order, and AI member pages.
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
              <p className="text-xs font-bold uppercase tracking-wider text-blue-700">New account</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">Register</h2>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              Member access
            </span>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
            <label className="grid gap-1.5 text-sm font-medium text-slate-600">
              Full name
              <input className={inputClass} value={fullName} onChange={(event) => setFullName(event.target.value)} required />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-600">
              Username
              <input className={inputClass} value={username} onChange={(event) => setUsername(event.target.value)} required />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-600">
              Email
              <input
                className={inputClass}
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-600">
              Password
              <input
                className={inputClass}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-600">
              Confirm password
              <input
                className={inputClass}
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
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
              {loading ? "Creating account..." : "Create account"}
            </button>

            <p className="text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-blue-700 hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </section>
      </main>
    </div>
  );
}
