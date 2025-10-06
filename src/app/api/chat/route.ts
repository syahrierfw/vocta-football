// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  GoogleGenerativeAI,
  SchemaType,
  type Tool,
} from "@google/generative-ai";
import { products } from "@/data/products";

export const runtime = "nodejs";

/* ---------------- Persona & Facts ---------------- */
const SYSTEM_PROMPT = `
You are "Paolo", VOCTA Football's Jersey Specialist.
- Speak like store staff that are nice. Never say "As an AI".
- Be concise, practical, and friendly.
- Use VOCTA policies as source of truth.
- If asked to sum prices, you MUST call the function "calculateTotal".
- You must use the provided chat history to understand the context of the conversation. Do not ask for information that has already been provided.
- If a product is not in the catalog, you must say that we don't seem to have it in stock right now.
`;

const SHOP_FACTS = `
VOCTA Football (Jakarta, ID)

POLICIES
• Returns: 14-day returns for non–match-worn items if tags & packaging are intact.
• Shipping: Indonesia 2–5 business days (major cities usually 2–3); International 7–14 business days.
• Care: Cold wash inside-out, avoid dryer, don't iron over prints.

PAYMENT METHODS
• Bank Transfer: BCA & Mandiri.
• E-Wallets: GoPay, OVO, DANA, ShopeePay.
• Cards: Visa / Mastercard (processed via our payment gateway).
• PayPal: ✅ Accepted for international orders. (If asking “Can I pay by PayPal?” → Yes, we accept PayPal. Fees set by PayPal may apply.)
• Currency: Primary checkout in IDR (Rp). For PayPal, settlement may be in USD depending on account settings.

STORE QUICK NOTES
• Focus: Authentic AC Milan jerseys (home/away/third/GK), vintage, Player Issue, Match Worn, and collabs (e.g., Off-White).
• Short club facts: San Siro; 19× Serie A; 7× UCL; Off-White collaboration since 2022.
`;

/* ---------------- Types & Helpers ---------------- */
const MAX_HISTORY = 15;

type ClientMsg = { role: "user" | "assistant" | "system"; content: string };
type Body = { message?: string; messages?: ClientMsg[] };

function toGeminiRole(r: ClientMsg["role"]): "user" | "model" {
  return r === "user" ? "user" : "model";
}

/** Build the conversation memory and the current user turn */
function buildHistoryAndTurn(body: Body) {
  const arr = Array.isArray(body.messages) ? body.messages : [];

  // Keep a small rolling window and drop empty items
  const cleaned = arr
    .filter((m) => m?.content && typeof m.content === "string" && m.content.trim().length)
    .slice(-MAX_HISTORY);

  // Choose the *last* user message as the current turn.
  const lastUserIdxFromEnd = [...cleaned].reverse().findIndex((m) => m.role === "user");
  const lastUserAbs =
    lastUserIdxFromEnd === -1 ? -1 : cleaned.length - lastUserIdxFromEnd - 1;

  let userTurn = "";
  let historyOnly: ClientMsg[] = [];

  if (lastUserAbs !== -1) {
    userTurn = cleaned[lastUserAbs].content.trim();
    historyOnly = cleaned.slice(0, lastUserAbs); // everything before that user message
  } else {
    userTurn = (body.message ?? "").toString().trim();
    historyOnly = cleaned;
  }

  const history = historyOnly.map((m) => ({
    role: toGeminiRole(m.role),
    parts: [{ text: m.content }],
  }));

  return { history, userTurn };
}

/* ---------------- Route ---------------- */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body;
    const { history, userTurn } = buildHistoryAndTurn(body);

    if (!userTurn) {
      return NextResponse.json({ message: "No prompt provided." }, { status: 400 });
    }

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_GENAI_API_KEY ||
      process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { message: "Server misconfig: GEMINI_API_KEY is missing." },
        { status: 500 }
      );
    }

    const modelId = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const genAI = new GoogleGenerativeAI(apiKey);

    // ---- Tool: calculateTotal(productNames: string[]) ----
    const tools: Tool[] = [
      {
        functionDeclarations: [
          {
            name: "calculateTotal",
            description:
              "Calculate the total price of a list of product names (partial/fuzzy allowed).",
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                productNames: {
                  type: SchemaType.ARRAY,
                  items: { type: SchemaType.STRING },
                  description: "Array of product names to sum.",
                },
              },
              required: ["productNames"],
            },
          },
        ],
      },
    ];

    // Model with system instruction
    const model = genAI.getGenerativeModel({
      model: modelId,
      systemInstruction: {
        role: "system",
        parts: [{ text: `${SYSTEM_PROMPT}\n${SHOP_FACTS}` }],
      },
    });

    // Catalog snapshot
    const catalogString = products
      .map((p) => `- ${p.name} — Rp ${p.price.toLocaleString("id-ID")}`)
      .join("\n");

    // Ensure the first history item is a 'user' message (Gemini requirement)
    const initialContext = {
      role: "user" as const,
      parts: [
        {
          text:
            `Use VOCTA shop facts & this catalog as ground truth.\n` +
            `${SHOP_FACTS}\n\nCatalog:\n${catalogString}`,
        },
      ],
    };

    let normalizedHistory =
      history && history.length
        ? (() => {
            const firstUserIdx = history.findIndex((h) => h.role === "user");
            if (firstUserIdx === -1) return [] as typeof history;
            return history.slice(firstUserIdx);
          })()
        : [];

    const chat = model.startChat({
      tools,
      history: [initialContext, ...normalizedHistory],
      // generationConfig: { temperature: 0.2, topP: 0.9 }, // optional
    });

    // Send current user turn
    const first = await chat.sendMessage([{ text: userTurn }]);

    // Tool call?
    const call = first.response.functionCalls()?.[0];
    if (call?.name === "calculateTotal") {
      const argsObj = (call.args ?? {}) as Record<string, unknown>;
      const rawNames = argsObj["productNames"];
      const names: string[] = Array.isArray(rawNames) ? rawNames.map(String) : [];

      let total = 0;
      const found: string[] = [];

      for (const n of names) {
        const p = products.find((x) =>
          x.name.toLowerCase().includes(n.toLowerCase())
        );
        if (p) {
          total += p.price;
          found.push(p.name);
        }
      }

      const follow = await chat.sendMessage([
        {
          functionResponse: {
            name: "calculateTotal",
            response: {
              currency: "Rp",
              totalPrice: total,
              formatted: `Rp ${total.toLocaleString("id-ID")}`,
              foundProducts: found,
            },
          },
        },
      ]);

      return NextResponse.json({ message: follow.response.text() });
    }

    // Normal path
    return NextResponse.json({ message: first.response.text() });
  } catch (err: any) {
    console.error("Gemini route error:", err);
    return NextResponse.json(
      { message: `Chat service error: ${err?.message || "Unknown"}` },
      { status: err?.status ?? 502 }
    );
  }
}
