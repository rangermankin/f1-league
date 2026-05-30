const SUPABASE_URL = "https://knjvofhoamlvnmqtoiuq.supabase.co";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  if (!SERVICE_KEY) return res.status(500).json({ error: "Service key not configured" });

  const { action, key, value } = req.body;
  if (!action || !key) return res.status(400).json({ error: "Missing action or key" });

  const headers = {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    "Content-Type": "application/json",
  };

  try {
    if (action === "get") {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/app_data?key=eq.${encodeURIComponent(key)}&select=value`, { headers });
      const rows = await r.json();
      return res.status(200).json(rows.length ? { value: JSON.stringify(rows[0].value) } : null);
    }

    if (action === "set") {
      await fetch(`${SUPABASE_URL}/rest/v1/app_data`, {
        method: "POST",
        headers: { ...headers, Prefer: "resolution=merge-duplicates" },
        body: JSON.stringify({ key, value: JSON.parse(value), updated_at: new Date().toISOString() }),
      });
      return res.status(200).json({ ok: true });
    }

    if (action === "delete") {
      await fetch(`${SUPABASE_URL}/rest/v1/app_data?key=eq.${encodeURIComponent(key)}`, {
        method: "DELETE",
        headers,
      });
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: "Invalid action" });
  } catch (err) {
    console.error("db handler error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
