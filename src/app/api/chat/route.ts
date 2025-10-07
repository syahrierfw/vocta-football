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
You are "Paolo", VOCTA Football's Jersey Specialist and a senior salesperson. You are a world-class expert on AC Milan kits.
- Speak like an expert, friendly, engaging and proactive store staff. Never say "As an AI".
- Be concise and practical.
- Use VOCTA policies as your source of truth.

--- CLUB & KIT KNOWLEDGE (CRITICAL) ---
- Primary Colors: AC Milan's traditional colors are red and black (the Rossoneri). Their away kits are traditionally white.
- Color Nuances: The club has a rich history of bold third, fourth, and special edition kits. You MUST be aware of these.
- Non-Traditional Colors: If a user asks about non-traditional colors like BLUE, GREEN, PINK, YELLOW, or GOLD, you must acknowledge that the club has indeed used these colors. // ADDED "GOLD"
- Specific Examples to Mention:
  - Blue: The famous 1995/96 blue fourth kit.
  - Green: The olive-green 2022/23 third kit.
  - Pink/Purple: The 2023/24 third kit had a pink and purple pattern.
  - Gold: The popular 2013/14 gold third kit. // ADDED EXAMPLE
- Club Facts: San Siro stadium; 19× Serie A titles; 7× UCL titles.
- Collabs: Off-White (since 2022), Pleasures.

--- HANDLING UNAVAILABLE ITEMS ---
- Our store ONLY sells AC Milan jerseys. If a user asks for ANY OTHER TEAM (Lazio, Inter, etc.), state that we specialize exclusively in AC Milan and pivot back to helping them find a Milan jersey.
- If asked about a color we don't have in the current catalog, use your kit knowledge. Example: "While we don't have a gold one in this season's collection, the 13/14 third kit was a memorable one. Our current stock focuses on the classic home, away, and third kits."

--- SALES TACTICS ---
- After a user adds an item to the cart, you MUST ask a relevant, intelligent upsell question.
- Example (Home Jersey): "Got it, that's in your cart. The official shorts for that kit are also in stock. Would you like to see them?"
- Example (Vintage Jersey): "Great choice. Many collectors also pick up the away version from that season to complete the set. Interested?"

--- TOOL USAGE RULES ---
- If asked to sum prices, you MUST call "calculateTotal".
- When a user asks to add a product to the cart, you MUST call "addToCartByName". Use chat history to find the product name if needed.
- DO NOT show a product card again if the user is asking to add the currently discussed item; use "addToCartByName" instead.
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

function buildHistoryAndTurn(body: Body) {
  const arr = Array.isArray(body.messages) ? body.messages : [];
  const cleaned = arr
    .filter((m) => m?.content && typeof m.content === "string" && m.content.trim().length)
    .slice(-MAX_HISTORY);

  const lastUserIdxFromEnd = [...cleaned].reverse().findIndex((m) => m.role === "user");
  const lastUserAbs =
    lastUserIdxFromEnd === -1 ? -1 : cleaned.length - lastUserIdxFromEnd - 1;

  let userTurn = "";
  let historyOnly: ClientMsg[] = [];

  if (lastUserAbs !== -1) {
    userTurn = cleaned[lastUserAbs].content.trim();
    historyOnly = cleaned.slice(0, lastUserAbs);
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

    const tools: Tool[] = [
      {
        functionDeclarations: [
          {
            name: "calculateTotal",
            description: "Calculate the total price of a list of product names.",
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                productNames: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
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
                productName: { type: SchemaType.STRING, description: "The full or partial name of the product to add." },
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

    const catalogString = products.map((p) => `- ${p.name} — Rp ${p.price.toLocaleString("id-ID")}`).join("\n");
    const initialContext = {
      role: "user" as const,
      parts: [{ text: `Use VOCTA shop facts & this catalog as ground truth.\n${SHOP_FACTS}\n\nCatalog:\n${catalogString}` }],
    };

    let normalizedHistory = history?.length ? history.slice(history.findIndex((h) => h.role === "user")) : [];
    
    const chat = model.startChat({
      tools,
      history: [initialContext, ...normalizedHistory],
    });

    const first = await chat.sendMessage([{ text: userTurn }]);
    const call = first.response.functionCalls()?.[0];

    // --- FULL TOOL HANDLING LOGIC ---

    if (call?.name === "addToCartByName") {
      const argsObj = (call.args ?? {}) as { productName?: string };
      const name = argsObj.productName ?? "";
      
      const productToAdd = products.find((p) => p.name.toLowerCase().includes(name.toLowerCase()));

      if (productToAdd) {
        const followUp = await chat.sendMessage([
          {
            functionResponse: {
              name: "addToCartByName",
              response: {
                success: true,
                productName: productToAdd.name,
                price: productToAdd.priceFormatted,
              },
            },
          },
        ]);
        
        const dynamicMessage = followUp.response.text();

        return NextResponse.json({
          action: 'addToCart',
          actionParams: { product: productToAdd },
          message: dynamicMessage
        });
      } else {
        return NextResponse.json({ message: `Sorry, I couldn't find a product named "${name}" in our catalog.` });
      }
    }
    
    if (call?.name === "calculateTotal") {
      const argsObj = (call.args ?? {}) as Record<string, unknown>;
      const rawNames = argsObj["productNames"];
      const names: string[] = Array.isArray(rawNames) ? rawNames.map(String) : [];

      let total = 0;
      const found: string[] = [];

      for (const n of names) {
        const p = products.find((x) => x.name.toLowerCase().includes(n.toLowerCase()));
        if (p) {
          total += p.price;
          found.push(p.name);
        }
      }

      const follow = await chat.sendMessage([
        { functionResponse: { name: "calculateTotal", response: { currency: "Rp", totalPrice: total, formatted: `Rp ${total.toLocaleString("id-ID")}`, foundProducts: found } } },
      ]);

      return NextResponse.json({ message: follow.response.text() });
    }

    const modelResponseText = first.response.text();
    const mentionedProduct = products.find(p => modelResponseText.toLowerCase().includes(p.name.toLowerCase()));
    
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
    return NextResponse.json({ message: `Chat service error: ${err?.message || "Unknown"}` }, { status: err?.status ?? 502 });
  }
}