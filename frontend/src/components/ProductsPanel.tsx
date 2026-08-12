import { FormEvent, useEffect, useMemo, useState } from "react";
import { productApi } from "../api";
import { useFavorites } from "../hooks/useFavorites";
import type { Product } from "../types";

type ProductFormState = {
  name: string;
  category: string;
  brand: string;
  description: string;
  price: string;
  stockQuantity: string;
};

const emptyForm: ProductFormState = {
  name: "",
  category: "",
  brand: "",
  description: "",
  price: "",
  stockQuantity: "",
};

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

interface ProductsPanelProps {
  canManage?: boolean;
}

export default function ProductsPanel({ canManage = true }: ProductsPanelProps) {
  const accentText = canManage ? "text-violet-700" : "text-blue-700";
  const accentButton = canManage
    ? "bg-violet-600 shadow-violet-600/30 hover:bg-violet-700"
    : "bg-blue-600 shadow-blue-600/30 hover:bg-blue-700";
  const { isFavorite, toggleFavorite } = useFavorites();
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const getStockLabel = (stockQuantity: number) => {
    if (stockQuantity === 0) {
      return { label: "Out of stock", className: "bg-red-50 text-red-700 ring-1 ring-red-100" };
    }

    if (stockQuantity < 20) {
      return { label: "Low stock", className: "bg-amber-50 text-amber-700 ring-1 ring-amber-100" };
    }

    return { label: "In stock", className: "bg-green-50 text-green-700 ring-1 ring-green-100" };
  };

  const visibleProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return products;
    }

    return products.filter((product) => {
      const searchBlob = [product.name, product.category, product.brand, product.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchBlob.includes(normalizedSearch);
    });
  }, [products, searchTerm]);

  const loadProducts = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await productApi.list();
      setProducts(data);
    } catch (productError) {
      setError(productError instanceof Error ? productError.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProducts();
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

    const price = Number(form.price);
    const stockQuantity = Number(form.stockQuantity);

    if (Number.isNaN(price) || Number.isNaN(stockQuantity)) {
      setError("Price and stock quantity must be numeric.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      category: form.category.trim() || null,
      brand: form.brand.trim() || null,
      description: form.description.trim() || null,
      price,
      stockQuantity,
    };

    try {
      if (editingId === null) {
        await productApi.create(payload);
        setMessage("Product created successfully.");
      } else {
        await productApi.update(editingId, payload);
        setMessage("Product updated successfully.");
      }

      setForm(emptyForm);
      setEditingId(null);
      setFormVisible(false);
      await loadProducts();
    } catch (productError) {
      setError(productError instanceof Error ? productError.message : "Unable to save product");
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.productId);
    setForm({
      name: product.name,
      category: product.category ?? "",
      brand: product.brand ?? "",
      description: product.description ?? "",
      price: String(product.price),
      stockQuantity: String(product.stockQuantity),
    });
    setFormVisible(true);
    setMessage(`Editing product #${product.productId}`);
  };

  const handleDelete = async (productId: number) => {
    if (!window.confirm("Delete this product?")) {
      return;
    }

    try {
      await productApi.remove(productId);
      setMessage("Product deleted successfully.");
      await loadProducts();
    } catch (productError) {
      setError(productError instanceof Error ? productError.message : "Unable to delete product");
    }
  };

  return (
    <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className={`text-xs font-bold uppercase tracking-wider ${accentText}`}>Products</p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">
            {canManage ? "Manage inventory" : "Browse our catalog"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {canManage
              ? "Search, create, update, and remove store items."
              : "Explore what's currently in stock at Group 12 Electronics."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canManage ? (
            <button
              className={`rounded-full px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition ${accentButton}`}
              type="button"
              onClick={openCreateForm}
            >
              Add product
            </button>
          ) : null}
          <div className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-600">
            {visibleProducts.length} visible
          </div>
          <button
            className="rounded-full bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
            type="button"
            onClick={() => void loadProducts()}
          >
            Refresh
          </button>
        </div>
      </div>

      <label className="grid max-w-md gap-1.5 text-sm font-medium text-slate-600">
        Search products
        <input
          className={inputClass}
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search name, category, brand, or description"
        />
      </label>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      ) : null}
      {message ? (
        <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{message}</div>
      ) : null}

      {formVisible && canManage ? (
        <section className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider ${accentText}`}>
                {editingId === null ? "Add product" : "Edit product"}
              </p>
              <h2 className="mt-1 text-lg font-bold text-slate-900">
                {editingId === null ? "Create a new product" : `Editing product #${editingId}`}
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
              Product name
              <input
                className={inputClass}
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                required
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-600">
              Category
              <input
                className={inputClass}
                value={form.category}
                onChange={(event) => setForm({ ...form, category: event.target.value })}
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-600">
              Brand
              <input
                className={inputClass}
                value={form.brand}
                onChange={(event) => setForm({ ...form, brand: event.target.value })}
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-600 sm:col-span-2">
              Description
              <textarea
                className={inputClass}
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                rows={3}
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-600">
              Price
              <input
                className={inputClass}
                type="number"
                step="0.01"
                value={form.price}
                onChange={(event) => setForm({ ...form, price: event.target.value })}
                required
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-600">
              Stock quantity
              <input
                className={inputClass}
                type="number"
                step="1"
                value={form.stockQuantity}
                onChange={(event) => setForm({ ...form, stockQuantity: event.target.value })}
                required
              />
            </label>
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <button
                className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition sm:flex-none ${accentButton}`}
                type="submit"
              >
                {editingId === null ? "Create product" : "Update product"}
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

      {loading ? <p className="text-sm text-slate-500">Loading products...</p> : null}
      {!loading && visibleProducts.length === 0 ? (
        <div className="rounded-lg bg-slate-50 p-4 text-sm">
          <strong className="block text-slate-800">No products found.</strong>
          <p className="mt-1 text-slate-500">Try a different search{canManage ? " or add a new product." : "."}</p>
        </div>
      ) : null}

      {canManage ? (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-left font-semibold text-slate-500">Name</th>
                <th className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-left font-semibold text-slate-500">Brand</th>
                <th className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-left font-semibold text-slate-500">Status</th>
                <th className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-left font-semibold text-slate-500">Price</th>
                <th className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-left font-semibold text-slate-500">Stock</th>
                <th className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-left font-semibold text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleProducts.map((product) => (
                <tr key={product.productId} className="transition hover:bg-slate-50">
                  <td className="border-b border-slate-100 px-3 py-3 align-top">
                    <strong className="text-slate-900">{product.name}</strong>
                    <div className="text-sm text-slate-500">{product.category ?? "Uncategorized"}</div>
                  </td>
                  <td className="border-b border-slate-100 px-3 py-3 align-top text-slate-700">{product.brand ?? "-"}</td>
                  <td className="border-b border-slate-100 px-3 py-3 align-top">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStockLabel(product.stockQuantity).className}`}>
                      {getStockLabel(product.stockQuantity).label}
                    </span>
                  </td>
                  <td className="border-b border-slate-100 px-3 py-3 align-top tabular-nums text-slate-700">
                    ${Number(product.price).toFixed(2)}
                  </td>
                  <td className="border-b border-slate-100 px-3 py-3 align-top tabular-nums text-slate-700">
                    {product.stockQuantity}
                  </td>
                  <td className="border-b border-slate-100 px-3 py-3 align-top">
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
                        type="button"
                        onClick={() => handleEdit(product)}
                      >
                        Edit
                      </button>
                      <button
                        className="rounded-full bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-100"
                        type="button"
                        onClick={() => void handleDelete(product.productId)}
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
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleProducts.map((product) => (
            <article
              key={product.productId}
              className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-lg font-bold text-blue-700">
                  {product.name.charAt(0).toUpperCase()}
                </div>
                <button
                  type="button"
                  className={`text-xl transition hover:scale-110 ${
                    isFavorite(product.productId) ? "text-rose-500" : "text-slate-300 hover:text-rose-400"
                  }`}
                  onClick={() => toggleFavorite(product.productId)}
                  aria-label={isFavorite(product.productId) ? "Remove from favorites" : "Add to favorites"}
                  title={isFavorite(product.productId) ? "Remove from favorites" : "Add to favorites"}
                >
                  ♥
                </button>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
                  {product.category ?? "Uncategorized"}
                </p>
                <h3 className="mt-1 text-lg font-bold text-slate-900">{product.name}</h3>
                <p className="text-sm text-slate-500">{product.brand ?? "Unbranded"}</p>
                {product.description ? (
                  <p className="mt-2 text-sm text-slate-500">{product.description}</p>
                ) : null}
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-lg font-bold tabular-nums text-blue-700">
                  ${Number(product.price).toFixed(2)}
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStockLabel(product.stockQuantity).className}`}>
                  {getStockLabel(product.stockQuantity).label}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
