import type { Customer, CustomerLookup, Order, Product, User, UserAccount } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

interface ApiEnvelope<T> {
  user?: T;
  products?: T;
  customers?: T;
  orders?: T;
  description?: string;
  source?: string;
  prompt?: string;
  message?: string;
  error?: string;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  const hasBody = response.status !== 204;
  const data = hasBody ? (await response.json().catch(() => null)) : null;

  if (!response.ok) {
    throw new Error(data?.error || data?.message || "Request failed");
  }

  return data as T;
}

export const authApi = {
  async login(identifier: string, password: string) {
    const data = await request<{ user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier, password }),
    });

    return data.user;
  },
  async register(payload: {
    fullName: string;
    username: string;
    email: string;
    password: string;
  }) {
    const data = await request<{ user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return data.user;
  },
  async getCurrentUser() {
    const data = await request<{ user: User }>("/auth/me");
    return data.user;
  },
  async logout() {
    await request<{ message: string }>("/auth/logout", { method: "POST" });
  },
  async listUsers() {
    return request<UserAccount[]>("/auth/users");
  },
  async updateUserRole(userId: number, role: "admin" | "member") {
    return request<{ userId: number; role: string }>(`/auth/users/${userId}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
  },
};

export const productApi = {
  async list() {
    return request<Product[]>("/products");
  },
  async create(payload: Omit<Product, "productId">) {
    return request<Product>("/products", { method: "POST", body: JSON.stringify(payload) });
  },
  async update(productId: number, payload: Omit<Product, "productId">) {
    return request<Product>(`/products/${productId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  async remove(productId: number) {
    return request<{ message: string }>(`/products/${productId}`, { method: "DELETE" });
  },
};

export const customerApi = {
  async list() {
    return request<Customer[]>("/customers");
  },
  async lookup() {
    return request<CustomerLookup[]>("/customers/lookup");
  },
  async create(payload: Omit<Customer, "customerId">) {
    return request<Customer>("/customers", { method: "POST", body: JSON.stringify(payload) });
  },
  async update(customerId: number, payload: Omit<Customer, "customerId">) {
    return request<Customer>(`/customers/${customerId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  async remove(customerId: number) {
    return request<{ message: string }>(`/customers/${customerId}`, { method: "DELETE" });
  },
};

export const orderApi = {
  async list() {
    return request<Order[]>("/orders");
  },
  async create(payload: Omit<Order, "id">) {
    return request<Order>("/orders", { method: "POST", body: JSON.stringify(payload) });
  },
  async update(orderId: number, payload: Omit<Order, "id">) {
    return request<Order>(`/orders/${orderId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  async remove(orderId: number) {
    return request<{ message: string }>(`/orders/${orderId}`, { method: "DELETE" });
  },
};

export const aiApi = {
  async generateDescription(payload: {
    productName: string;
    category: string;
    brand: string;
    features: string;
  }) {
    return request<{ description: string; source: string; prompt: string }>(
      "/ai/product-description",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  },
  async recommend(payload: { budget?: string; category?: string }) {
    return request<{ recommendation: string; product: Product | null; source: string }>(
      "/ai/recommend",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  },
};
