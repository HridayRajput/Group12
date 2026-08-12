import { FormEvent, useEffect, useMemo, useState } from "react";
import { customerApi } from "../api";
import type { Customer } from "../types";

type CustomerFormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
};

const emptyForm: CustomerFormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
};

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100";

export default function CustomersPanel() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [form, setForm] = useState<CustomerFormState>(emptyForm);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const visibleCustomers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return customers;
    }

    return customers.filter((customer) => {
      const searchBlob = [customer.firstName, customer.lastName, customer.email, customer.phone, customer.address]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchBlob.includes(normalizedSearch);
    });
  }, [customers, searchTerm]);

  const loadCustomers = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await customerApi.list();
      setCustomers(data);
    } catch (customerError) {
      setError(customerError instanceof Error ? customerError.message : "Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCustomers();
  }, []);

  const openCreateForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormVisible(true);
    setMessage("");
    setError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      address: form.address.trim() || null,
    };

    try {
      if (editingId === null) {
        await customerApi.create(payload);
        setMessage("Customer created successfully.");
      } else {
        await customerApi.update(editingId, payload);
        setMessage("Customer updated successfully.");
      }

      setForm(emptyForm);
      setEditingId(null);
      setFormVisible(false);
      await loadCustomers();
    } catch (customerError) {
      setError(customerError instanceof Error ? customerError.message : "Unable to save customer");
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingId(customer.customerId);
    setForm({
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone ?? "",
      address: customer.address ?? "",
    });
    setFormVisible(true);
    setMessage(`Editing customer #${customer.customerId}`);
  };

  const handleDelete = async (customerId: number) => {
    if (!window.confirm("Delete this customer?")) {
      return;
    }

    try {
      await customerApi.remove(customerId);
      setMessage("Customer deleted successfully.");
      await loadCustomers();
    } catch (customerError) {
      setError(customerError instanceof Error ? customerError.message : "Unable to delete customer");
    }
  };

  return (
    <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-violet-700">Customers</p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">Manage customer profiles</h2>
          <p className="mt-1 text-sm text-slate-500">Keep track of your buyers and contact details.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            className="rounded-full bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-violet-600/30 transition hover:bg-violet-700"
            type="button"
            onClick={openCreateForm}
          >
            Add customer
          </button>
          <div className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-600">
            {visibleCustomers.length} visible
          </div>
          <button
            className="rounded-full bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
            type="button"
            onClick={() => void loadCustomers()}
          >
            Refresh
          </button>
        </div>
      </div>

      <label className="grid max-w-md gap-1.5 text-sm font-medium text-slate-600">
        Search customers
        <input
          className={inputClass}
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search name, email, phone, or address"
        />
      </label>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      ) : null}
      {message ? (
        <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{message}</div>
      ) : null}

      {formVisible ? (
        <section className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-violet-700">
                {editingId === null ? "Add customer" : "Edit customer"}
              </p>
              <h2 className="mt-1 text-lg font-bold text-slate-900">
                {editingId === null ? "Create a new customer" : `Editing customer #${editingId}`}
              </h2>
            </div>
            <button
              className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
              type="button"
              onClick={() => setFormVisible(false)}
            >
              Close
            </button>
          </div>

          <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
            <label className="grid gap-1.5 text-sm font-medium text-slate-600">
              First name
              <input
                className={inputClass}
                value={form.firstName}
                onChange={(event) => setForm({ ...form, firstName: event.target.value })}
                required
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-600">
              Last name
              <input
                className={inputClass}
                value={form.lastName}
                onChange={(event) => setForm({ ...form, lastName: event.target.value })}
                required
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-600">
              Email
              <input
                className={inputClass}
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                required
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-600">
              Phone
              <input
                className={inputClass}
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-600 sm:col-span-2">
              Address
              <textarea
                className={inputClass}
                value={form.address}
                onChange={(event) => setForm({ ...form, address: event.target.value })}
                rows={3}
              />
            </label>
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <button
                className="flex-1 rounded-full bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-violet-600/30 transition hover:bg-violet-700 sm:flex-none"
                type="submit"
              >
                {editingId === null ? "Create customer" : "Update customer"}
              </button>
              <button
                className="flex-1 rounded-full bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200 sm:flex-none"
                type="button"
                onClick={() => setFormVisible(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {loading ? <p className="text-sm text-slate-500">Loading customers...</p> : null}
      {!loading && visibleCustomers.length === 0 ? (
        <div className="rounded-lg bg-slate-50 p-4 text-sm">
          <strong className="block text-slate-800">No customers found.</strong>
          <p className="mt-1 text-slate-500">Try another search or add a new customer.</p>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-left font-semibold text-slate-500">Name</th>
              <th className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-left font-semibold text-slate-500">Email</th>
              <th className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-left font-semibold text-slate-500">Phone</th>
              <th className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-left font-semibold text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleCustomers.map((customer) => (
              <tr key={customer.customerId} className="transition hover:bg-slate-50">
                <td className="border-b border-slate-100 px-3 py-3 align-top">
                  <strong className="text-slate-900">
                    {customer.firstName} {customer.lastName}
                  </strong>
                  <div className="text-sm text-slate-500">{customer.address ?? "No address on file"}</div>
                </td>
                <td className="border-b border-slate-100 px-3 py-3 align-top text-slate-700">{customer.email}</td>
                <td className="border-b border-slate-100 px-3 py-3 align-top text-slate-700">{customer.phone ?? "-"}</td>
                <td className="border-b border-slate-100 px-3 py-3 align-top">
                  <div className="flex flex-wrap gap-2">
                    <button
                      className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
                      type="button"
                      onClick={() => handleEdit(customer)}
                    >
                      Edit
                    </button>
                    <button
                      className="rounded-full bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-100"
                      type="button"
                      onClick={() => void handleDelete(customer.customerId)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
