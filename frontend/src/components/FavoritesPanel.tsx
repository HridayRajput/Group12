import { useEffect, useState } from "react";
import { productApi } from "../api";
import { useFavorites } from "../hooks/useFavorites";
import type { Product } from "../types";

export default function FavoritesPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { favoriteIds, toggleFavorite } = useFavorites();

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    productApi
      .list()
      .then((data) => {
        if (mounted) {
          setProducts(data);
        }
      })
      .catch((productError) => {
        if (mounted) {
          setError(productError instanceof Error ? productError.message : "Failed to load products");
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const favoriteProducts = products.filter((product) => favoriteIds.includes(product.productId));

  return (
    <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Favorites</p>
        <h2 className="mt-1 text-xl font-bold text-slate-900">Your saved products</h2>
        <p className="mt-1 text-sm text-slate-500">
          Products you've hearted from the catalog. Saved on this device only.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      ) : null}
      {loading ? <p className="text-sm text-slate-500">Loading favorites...</p> : null}

      {!loading && favoriteProducts.length === 0 ? (
        <div className="rounded-lg bg-slate-50 p-4 text-sm">
          <strong className="block text-slate-800">No favorites yet.</strong>
          <p className="mt-1 text-slate-500">
            Open Products and tap the heart on any item to save it here.
          </p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {favoriteProducts.map((product) => (
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
                className="text-xl text-rose-500 transition hover:scale-110"
                onClick={() => toggleFavorite(product.productId)}
                aria-label="Remove from favorites"
                title="Remove from favorites"
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
            </div>
            <span className="text-lg font-bold tabular-nums text-blue-700">
              ${Number(product.price).toFixed(2)}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
