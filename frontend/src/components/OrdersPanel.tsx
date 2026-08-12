import { FormEvent, useEffect, useMemo, useState } from "react";
import { customerApi, orderApi, productApi } from "../api";
import type { CustomerLookup, Order, Product } from "../types";

type OrderFormState = {
  customerId: string;
  productId: string;
  quantity: string;
  totalPrice: string;
};

const emptyForm: OrderFormState = {
  customerId: "",
  productId: "",
  quantity: "",
  totalPrice: "",
};

type MemberOrderFormState = {
  productId: string;
  quantity: string;
  totalPrice: string;
};

const emptyMemberForm: MemberOrderFormState = {
  productId: "",
  quantity: "",
  totalPrice: "",
};

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

interface OrdersPanelProps {
  canManage?: boolean;
  customerId?: number | null;
}

function MemberOrdersView({ customerId }: { customerId: number | null | undefined }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [placedOrders, setPlacedOrders] = useState<Order[]>([]);
  const [form, setForm] = useState<MemberOrderFormState>(emptyMemberForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const productById = useMemo(() => new Map(products.map((product) => [product.productId, product])), [products]);

  useEffect(() => {
    let mounted = true;

    productApi
      .list()
      .then((data) => {
        if (mounted) setProducts(data);
      })
      .catch((productError) => {
        if (mounted) setError(productError instanceof Error ? productError.message : "Failed to load products");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!customerId) {
      setError("Your account is not linked to a customer profile yet.");
      return;
    }

    const productId = Number(form.productId);
    const quantity = Number(form.quantity);
    const totalPrice = Number(form.totalPrice);

    if ([productId, quantity, totalPrice].some(Number.isNaN)) {
      setError("All order fields must be numeric.");
      return;
    }

    try {
      const created = await orderApi.create({ customerId, productId, quantity, totalPrice });
      setMessage("Order created successfully.");
      setPlacedOrders((previous) => [created, ...previous]);
      setForm(emptyMemberForm);
    } catch (orderError) {
      setError(orderError instanceof Error ? orderError.message : "Unable to place order");
    }
  };

  return (
    <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Orders</p>
        <h2 className="mt-1 text-xl font-bold text-slate-900">Place an order</h2>
        <p className="mt-1 text-sm text-slate-500">
          Pick a product and quantity below. Orders are placed under your own account.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      ) : null}
      {message ? (
        <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{message}</div>
      ) : null}

      <form className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:grid-cols-2" onSubmit={handleSubmit}>
        <label className="grid gap-1.5 text-sm font-medium text-slate-600 sm:col-span-2">
          Product
          <select
            className={inputClass}
            value={form.productId}
            onChange={(event) => {
              const productId = event.target.value;
              const product = products.find((item) => String(item.productId) === productId);
              setForm({
                ...form,
                productId,
                totalPrice:
                  product && form.quantity ? String(Number(product.price) * Number(form.quantity)) : form.totalPrice,
              });
            }}
            required
            disabled={loading}
          >
            <option value="">Select a product</option>
            {products.map((product) => (
              <option key={product.productId} value={product.productId}>
                {product.name} · ${Number(product.price).toFixed(2)}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-slate-600">
          Quantity
          <input
            className={inputClass}
            type="number"
            min="1"
            value={form.quantity}
            onChange={(event) => {
              const quantity = event.target.value;
              const product = products.find((item) => String(item.productId) === form.productId);
              setForm({
                ...form,
                quantity,
                totalPrice: product && quantity ? String(Number(product.price) * Number(quantity)) : form.totalPrice,
              });
            }}
            required
          />
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-slate-600">
          Total price
          <input
            className={inputClass}
            type="number"
            step="0.01"
            value={form.totalPrice}
            onChange={(event) => setForm({ ...form, totalPrice: event.target.value })}
            required
          />
        </label>
        <button
          className="rounded-full bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-700 sm:col-span-2"
          type="submit"
        >
          Place order
        </button>
      </form>

      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Your orders this session</p>
        {placedOrders.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">Orders you place will show up here.</p>
        ) : (
          <div className="mt-3 grid gap-2">
            {placedOrders.map((order) => {
              const product = productById.get(order.productId);
              return (
                <div
                  key={order.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <div>
                    <strong className="text-slate-900">#{order.id} · {product ? product.name : `Product ${order.productId}`}</strong>
                    <div className="text-sm text-slate-500">Qty {order.quantity}</div>
                  </div>
                  <span className="font-semibold tabular-nums text-blue-700">${Number(order.totalPrice).toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function AdminOrdersView() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<CustomerLookup[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<OrderFormState>(emptyForm);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const customerById = useMemo(() => new Map(customers.map((customer) => [customer.customerId, customer])), [customers]);
  const productById = useMemo(() => new Map(products.map((product) => [product.productId, product])), [products]);

  const visibleOrders = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return orders;
    }

    return orders.filter((order) => {
      const customer = customerById.get(order.customerId);
      const product = productById.get(order.productId);
      const searchBlob = [
        String(order.id),
        String(order.customerId),
        String(order.productId),
        customer ? `${customer.firstName} ${customer.lastName}` : "",
        product ? product.name : "",
      ]
        .join(" ")
        .toLowerCase();

      return searchBlob.includes(normalizedSearch);
    });
  }, [orders, customerById, productById, searchTerm]);

  const loadOrders = async () => {
    setLoading(true);
    setError("");

    try {
      const [ordersData, customersData, productsData] = await Promise.all([
        orderApi.list(),
        customerApi.list(),
        productApi.list(),
      ]);

      setOrders(ordersData);
      setCustomers(customersData);
      setProducts(productsData);
    } catch (orderError) {
      setError(orderError instanceof Error ? orderError.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOrders();
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

    const orderCustomerId = Number(form.customerId);
    const productId = Number(form.productId);
    const quantity = Number(form.quantity);
    const totalPrice = Number(form.totalPrice);

    if ([orderCustomerId, productId, quantity, totalPrice].some(Number.isNaN)) {
      setError("All order fields must be numeric.");
      return;
    }

    const payload = { customerId: orderCustomerId, productId, quantity, totalPrice };

    try {
      if (editingId === null) {
        await orderApi.create(payload);
        setMessage("Order created successfully.");
      } else {
        await orderApi.update(editingId, payload);
        setMessage("Order updated successfully.");
      }

      setForm(emptyForm);
      setEditingId(null);
      setFormVisible(false);
      await loadOrders();
    } catch (orderError) {
      setError(orderError instanceof Error ? orderError.message : "Unable to save order");
    }
  };

  const handleEdit = (order: Order) => {
    setEditingId(order.id);
    setForm({
      customerId: String(order.customerId),
      productId: String(order.productId),
      quantity: String(order.quantity),
      totalPrice: String(order.totalPrice),
    });
    setFormVisible(true);
    setMessage(`Editing order #${order.id}`);
  };

  const handleDelete = async (orderId: number) => {
    if (!window.confirm("Delete this order?")) {
      return;
    }

    try {
      await orderApi.remove(orderId);
      setMessage("Order deleted successfully.");
      await loadOrders();
    } catch (orderError) {
      setError(orderError instanceof Error ? orderError.message : "Unable to delete order");
    }
  };

  return (
    <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-violet-700">Orders</p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">Track purchases</h2>
          <p className="mt-1 text-sm text-slate-500">Review customer orders and update totals with ease.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            className="rounded-full bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-violet-600/30 transition hover:bg-violet-700"
            type="button"
            onClick={openCreateForm}
          >
            Add order
          </button>
          <div className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-600">
            {visibleOrders.length} visible
          </div>
          <button
            className="rounded-full bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
            type="button"
            onClick={() => void loadOrders()}
          >
            Refresh
          </button>
        </div>
      </div>

      <label className="grid max-w-md gap-1.5 text-sm font-medium text-slate-600">
        Search orders
        <input
          className={inputClass}
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search order id, customer, or product"
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
                {editingId === null ? "Add order" : "Edit order"}
              </p>
              <h2 className="mt-1 text-lg font-bold text-slate-900">
                {editingId === null ? "Create a new order" : `Editing order #${editingId}`}
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
              Customer
              <select
                className={inputClass}
                value={form.customerId}
                onChange={(event) => setForm({ ...form, customerId: event.target.value })}
                required
              >
                <option value="">Select a customer</option>
                {customers.map((customer) => (
                  <option key={customer.customerId} value={customer.customerId}>
                    {customer.firstName} {customer.lastName}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-600">
              Product
              <select
                className={inputClass}
                value={form.productId}
                onChange={(event) => setForm({ ...form, productId: event.target.value })}
                required
              >
                <option value="">Select a product</option>
                {products.map((product) => (
                  <option key={product.productId} value={product.productId}>
                    {product.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-600">
              Quantity
              <input
                className={inputClass}
                type="number"
                value={form.quantity}
                onChange={(event) => setForm({ ...form, quantity: event.target.value })}
                required
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-600">
              Total price
              <input
                className={inputClass}
                type="number"
                step="0.01"
                value={form.totalPrice}
                onChange={(event) => setForm({ ...form, totalPrice: event.target.value })}
                required
              />
            </label>
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <button
                className="flex-1 rounded-full bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-violet-600/30 transition hover:bg-violet-700 sm:flex-none"
                type="submit"
              >
                {editingId === null ? "Create order" : "Update order"}
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

      {loading ? <p className="text-sm text-slate-500">Loading orders...</p> : null}
      {!loading && visibleOrders.length === 0 ? (
        <div className="rounded-lg bg-slate-50 p-4 text-sm">
          <strong className="block text-slate-800">No orders found.</strong>
          <p className="mt-1 text-slate-500">Try a different search or create a new order.</p>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-left font-semibold text-slate-500">Order</th>
              <th className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-left font-semibold text-slate-500">Customer</th>
              <th className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-left font-semibold text-slate-500">Product</th>
              <th className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-left font-semibold text-slate-500">Total</th>
              <th className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-left font-semibold text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleOrders.map((order) => {
              const customer = customerById.get(order.customerId);
              const product = productById.get(order.productId);

              return (
                <tr key={order.id} className="transition hover:bg-slate-50">
                  <td className="border-b border-slate-100 px-3 py-3 align-top">
                    <strong className="text-slate-900">#{order.id}</strong>
                    <div className="text-sm text-slate-500">Qty {order.quantity}</div>
                  </td>
                  <td className="border-b border-slate-100 px-3 py-3 align-top text-slate-700">
                    {customer ? `${customer.firstName} ${customer.lastName}` : `Customer ${order.customerId}`}
                  </td>
                  <td className="border-b border-slate-100 px-3 py-3 align-top text-slate-700">
                    {product ? product.name : `Product ${order.productId}`}
                  </td>
                  <td className="border-b border-slate-100 px-3 py-3 align-top tabular-nums text-slate-700">
                    ${Number(order.totalPrice).toFixed(2)}
                  </td>
                  <td className="border-b border-slate-100 px-3 py-3 align-top">
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
                        type="button"
                        onClick={() => handleEdit(order)}
                      >
                        Edit
                      </button>
                      <button
                        className="rounded-full bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-100"
                        type="button"
                        onClick={() => void handleDelete(order.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function OrdersPanel({ canManage = true, customerId }: OrdersPanelProps) {
  return canManage ? <AdminOrdersView /> : <MemberOrdersView customerId={customerId} />;
}
