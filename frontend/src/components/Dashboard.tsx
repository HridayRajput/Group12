import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { CustomerLookup, Order, Product, User } from "../types";
import ProductsPanel from "./ProductsPanel";
import CustomersPanel from "./CustomersPanel";
import OrdersPanel from "./OrdersPanel";
import UsersPanel from "./UsersPanel";
import AiAssistant from "./AiAssistant";
import FavoritesPanel from "./FavoritesPanel";
import { useFavorites } from "../hooks/useFavorites";
import { customerApi, orderApi, productApi } from "../api";

interface DashboardProps {
  user: User;
  onLogout: () => Promise<void>;
}

type Section = "overview" | "products" | "customers" | "orders" | "users" | "favorites" | "ai";

function getSectionFromPath(pathname: string): Section {
  const normalizedPath = pathname.replace(/\/+$/, "");

  if (normalizedPath.endsWith("/products")) return "products";
  if (normalizedPath.endsWith("/customers")) return "customers";
  if (normalizedPath.endsWith("/orders")) return "orders";
  if (normalizedPath.endsWith("/users")) return "users";
  if (normalizedPath.endsWith("/favorites")) return "favorites";
  if (normalizedPath.endsWith("/ai")) return "ai";

  return "overview";
}

function timeOfDayGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

const LOW_STOCK_THRESHOLD = 20;

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = user.role === "admin";
  const activeSection = getSectionFromPath(location.pathname);
  const { favoriteIds } = useFavorites();

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<CustomerLookup[]>([]);
  const [summaryLoading, setSummaryLoading] = useState(true);

  const theme = isAdmin
    ? {
        mark: "bg-gradient-to-br from-violet-600 to-indigo-700",
        text: "text-violet-700",
        bgSoft: "bg-violet-50",
        chipActive: "bg-violet-50 text-violet-700",
        buttonSoft: "bg-violet-50 text-violet-700 ring-1 ring-violet-100",
        heroGradient: "from-white to-violet-50",
        topBorder: "border-t-4 border-t-violet-600",
        label: "Admin panel",
        eyebrow: "Store administration",
      }
    : {
        mark: "bg-gradient-to-br from-blue-600 to-indigo-600",
        text: "text-blue-700",
        bgSoft: "bg-blue-50",
        chipActive: "bg-blue-50 text-blue-700",
        buttonSoft: "bg-blue-50 text-blue-700 ring-1 ring-blue-100",
        heroGradient: "from-white to-blue-50",
        topBorder: "",
        label: "Member panel",
        eyebrow: "Member workspace",
      };

  const sections = useMemo(() => {
    const base: Array<{ key: Section; label: string }> = [
      { key: "overview", label: "Dashboard" },
      { key: "products", label: "Products" },
    ];

    if (isAdmin) {
      base.push({ key: "customers", label: "Customers" });
    }

    base.push({ key: "orders", label: "Orders" });

    if (isAdmin) {
      base.push({ key: "users", label: "Users" });
    } else {
      base.push({ key: "favorites", label: "Favorites" });
    }

    base.push({ key: "ai", label: "AI Assistant" });

    return base;
  }, [isAdmin]);

  const quickActions = useMemo(
    () => sections.filter((section) => section.key !== "overview"),
    [sections]
  );

  const goToSection = (section: Section) => {
    navigate(section === "overview" ? "/app" : `/app/${section}`);
  };

  useEffect(() => {
    if (!isAdmin && (activeSection === "customers" || activeSection === "users")) {
      navigate("/app", { replace: true });
    }
  }, [isAdmin, activeSection, navigate]);

  useEffect(() => {
    let mounted = true;

    Promise.all([productApi.list(), orderApi.list(), customerApi.lookup()])
      .then(([productsData, ordersData, customersData]) => {
        if (mounted) {
          setProducts(productsData);
          setOrders(ordersData);
          setCustomers(customersData);
        }
      })
      .catch(() => {
        if (mounted) {
          setProducts([]);
          setOrders([]);
          setCustomers([]);
        }
      })
      .finally(() => {
        if (mounted) {
          setSummaryLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const customerById = useMemo(() => new Map(customers.map((customer) => [customer.customerId, customer])), [customers]);
  const productById = useMemo(() => new Map(products.map((product) => [product.productId, product])), [products]);
  const lowStockProducts = useMemo(
    () => products.filter((product) => product.stockQuantity < LOW_STOCK_THRESHOLD).slice(0, 5),
    [products]
  );
  const inventoryValue = useMemo(
    () => products.reduce((total, product) => total + Number(product.price) * product.stockQuantity, 0),
    [products]
  );
  const recentOrders = useMemo(
    () => [...orders].sort((a, b) => b.id - a.id).slice(0, 5),
    [orders]
  );

  return (
    <div className="mx-auto min-h-screen w-full max-w-6xl px-4 py-6 sm:px-6">
      <header
        className={`sticky top-3 z-10 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between ${theme.topBorder}`}
      >
        <div className="flex items-center gap-3">
          <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl font-bold text-white ${theme.mark}`}>
            G12
          </div>
          <div>
            <p className={`text-xs font-bold uppercase tracking-wider ${theme.text}`}>{theme.eyebrow}</p>
            <strong className="text-slate-900">{theme.label}</strong>
          </div>
        </div>

        <nav
          className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto whitespace-nowrap py-0.5 sm:justify-center [mask-image:linear-gradient(to_right,black_92%,transparent_100%)] sm:[mask-image:none]"
          aria-label="Dashboard navigation"
        >
          {sections.map((section) => (
            <button
              key={section.key}
              type="button"
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                section.key === activeSection
                  ? theme.chipActive
                  : "text-slate-600 hover:bg-slate-100"
              }`}
              onClick={() => goToSection(section.key)}
              aria-current={section.key === activeSection ? "page" : undefined}
            >
              {section.label}
              {section.key === "favorites" && favoriteIds.length > 0 ? (
                <span className="ml-1.5 rounded-full bg-rose-100 px-1.5 py-0.5 text-[0.65rem] font-bold text-rose-600">
                  {favoriteIds.length}
                </span>
              ) : null}
            </button>
          ))}
        </nav>

        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <div className={`rounded-full px-3 py-1.5 text-xs font-semibold ${theme.bgSoft} ${theme.text}`}>
            {isAdmin ? "Admin" : "Member"} · {user.email}
          </div>
          <button
            className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
            type="button"
            onClick={() => void onLogout()}
          >
            Logout
          </button>
        </div>
      </header>

      {activeSection === "overview" ? (
        <section className="mt-6 grid gap-4 lg:grid-cols-5">
          <article className={`grid gap-6 rounded-2xl border border-slate-200 bg-gradient-to-br p-6 shadow-sm sm:grid-cols-2 lg:col-span-3 ${theme.heroGradient}`}>
            <div className="sm:col-span-2">
              <p className={`text-xs font-bold uppercase tracking-wider ${theme.text}`}>{theme.label}</p>
              <h1 className="mt-2 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
                {timeOfDayGreeting()}, {user.fullName.split(" ")[0]}
              </h1>
              <p className="mt-3 max-w-md text-slate-600">
                {isAdmin
                  ? "Manage the full product catalog, customer records, orders, and user access from one place."
                  : "Browse products, place orders, save favorites, and use the AI assistant from your member workspace."}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {quickActions.map((action) => (
                  <button
                    key={action.key}
                    type="button"
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${theme.buttonSoft} transition hover:brightness-95`}
                    onClick={() => goToSection(action.key)}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:col-span-2 sm:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-white/70 p-3">
                <span className="block text-[0.7rem] font-bold uppercase tracking-wide text-slate-500">
                  {isAdmin ? "Administrator" : "Member"}
                </span>
                <strong className="mt-1 block truncate text-slate-900">{user.fullName}</strong>
                <p className="truncate text-sm text-slate-500">{user.email}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white/70 p-3">
                <span className="block text-[0.7rem] font-bold uppercase tracking-wide text-slate-500">Inventory</span>
                <strong className="mt-1 block text-2xl tabular-nums text-slate-900">
                  {summaryLoading ? "..." : products.length}
                </strong>
                <p className="text-sm text-slate-500">Items tracked</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white/70 p-3">
                <span className="block text-[0.7rem] font-bold uppercase tracking-wide text-slate-500">Orders</span>
                <strong className="mt-1 block text-2xl tabular-nums text-slate-900">
                  {summaryLoading ? "..." : orders.length}
                </strong>
                <p className="text-sm text-slate-500">Transactions</p>
              </div>
              {isAdmin ? (
                <div className="rounded-xl border border-slate-200 bg-white/70 p-3">
                  <span className="block text-[0.7rem] font-bold uppercase tracking-wide text-slate-500">Inventory value</span>
                  <strong className="mt-1 block text-2xl tabular-nums text-slate-900">
                    {summaryLoading ? "..." : `$${inventoryValue.toFixed(0)}`}
                  </strong>
                  <p className="text-sm text-slate-500">At current stock</p>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-white/70 p-3">
                  <span className="block text-[0.7rem] font-bold uppercase tracking-wide text-slate-500">Favorites</span>
                  <strong className="mt-1 block text-2xl tabular-nums text-slate-900">{favoriteIds.length}</strong>
                  <p className="text-sm text-slate-500">Saved products</p>
                </div>
              )}
            </div>
          </article>

          <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <p className={`text-xs font-bold uppercase tracking-wider ${theme.text}`}>Quick access</p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">Open a page to manage live data</h2>
            <ol className="mt-4 grid gap-2.5 list-decimal pl-4 text-slate-600">
              {isAdmin ? (
                <>
                  <li>Open Products to add, edit, or remove inventory.</li>
                  <li>Manage Customers and keep contact details current.</li>
                  <li>Review Orders and update fulfillment details.</li>
                  <li>Open Users to promote members or revoke admin access.</li>
                </>
              ) : (
                <>
                  <li>Browse Products to see what's currently in stock.</li>
                  <li>Heart items to save them under Favorites.</li>
                  <li>Place an order from the Orders page.</li>
                  <li>Use the AI assistant for descriptions and picks.</li>
                </>
              )}
            </ol>
          </aside>
        </section>
      ) : null}

      <main className="mt-4 grid gap-4">
        {activeSection === "overview" && isAdmin ? (
          <section className="grid gap-4 sm:grid-cols-2">
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-violet-700">Recent orders</p>
              <h2 className="mt-1 text-lg font-bold text-slate-900">Latest activity</h2>
              {recentOrders.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">No orders yet.</p>
              ) : (
                <div className="mt-3 grid gap-2">
                  {recentOrders.map((order) => {
                    const customer = customerById.get(order.customerId);
                    const product = productById.get(order.productId);
                    return (
                      <div
                        key={order.id}
                        className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm"
                      >
                        <span className="truncate text-slate-700">
                          #{order.id} · {product?.name ?? `Product ${order.productId}`} ·{" "}
                          {customer ? `${customer.firstName} ${customer.lastName}` : `Customer ${order.customerId}`}
                        </span>
                        <span className="shrink-0 font-semibold tabular-nums text-violet-700">
                          ${Number(order.totalPrice).toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-violet-700">Low stock alerts</p>
              <h2 className="mt-1 text-lg font-bold text-slate-900">Needs restocking soon</h2>
              {lowStockProducts.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">All products are well stocked.</p>
              ) : (
                <div className="mt-3 grid gap-2">
                  {lowStockProducts.map((product) => (
                    <div
                      key={product.productId}
                      className="flex items-center justify-between gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm"
                    >
                      <span className="truncate text-slate-700">{product.name}</span>
                      <span className="shrink-0 font-semibold text-amber-700">{product.stockQuantity} left</span>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </section>
        ) : null}

        {activeSection === "overview" ? (
          <section className="grid gap-4 sm:grid-cols-2">
            <article className="min-h-[180px] rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className={`text-xs font-bold uppercase tracking-wider ${theme.text}`}>Workspace summary</p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">
                {isAdmin ? "Full control panel for the store" : "Simple member panel for store browsing"}
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Products</span>
                {isAdmin ? (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Customers</span>
                ) : null}
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Orders</span>
                {isAdmin ? (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Users</span>
                ) : (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Favorites</span>
                )}
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">AI helper</span>
              </div>
            </article>

            <article className="min-h-[180px] rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className={`text-xs font-bold uppercase tracking-wider ${theme.text}`}>Next steps</p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">Open a page and start managing records</h2>
              <ul className="mt-4 grid gap-2 list-disc pl-4 text-slate-600">
                {isAdmin ? (
                  <>
                    <li>Click Products, Customers, Orders, or Users in the top nav.</li>
                    <li>Use the Add button to create new items.</li>
                    <li>Edit or delete rows directly from each table.</li>
                  </>
                ) : (
                  <>
                    <li>Click Products to view the catalog and save favorites.</li>
                    <li>Click Orders to place a new order.</li>
                    <li>Click AI Assistant for descriptions or a recommendation.</li>
                  </>
                )}
              </ul>
            </article>
          </section>
        ) : null}

        {activeSection === "products" ? <ProductsPanel canManage={isAdmin} /> : null}
        {activeSection === "customers" && isAdmin ? <CustomersPanel /> : null}
        {activeSection === "orders" ? (
          <OrdersPanel canManage={isAdmin} customerId={user.customerId} />
        ) : null}
        {activeSection === "users" && isAdmin ? <UsersPanel currentUserId={user.userId} /> : null}
        {activeSection === "favorites" && !isAdmin ? <FavoritesPanel /> : null}
        {activeSection === "ai" ? <AiAssistant /> : null}
      </main>

      <footer className="mt-6 grid gap-5 rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-6 shadow-sm">
        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <strong className="text-slate-900">Group 12 Electronics</strong>
            <p className="mt-2 text-sm text-slate-500">
              {isAdmin
                ? "Admin control center for products, customers, orders, users, and AI-assisted workflows."
                : "Member workspace for browsing products, placing orders, and AI-assisted product info."}
            </p>
          </div>

          <div>
            <p className={`mb-2 text-xs font-bold uppercase tracking-wider ${theme.text}`}>Quick links</p>
            <div className="grid gap-1.5 text-sm text-slate-600">
              <span>Dashboard</span>
              <span>Products</span>
              {isAdmin ? <span>Customers</span> : null}
              <span>Orders</span>
            </div>
          </div>

          <div>
            <p className={`mb-2 text-xs font-bold uppercase tracking-wider ${theme.text}`}>Contact</p>
            <div className="grid gap-1.5 text-sm text-slate-600">
              <span>help@group12.store</span>
              <span>+1 (555) 123-4567</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-4 text-sm text-slate-500">
          © {new Date().getFullYear()} Group 12 Electronics. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
