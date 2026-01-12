
export default async function handler(req, res) {
  // CORS Headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  // Handle CORS
  Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { code, client_id, client_secret, redirect_uri } = req.body || {};

    if (!code || !client_id || !client_secret || !redirect_uri) {
      return res.status(400).json({ error: "Missing required fields: code, client_id, client_secret, redirect_uri" });
    }

    // Exchange code for token via Bling API (Server-to-Server)
    const credentials = Buffer.from(`${client_id}:${client_secret}`).toString("base64");

    const response = await fetch("https://www.bling.com.br/Api/v3/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${credentials}`,
        "Accept": "application/json"
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirect_uri
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Bling Auth Error:", errorText);
      return res.status(response.status).json({ error: "Bling API Error", details: errorText });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error("Internal Error:", error);
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
}
