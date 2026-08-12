import { Router, type Request, type Response } from "express";
import pool from "../db";

const router = Router();

async function callOpenAI(prompt: string, systemPrompt: string): Promise<string | null> {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`AI request failed: ${response.status} ${errorText}`);
      return null;
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content?.trim();
    return content || null;
  } catch (aiError) {
    console.error("AI request error:", aiError);
    return null;
  }
}

router.post("/product-description", async (req: Request, res: Response) => {
  const { productName, category, brand, features } = req.body;

  if (!productName) {
    return res.status(400).json({ error: "productName is required" });
  }

  const prompt = [
    `Write a short, polished product description for ${productName}.`,
    category ? `Category: ${category}.` : null,
    brand ? `Brand: ${brand}.` : null,
    features ? `Features: ${features}.` : null,
    "Keep it concise, sales-friendly, and suitable for an electronics store homepage.",
  ]
    .filter(Boolean)
    .join(" ");

  const fallbackDescription = `${productName} is a ${category || "versatile"} ${brand ? `from ${brand}` : "option"} designed to deliver reliable everyday performance${features ? ` with ${features}` : ""}.`;

  const description = await callOpenAI(prompt, "You write concise retail product descriptions.");

  return res.json({
    description: description || fallbackDescription,
    source: description ? "openai" : "fallback",
    prompt,
  });
});

router.post("/recommend", async (req: Request, res: Response) => {
  const { budget, category } = req.body;

  const maxBudget = budget !== undefined && budget !== "" ? Number(budget) : null;

  if (maxBudget !== null && (Number.isNaN(maxBudget) || maxBudget <= 0)) {
    return res.status(400).json({ error: "budget must be a positive number" });
  }

  const conditions: string[] = [];
  const params: Array<string | number> = [];

  if (category) {
    conditions.push("category LIKE ?");
    params.push(`%${category}%`);
  }

  if (maxBudget !== null) {
    conditions.push("price <= ?");
    params.push(maxBudget);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const [rows] = await pool.query(
    `SELECT * FROM Products ${whereClause} ORDER BY price DESC LIMIT 1`,
    params
  );
  const matches = rows as any[];
  const bestMatch = matches[0] ?? null;

  if (!bestMatch) {
    return res.json({
      recommendation: "No products match those filters right now. Try a higher budget or a different category.",
      product: null,
      source: "fallback",
    });
  }

  const prompt = [
    `Recommend this product to a shopper in one short, friendly paragraph: ${bestMatch.name}.`,
    `Brand: ${bestMatch.brand || "unbranded"}.`,
    `Category: ${bestMatch.category || "general"}.`,
    `Price: $${Number(bestMatch.price).toFixed(2)}.`,
    bestMatch.description ? `Details: ${bestMatch.description}.` : null,
    maxBudget !== null ? `The shopper's budget is $${maxBudget}.` : null,
    "Explain briefly why it's a good pick for the budget.",
  ]
    .filter(Boolean)
    .join(" ");

  const fallbackRecommendation = `Based on your filters, the ${bestMatch.name}${bestMatch.brand ? ` by ${bestMatch.brand}` : ""} at $${Number(bestMatch.price).toFixed(2)} is the best match currently in stock.`;

  const recommendation = await callOpenAI(
    prompt,
    "You are a helpful electronics store shopping assistant who recommends real in-stock products."
  );

  return res.json({
    recommendation: recommendation || fallbackRecommendation,
    product: bestMatch,
    source: recommendation ? "openai" : "fallback",
  });
});

export default router;
