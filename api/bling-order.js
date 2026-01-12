
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
    const { order, access_token } = req.body || {};

    if (!order || !access_token) {
      return res.status(400).json({ error: "Missing required fields: order payload or access_token" });
    }

    console.log("Sending order to Bling:", JSON.stringify(order, null, 2));

    const response = await fetch("https://www.bling.com.br/Api/v3/pedidos/vendas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${access_token}`
      },
      body: JSON.stringify(order)
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      console.error("Bling API Error:", responseText);
      return res.status(response.status).json({ 
        error: "Bling API Error", 
        details: responseText 
      });
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      data = { message: "Success but non-JSON response", raw: responseText };
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error("Internal Proxy Error:", error);
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
}
