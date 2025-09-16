import { renderHtml } from "./renderHtml";

type JsonValue = Record<string, unknown> | Array<unknown> | string | number | boolean | null;

function json(data: JsonValue, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json;charset=UTF-8");
  return new Response(JSON.stringify(data), { ...init, headers });
}

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Max-Age": "86400",
};

function corsify(r: Response) {
  const h = new Headers(r.headers);
  for (const [k, v] of Object.entries(CORS_HEADERS)) h.set(k, v);
  return new Response(r.body, { ...r, headers: h });
}

async function handleOptions(request: Request) {
  // Allow all standard preflight requests
  if (request.headers.get("Origin") !== null && request.headers.get("Access-Control-Request-Method")) {
    return new Response(null, { headers: CORS_HEADERS });
  }
  return new Response(null, { headers: { Allow: "GET,POST,DELETE,OPTIONS" } });
}

async function listPreferences(env: Env, userId: string) {
  const stmt = env.DB.prepare("SELECT id, user_id, streamer_username, created_at, last_used_at FROM autoselect_preferences WHERE user_id = ? ORDER BY created_at DESC LIMIT 500").bind(userId);
  const { results } = await stmt.all();
  return results;
}

async function addPreference(env: Env, userId: string, streamerUsername: string) {
  const normalized = streamerUsername.trim().toLowerCase();
  if (!normalized) throw new Error("Invalid streamer_username");
  await env.DB.prepare("INSERT OR IGNORE INTO autoselect_preferences(user_id, streamer_username) VALUES(?, ?)").bind(userId, normalized).run();
  return { ok: true };
}

async function deletePreference(env: Env, userId: string, streamerUsername: string) {
  const normalized = streamerUsername.trim().toLowerCase();
  const res = await env.DB.prepare("DELETE FROM autoselect_preferences WHERE user_id = ? AND streamer_username = ?").bind(userId, normalized).run();
  return { deleted: res.meta.changes };
}

async function handleApi(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  if (path === "/api/autoselect" || path === "/api/autoselect/") {
    const method = request.method.toUpperCase();
    const userId = url.searchParams.get("user_id") || (await maybeJsonField(request, "user_id"));
    if (!userId) return corsify(json({ error: "user_id required" }, { status: 400 }));

    if (method === "GET") {
      const prefs = await listPreferences(env, userId);
      return corsify(json({ user_id: userId, preferences: prefs }));
    }
    if (method === "POST") {
      const body = await safeParseJson(request);
      const streamer = body?.streamer_username as string | undefined;
      if (!streamer) return corsify(json({ error: "streamer_username required" }, { status: 400 }));
      await addPreference(env, userId, streamer);
      const prefs = await listPreferences(env, userId);
      return corsify(json({ ok: true, preferences: prefs }, { status: 201 }));
    }
    if (method === "DELETE") {
      const body = await safeParseJson(request);
      const streamer = (body?.streamer_username as string) || url.searchParams.get("streamer_username") || "";
      if (!streamer) return corsify(json({ error: "streamer_username required" }, { status: 400 }));
      const result = await deletePreference(env, userId, streamer);
      return corsify(json(result));
    }
    if (method === "OPTIONS") return corsify(new Response(null, { headers: CORS_HEADERS }));
    return corsify(json({ error: "Method not allowed" }, { status: 405 }));
  }

  if (path === "/api/autoselect/query") {
    // Debug endpoint: pass raw SQL ?sql=SELECT+... (READ-ONLY enforcing basic guard)
    const sql = (url.searchParams.get("sql") || "").trim();
    if (!sql) return corsify(json({ error: "sql param required" }, { status: 400 }));
    if (/\b(insert|update|delete|drop|alter|create|replace)\b/i.test(sql)) {
      return corsify(json({ error: "Only read-only SELECT queries allowed here" }, { status: 400 }));
    }
    try {
      const stmt = env.DB.prepare(sql);
      const { results } = await stmt.all();
      return corsify(json({ sql, results }));
    } catch (e: any) {
      return corsify(json({ error: e.message }, { status: 400 }));
    }
  }

  return corsify(json({ error: "Not found" }, { status: 404 }));
}

async function safeParseJson(request: Request): Promise<any | null> {
  try {
    const text = await request.text();
    if (!text) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function maybeJsonField(request: Request, field: string): Promise<string | null> {
  if (!/^application\/json/i.test(request.headers.get("content-type") || "")) return null;
  const body = await safeParseJson(request);
  if (body && typeof body === "object" && field in body && typeof (body as any)[field] === "string") {
    return (body as any)[field];
  }
  return null;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") return handleOptions(request);

    // API namespace
    if (url.pathname.startsWith("/api/autoselect")) {
      try {
        return await handleApi(request, env);
      } catch (err: any) {
        return corsify(json({ error: err.message || "Internal error" }, { status: 500 }));
      }
    }

    // Root: show HTML with a snapshot of up to 10 preferences (for quick debug)
    const snapshotStmt = env.DB.prepare("SELECT user_id, streamer_username, created_at FROM autoselect_preferences ORDER BY created_at DESC LIMIT 10");
    let snapshot: any[] = [];
    try {
      const { results } = await snapshotStmt.all();
      snapshot = results;
    } catch (e) {
      // Table might not exist yet; ignore
    }
    return new Response(renderHtml(JSON.stringify({ autoselect_snapshot: snapshot }, null, 2)), {
      headers: { "content-type": "text/html" },
    });
  },
} satisfies ExportedHandler<Env>;
