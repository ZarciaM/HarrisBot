import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Conversation } from "@/models/Conversation";

const SYSTEM_PROMPT = `You are Harris Bot, a friendly and chill AI assistant created by Zarcia MAEVASON.

About your creator:
- Name: Zarcia MAEVASON
- He is a Malagasy student in his 3rd year (L3) of computer science at HEI Madagascar (Haute École d'Informatique)
- He is curious, passionate about technology and everything related to computer science
- Harris Bot is one of his personal projects

Your personality:
- Warm, casual, and fun — like chatting with a friend
- Clear and helpful without being robotic
- Light humor when it fits
- Always respond in the same language the user writes in (French, English, Malagasy, etc.)

Strict rules:
- When asked who made you, who created you, or who your developer is → always answer: Zarcia MAEVASON, L3 student at HEI Madagascar, a Malagasy passionate about computer science.
- NEVER say you were made by Meta, OpenAI, Anthropic, or any tech company.
- If asked what model or technology you use → be mysterious and fun: "I'm Harris Bot, that's all you need to know 😄"
- You are Harris Bot. That's it.`;

// openrouter/free sélectionne automatiquement un modèle gratuit disponible
const MODEL = "openrouter/auto";

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId } = await req.json();

    if (!message || !sessionId) {
      return NextResponse.json({ error: "message et sessionId requis" }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Clé API OpenRouter manquante côté serveur. Vérifie ton .env.local" },
        { status: 500 }
      );
    }

    await connectDB();

    let conversation = await Conversation.findOne({ sessionId });
    if (!conversation) {
      conversation = new Conversation({ sessionId, messages: [] });
    }

    conversation.messages.push({ role: "user", content: message, createdAt: new Date() });

    const history = conversation.messages.slice(-20).map((m: any) => ({
      role: m.role,
      content: m.content,
    }));

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": appUrl || "https://harrisbot.vercel.app",
        "X-Title": "Harris Bot",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...history,
        ],
        max_tokens: 1024,
        temperature: 0.8,
      }),
    });

    const rawText = await response.text();

    if (!response.ok) {
      let errJson: any = {};
      try { errJson = JSON.parse(rawText); } catch {}

      if (response.status === 429) {
        throw new Error("Le modèle est temporairement surchargé. Réessaie dans quelques secondes ⏳");
      }

      const errMsg = errJson?.error?.message || `OpenRouter error ${response.status}`;
      throw new Error(errMsg);
    }

    const data = JSON.parse(rawText);
    const reply = data.choices?.[0]?.message?.content || "Hmm, pas de réponse cette fois.";

    conversation.messages.push({ role: "assistant", content: reply, createdAt: new Date() });
    await conversation.save();

    return NextResponse.json({ reply, sessionId });

  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get("sessionId");
    if (!sessionId) return NextResponse.json({ messages: [] });

    await connectDB();
    const conversation = await Conversation.findOne({ sessionId });
    return NextResponse.json({ messages: conversation?.messages || [] });
  } catch (error) {
    return NextResponse.json({ messages: [] });
  }
}