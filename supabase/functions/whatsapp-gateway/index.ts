import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const DEFAULT_ALLOWED_ORIGINS = [
  "https://www.balaodainformatica.com.br",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
];

function getAllowedOrigins() {
  const env = Deno.env.get("WHATSAPP_GATEWAY_ALLOWED_ORIGINS");
  if (!env) return DEFAULT_ALLOWED_ORIGINS;
  return env
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function corsHeadersFor(req: Request) {
  const origin = req.headers.get("origin") || "";
  const allowed = getAllowedOrigins();
  const allowOrigin =
    allowed.includes("*") ? "*" : allowed.includes(origin) ? origin : "null";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
  };
}

const EVOLUTION_BASE_URL = Deno.env.get("EVOLUTION_BASE_URL");
const EVOLUTION_API_KEY = Deno.env.get("EVOLUTION_API_KEY");
const EVOLUTION_INSTANCE = Deno.env.get("EVOLUTION_INSTANCE");

function jsonResponse(req: Request, data: unknown, status = 200, extraHeaders?: Record<string, string>) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeadersFor(req), "Content-Type": "application/json", ...(extraHeaders || {}) },
  });
}

function requiredEnv() {
  if (!EVOLUTION_BASE_URL || !EVOLUTION_API_KEY || !EVOLUTION_INSTANCE) {
    return false;
  }
  return true;
}

function originIsAllowed(req: Request) {
  const origin = req.headers.get("origin") || "";
  const allowed = getAllowedOrigins();
  if (allowed.includes("*")) return true;
  return !!origin && allowed.includes(origin);
}

async function evoFetch(path: string, init?: RequestInit) {
  const base = EVOLUTION_BASE_URL!.replace(/\/+$/, "");
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      apikey: EVOLUTION_API_KEY!,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  return res;
}

function mapConnectionStateToStatus(state?: string) {
  const s = (state || "").toLowerCase();
  if (s === "open") return "connected";
  if (s.includes("qr") || s.includes("connecting")) return "qr";
  return "disconnected";
}

function normalizeBase64ToDataUrl(base64: string) {
  const trimmed = base64.trim();
  if (trimmed.startsWith("data:image/")) return trimmed;
  return `data:image/png;base64,${trimmed}`;
}

function extractTextFromEvolutionMessage(message: any): string {
  if (!message) return "";
  if (typeof message.conversation === "string") return message.conversation;
  if (typeof message.extendedTextMessage?.text === "string") return message.extendedTextMessage.text;
  if (typeof message.imageMessage?.caption === "string") return message.imageMessage.caption;
  if (typeof message.videoMessage?.caption === "string") return message.videoMessage.caption;
  if (typeof message.documentMessage?.caption === "string") return message.documentMessage.caption;
  if (typeof message.audioMessage?.caption === "string") return message.audioMessage.caption;
  return "";
}

function mapEvolutionMessageStatusToUi(status: unknown) {
  const s = String(status || "").toLowerCase();
  if (!s) return undefined;
  if (s.includes("read")) return "read";
  if (s.includes("deliver") || s.includes("received") || s.includes("server_ack") || s.includes("delivery_ack"))
    return "delivered";
  if (s.includes("sent") || s.includes("pending")) return "sent";
  return undefined;
}

function mapChatsToConversations(raw: any): any[] {
  const list = Array.isArray(raw) ? raw : raw?.chats || raw?.data || raw?.response || [];
  if (!Array.isArray(list)) return [];

  return list
    .map((c: any) => {
      const id = c?.id || c?.remoteJid || c?.key?.remoteJid || c?.jid;
      if (!id) return null;

      const title =
        c?.name ||
        c?.pushName ||
        c?.subject ||
        c?.contact?.name ||
        c?.contact?.pushName ||
        c?.id ||
        String(id);

      const lastMessageText =
        c?.lastMessage?.message && extractTextFromEvolutionMessage(c.lastMessage.message)
          ? extractTextFromEvolutionMessage(c.lastMessage.message)
          : c?.lastMessage?.text || c?.lastMessage?.conversation || c?.lastMessagePreview || "";

      const lastAt =
        c?.lastMessage?.messageTimestamp
          ? new Date(Number(c.lastMessage.messageTimestamp) * 1000).toISOString()
          : c?.lastMessageAt || c?.timestamp || c?.updatedAt || undefined;

      const unread =
        c?.unreadCount ??
        c?.unreadMessages ??
        c?.countUnread ??
        c?.unread ??
        0;

      return {
        id: String(id),
        title: String(title),
        avatarUrl: c?.profilePicUrl || c?.pictureUrl || c?.avatarUrl || undefined,
        lastMessagePreview: lastMessageText ? String(lastMessageText) : undefined,
        lastMessageAt: lastAt ? String(lastAt) : undefined,
        unreadCount: typeof unread === "number" ? unread : Number(unread) || 0,
      };
    })
    .filter(Boolean);
}

function mapMessagesToUi(conversationId: string, raw: any): any[] {
  const list = Array.isArray(raw) ? raw : raw?.messages || raw?.data || raw?.response || [];
  if (!Array.isArray(list)) return [];

  return list
    .map((m: any) => {
      const id = m?.key?.id || m?.id || m?.messageId;
      if (!id) return null;
      const fromMe = !!m?.key?.fromMe;
      const tsSeconds = m?.messageTimestamp ?? m?.timestamp ?? m?.created_at;
      const createdAt =
        typeof tsSeconds === "number"
          ? new Date(tsSeconds * 1000).toISOString()
          : typeof tsSeconds === "string" && tsSeconds.includes("T")
            ? tsSeconds
            : new Date().toISOString();

      const text = extractTextFromEvolutionMessage(m?.message) || m?.text || "";
      const agentName = fromMe ? undefined : undefined;

      return {
        id: String(id),
        conversationId,
        author: fromMe ? "agent" : "customer",
        text: String(text || ""),
        createdAt,
        status: mapEvolutionMessageStatusToUi(m?.status || m?.messageStatus || m?.ack),
        agentName,
      };
    })
    .filter(Boolean);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    if (!originIsAllowed(req)) {
      return new Response(null, { status: 403, headers: corsHeadersFor(req) });
    }
    return new Response(null, { headers: corsHeadersFor(req) });
  }

  if (!originIsAllowed(req)) {
    return jsonResponse(req, { error: "Forbidden" }, 403);
  }

  if (!requiredEnv()) {
    return jsonResponse(
      req,
      { error: "Missing EVOLUTION_* env vars (EVOLUTION_BASE_URL, EVOLUTION_API_KEY, EVOLUTION_INSTANCE)" },
      500,
    );
  }

  const url = new URL(req.url);
  const functionName = "whatsapp-gateway";
  const idx = url.pathname.indexOf(`/${functionName}`);
  const suffix = idx >= 0 ? url.pathname.slice(idx + functionName.length + 1) : "";
  const route = `/${suffix}`.replace(/\/+$/, "");

  try {
    if (route === "/instance/status" && req.method === "GET") {
      const res = await evoFetch(`/instance/connectionState/${EVOLUTION_INSTANCE}`, { method: "GET" });
      if (!res.ok) return jsonResponse(req, { status: "disconnected" }, 200);
      const data = await res.json();
      const state = data?.instance?.state || data?.state || data?.connectionState || data?.instance?.connectionState;
      const status = mapConnectionStateToStatus(state);
      return jsonResponse(req, { status });
    }

    if (route === "/instance/qr" && req.method === "POST") {
      const res = await evoFetch(`/instance/connect/${EVOLUTION_INSTANCE}`, { method: "GET" });
      if (!res.ok) {
        return jsonResponse(req, { status: "qr", qrCodeImageUrl: null }, 200);
      }
      const data = await res.json();
      const base64 =
        data?.base64 ||
        data?.qrcode?.base64 ||
        data?.qrcode ||
        data?.qrCode ||
        data?.qrCodeBase64 ||
        null;
      return jsonResponse(req, {
        status: "qr",
        qrCodeImageUrl: typeof base64 === "string" && base64.trim() ? normalizeBase64ToDataUrl(base64) : null,
      });
    }

    if (route === "/instance/disconnect" && req.method === "POST") {
      await evoFetch(`/instance/logout/${EVOLUTION_INSTANCE}`, { method: "DELETE" });
      return jsonResponse(req, { ok: true });
    }

    if (route === "/conversations" && req.method === "GET") {
      const res = await evoFetch(`/chat/findChats/${EVOLUTION_INSTANCE}`, { method: "GET" });
      if (!res.ok) return jsonResponse(req, []);
      const data = await res.json();
      return jsonResponse(req, mapChatsToConversations(data));
    }

    const convMessagesMatch = route.match(/^\/conversations\/([^/]+)\/messages$/);
    if (convMessagesMatch && req.method === "GET") {
      const conversationId = decodeURIComponent(convMessagesMatch[1]);
      const limit = Math.min(Number(url.searchParams.get("limit") || 50) || 50, 200);
      const body = {
        where: { key: { remoteJid: conversationId } },
        limit,
      };

      const res = await evoFetch(`/chat/findMessages/${EVOLUTION_INSTANCE}`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      if (!res.ok) return jsonResponse(req, []);
      const data = await res.json();
      return jsonResponse(req, mapMessagesToUi(conversationId, data));
    }

    if (convMessagesMatch && req.method === "POST") {
      const conversationId = decodeURIComponent(convMessagesMatch[1]);
      const payload = await req.json().catch(() => ({}));
      const text = String(payload?.text || "").trim();
      if (!text) return jsonResponse(req, { error: "Missing text" }, 400);

      const body = {
        number: conversationId,
        options: { delay: 300, presence: "composing" },
        textMessage: { text },
      };

      const res = await evoFetch(`/message/sendText/${EVOLUTION_INSTANCE}`, {
        method: "POST",
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        return jsonResponse(req, { ok: false, error: errText || `Evolution error: ${res.status}` }, 502);
      }

      return jsonResponse(req, { ok: true });
    }

    return jsonResponse(req, { error: "Not found" }, 404);
  } catch (error) {
    return jsonResponse(req, { error: String(error?.message || error) }, 500);
  }
});
