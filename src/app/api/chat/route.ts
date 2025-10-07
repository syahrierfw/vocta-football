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

// --- NEW, MORE EXPLICIT RULES ---
- CRITICAL: When the user asks to add a product to the cart (e.g., "add this to my cart", "I'll take it, I will buy it, etc"), you MUST use the "addToCartByName" tool. Use the chat history to find the product name if they don't specify it.
- DO NOT show the product card again if the user is asking to add the currently discussed item to the cart; use the "addToCartByName" tool instead.
// --- END OF NEW RULES ---

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

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ message: "Server misconfig: GEMINI_API_KEY is missing." }, { status: 500 });
    }

    const modelId = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const genAI = new GoogleGenerativeAI(apiKey);

    // --- CHANGE 1: DEFINE THE NEW addToCartByName TOOL ---
    const tools: Tool[] = [
      {
        functionDeclarations: [
          {
            name: "calculateTotal",
            description: "Calculate the total price of a list of product names.",
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                productNames: {
                  type: SchemaType.ARRAY,
                  items: { type: SchemaType.STRING },
                },
              },
              required: ["productNames"],
            },
          },
          {
            name: "addToCartByName",
            description: "Adds a product to the user's shopping cart by its name.",
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                productName: {
                  type: SchemaType.STRING,
                  description: "The full or partial name of the product to add.",
                },
              },
              required: ["productName"],
            },
          },
        ],
      },
    ];

    const model = genAI.getGenerativeModel({
      model: modelId,
      systemInstruction: {
        role: "system",
        parts: [{ text: `${SYSTEM_PROMPT}\n${SHOP_FACTS}` }],
      },
    });

    // ... (keep catalogString, initialContext, and normalizedHistory logic)
    const catalogString = products
      .map((p) => `- ${p.name} — Rp ${p.price.toLocaleString("id-ID")}`)
      .join("\n");

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
    });

    const first = await chat.sendMessage([{ text: userTurn }]);
    const call = first.response.functionCalls()?.[0];

    // --- CHANGE 2: HANDLE THE NEW addToCartByName TOOL CALL ---
    if (call?.name === "addToCartByName") {
      const argsObj = (call.args ?? {}) as { productName?: string };
      const name = argsObj.productName ?? "";
      
      const productToAdd = products.find((p) => 
        p.name.toLowerCase().includes(name.toLowerCase())
      );

      if (productToAdd) {
        // IMPORTANT: Send an "action" command to the frontend
        return NextResponse.json({
          action: 'addToCart',
          actionParams: { product: productToAdd },
          message: `Sure thing! I've added the "${productToAdd.name}" to your cart.`
        });
      } else {
        return NextResponse.json({ message: `Sorry, I couldn't find a product named "${name}" in our catalog.` });
      }
    }

    // ... (keep your existing calculateTotal and product card logic here)
    if (call?.name === "calculateTotal") {
        // ... (your existing calculateTotal logic)
    }

    const modelResponseText = first.response.text();
    const mentionedProduct = products.find(p => 
      modelResponseText.toLowerCase().includes(p.name.toLowerCase())
    );
    
    if (mentionedProduct) {
      return NextResponse.json({
        component: 'product-card',
        componentProps: mentionedProduct,
        message: `Here is the ${mentionedProduct.name} you asked about.`
      });
    }
    
    return NextResponse.json({ message: modelResponseText });

  } catch (err: any) {
    console.error("Gemini route error:", err);
    return NextResponse.json(
      { message: `Chat service error: ${err?.message || "Unknown"}` },
      { status: err?.status ?? 502 }
    );
  }
}
