import { FormEvent, useState } from "react";
import { aiApi } from "../api";
import type { Product } from "../types";

type AiFormState = {
  productName: string;
  category: string;
  brand: string;
  features: string;
};

const emptyForm: AiFormState = {
  productName: "",
  category: "",
  brand: "",
  features: "",
};

type RecommendFormState = {
  budget: string;
  category: string;
};

const emptyRecommendForm: RecommendFormState = {
  budget: "",
  category: "",
};

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

type Tool = "description" | "recommend";

export default function AiAssistant() {
  const [tool, setTool] = useState<Tool>("description");

  const [form, setForm] = useState<AiFormState>(emptyForm);
  const [description, setDescription] = useState("");
  const [source, setSource] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [recommendForm, setRecommendForm] = useState<RecommendFormState>(emptyRecommendForm);
  const [recommendation, setRecommendation] = useState("");
  const [recommendedProduct, setRecommendedProduct] = useState<Product | null>(null);
  const [recommendSource, setRecommendSource] = useState("");
  const [recommendError, setRecommendError] = useState("");
  const [recommendLoading, setRecommendLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await aiApi.generateDescription(form);
      setDescription(result.description);
      setSource(result.source);
    } catch (aiError) {
      setError(aiError instanceof Error ? aiError.message : "Unable to generate description");
    } finally {
      setLoading(false);
    }
  };

  const handleRecommendSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRecommendError("");
    setRecommendLoading(true);

    try {
      const result = await aiApi.recommend(recommendForm);
      setRecommendation(result.recommendation);
      setRecommendedProduct(result.product);
      setRecommendSource(result.source);
    } catch (recommendErr) {
      setRecommendError(recommendErr instanceof Error ? recommendErr.message : "Unable to fetch a recommendation");
    } finally {
      setRecommendLoading(false);
    }
  };

  return (
    <section className="relative grid gap-4 overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="pointer-events-none absolute -bottom-7 -right-7 h-32 w-32 rounded-full bg-blue-600/5" />

      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-blue-700">AI Assistant</p>
        <h2 className="mt-1 text-xl font-bold text-slate-900">AI-powered shopping tools</h2>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            tool === "description" ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
          onClick={() => setTool("description")}
        >
          Description generator
        </button>
        <button
          type="button"
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            tool === "recommend" ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
          onClick={() => setTool("recommend")}
        >
          Product recommender
        </button>
      </div>

      {tool === "description" ? (
        <>
          <p className="text-sm text-slate-500">
            Uses OpenAI when{" "}
            <code className="rounded bg-blue-50 px-1.5 py-0.5 text-blue-700">OPENAI_API_KEY</code> is
            set, otherwise it shows a local fallback so the page stays usable.
          </p>

          <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
            <label className="grid gap-1.5 text-sm font-medium text-slate-600">
              Product name
              <input
                className={inputClass}
                value={form.productName}
                onChange={(event) => setForm({ ...form, productName: event.target.value })}
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
              Features
              <textarea
                className={inputClass}
                value={form.features}
                onChange={(event) => setForm({ ...form, features: event.target.value })}
                rows={3}
              />
            </label>
            <button
              className="rounded-full bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
              type="submit"
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate description"}
            </button>
          </form>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          ) : null}
          {description ? (
            <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
                {source === "openai" ? "OpenAI response" : "Fallback response"}
              </p>
              <p className="mt-2 text-slate-700">{description}</p>
            </article>
          ) : null}
        </>
      ) : (
        <>
          <p className="text-sm text-slate-500">
            Tell us your budget and (optionally) a category, and we'll pick the best matching item
            currently in stock and explain why it's a good fit.
          </p>

          <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleRecommendSubmit}>
            <label className="grid gap-1.5 text-sm font-medium text-slate-600">
              Max budget ($)
              <input
                className={inputClass}
                type="number"
                min="1"
                step="0.01"
                value={recommendForm.budget}
                onChange={(event) => setRecommendForm({ ...recommendForm, budget: event.target.value })}
                placeholder="e.g. 100"
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-600">
              Category (optional)
              <input
                className={inputClass}
                value={recommendForm.category}
                onChange={(event) => setRecommendForm({ ...recommendForm, category: event.target.value })}
                placeholder="e.g. Accessories"
              />
            </label>
            <button
              className="rounded-full bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
              type="submit"
              disabled={recommendLoading}
            >
              {recommendLoading ? "Finding a match..." : "Recommend a product"}
            </button>
          </form>

          {recommendError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {recommendError}
            </div>
          ) : null}

          {recommendation ? (
            <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
                {recommendSource === "openai" ? "OpenAI pick" : "Recommended pick"}
              </p>
              <p className="mt-2 text-slate-700">{recommendation}</p>

              {recommendedProduct ? (
                <div className="mt-3 flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3">
                  <div>
                    <strong className="text-slate-900">{recommendedProduct.name}</strong>
                    <div className="text-sm text-slate-500">
                      {recommendedProduct.brand ?? "Unbranded"} · {recommendedProduct.category ?? "Uncategorized"}
                    </div>
                  </div>
                  <span className="font-semibold tabular-nums text-blue-700">
                    ${Number(recommendedProduct.price).toFixed(2)}
                  </span>
                </div>
              ) : null}
            </article>
          ) : null}
        </>
      )}
    </section>
  );
}
