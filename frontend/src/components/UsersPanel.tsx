import { useEffect, useState } from "react";
import { authApi } from "../api";
import type { UserAccount } from "../types";

interface UsersPanelProps {
  currentUserId: number;
}

export default function UsersPanel({ currentUserId }: UsersPanelProps) {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await authApi.listUsers();
      setUsers(data);
    } catch (usersError) {
      setError(usersError instanceof Error ? usersError.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const handleToggleRole = async (user: UserAccount) => {
    const nextRole = user.role === "admin" ? "member" : "admin";

    if (user.userId === currentUserId && nextRole === "member") {
      if (!window.confirm("This will remove your own admin access. Continue?")) {
        return;
      }
    }

    setError("");
    setMessage("");

    try {
      await authApi.updateUserRole(user.userId, nextRole);
      setMessage(`${user.fullName} is now ${nextRole}.`);
      await loadUsers();
    } catch (roleError) {
      setError(roleError instanceof Error ? roleError.message : "Unable to update role");
    }
  };

  return (
    <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-violet-700">Users</p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">Manage access</h2>
          <p className="mt-1 text-sm text-slate-500">Promote trusted members to admin or revoke access.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-600">{users.length} accounts</div>
          <button
            className="rounded-full bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
            type="button"
            onClick={() => void loadUsers()}
          >
            Refresh
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      ) : null}
      {message ? (
        <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{message}</div>
      ) : null}

      {loading ? <p className="text-sm text-slate-500">Loading users...</p> : null}

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-left font-semibold text-slate-500">Name</th>
              <th className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-left font-semibold text-slate-500">Username</th>
              <th className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-left font-semibold text-slate-500">Email</th>
              <th className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-left font-semibold text-slate-500">Role</th>
              <th className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-left font-semibold text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.userId} className="transition hover:bg-slate-50">
                <td className="border-b border-slate-100 px-3 py-3 align-top">
                  <strong className="text-slate-900">{user.fullName}</strong>
                  {user.userId === currentUserId ? <div className="text-sm text-slate-500">You</div> : null}
                </td>
                <td className="border-b border-slate-100 px-3 py-3 align-top text-slate-700">{user.username}</td>
                <td className="border-b border-slate-100 px-3 py-3 align-top text-slate-700">{user.email}</td>
                <td className="border-b border-slate-100 px-3 py-3 align-top">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      user.role === "admin"
                        ? "bg-violet-50 text-violet-700 ring-1 ring-violet-100"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="border-b border-slate-100 px-3 py-3 align-top">
                  <button
                    className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
                    type="button"
                    onClick={() => void handleToggleRole(user)}
                  >
                    {user.role === "admin" ? "Revoke admin" : "Make admin"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
