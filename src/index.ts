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

  if (path === "/api/userprefs") {
    const method = request.method.toUpperCase();
    const userId = url.searchParams.get("user_id") || (await maybeJsonField(request, "user_id"));
    if (!userId) return corsify(json({ error: "user_id required" }, { status: 400 }));
    if (method === "GET") {
      const { results } = await env.DB.prepare("SELECT user_id, sort_field, sort_direction, darkmode_url, default_filter_preset_id FROM user_preferences WHERE user_id = ?")
        .bind(userId).all();
      return corsify(json(results[0] || { user_id: userId }));
    }
    if (method === "POST") {
      const body = await safeParseJson(request);
      const sort_field = (body?.sort_field as string) || null;
      const sort_direction = (body?.sort_direction as string) || null;
      const darkmode_url = typeof body?.darkmode_url === 'boolean' ? (body.darkmode_url ? 1 : 0) : (typeof body?.darkmode_url === 'number' ? (body.darkmode_url ? 1 : 0) : null);
      const default_filter_preset_id = (body?.default_filter_preset_id as number) ?? null;
      await env.DB.prepare(`INSERT INTO user_preferences(user_id, sort_field, sort_direction, darkmode_url, default_filter_preset_id)
        VALUES(?, ?, ?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET sort_field=excluded.sort_field, sort_direction=excluded.sort_direction, darkmode_url=excluded.darkmode_url, default_filter_preset_id=excluded.default_filter_preset_id, updated_at=CURRENT_TIMESTAMP`)
        .bind(userId, sort_field, sort_direction, darkmode_url, default_filter_preset_id).run();
      const { results } = await env.DB.prepare("SELECT user_id, sort_field, sort_direction, darkmode_url, default_filter_preset_id FROM user_preferences WHERE user_id = ?")
        .bind(userId).all();
      return corsify(json(results[0] || { user_id: userId }, { status: 201 }));
    }
    if (method === "OPTIONS") return corsify(new Response(null, { headers: CORS_HEADERS }));
    return corsify(json({ error: "Method not allowed" }, { status: 405 }));
  }

  if (path.startsWith("/api/filter-presets")) {
    const method = request.method.toUpperCase();
    const userId = url.searchParams.get("user_id") || (await maybeJsonField(request, "user_id"));
    if (!userId) return corsify(json({ error: "user_id required" }, { status: 400 }));
    if (method === "GET") {
      const { results } = await env.DB.prepare("SELECT id, name, streamer_query, title_query, game_name, created_at, updated_at FROM filter_presets WHERE user_id = ? ORDER BY name ASC")
        .bind(userId).all();
      return corsify(json({ user_id: userId, presets: results }));
    }
    if (method === "POST") {
      const body = await safeParseJson(request);
      const name = (body?.name as string) || "";
      if (!name) return corsify(json({ error: "name required" }, { status: 400 }));
      const streamer_query = (body?.streamer_query as string) || null;
      const title_query = (body?.title_query as string) || null;
      const game_name = (body?.game_name as string) || null;
      await env.DB.prepare(`INSERT INTO filter_presets(user_id, name, streamer_query, title_query, game_name, updated_at)
        VALUES(?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(user_id, name) DO UPDATE SET
          streamer_query=excluded.streamer_query,
          title_query=excluded.title_query,
          game_name=excluded.game_name,
          updated_at=CURRENT_TIMESTAMP`)
        .bind(userId, name, streamer_query, title_query, game_name).run();
      const { results } = await env.DB.prepare("SELECT id, name, streamer_query, title_query, game_name FROM filter_presets WHERE user_id=? AND name=?")
        .bind(userId, name).all();
      return corsify(json(results[0], { status: 201 }));
    }
    if (method === "DELETE") {
      const id = url.searchParams.get("id") || String((await maybeJsonField(request, "id")) || "");
      if (!id) return corsify(json({ error: "id required" }, { status: 400 }));
      const res = await env.DB.prepare("DELETE FROM filter_presets WHERE user_id = ? AND id = ?").bind(userId, Number(id)).run();
      return corsify(json({ deleted: res.meta.changes }));
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
  // Clone to avoid consuming the original body stream before route-specific parsing.
  const clone = request.clone();
  const body = await safeParseJson(clone);
  if (body && typeof body === "object" && field in body && typeof (body as any)[field] === "string") {
    return (body as any)[field];
  }
  return null;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") return handleOptions(request);

    // Serve favicon via redirect to GitHub Pages asset (replace if you host locally)
    if (url.pathname === "/favicon.ico" || url.pathname === "/multitwitch.ico") {
      return Response.redirect("https://blake-goofy.github.io/MultiTwitchSelector/multitwitch.ico", 302);
    }

    // API namespace (route all /api/* to the handler)
    if (url.pathname.startsWith("/api/")) {
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
