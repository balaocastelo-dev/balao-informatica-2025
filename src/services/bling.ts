
import { supabase } from "@/integrations/supabase/client";

export const BlingService = {
  async sendOrder(order: any) {
    try {
      // 1. Get tokens
      const { data: settings } = await supabase.from("bling_settings").select("*").single();
      
      if (!settings || !settings.access_token) {
        console.warn("Bling integration not configured or not connected.");
        return { success: false, error: "Not configured" };
      }

      // 2. Refresh token if expired (basic check)
      if (settings.expires_at && Date.now() > settings.expires_at) {
        // Implement refresh logic here if needed, or fail and ask to reconnect
        console.warn("Bling token expired.");
        // Attempt refresh (omitted for brevity, would be similar to auth exchange)
      }

      // 3. Map Order to Bling JSON
      const blingOrder = {
        loja: { id: 205896905 }, // ID from user screenshot (sitebalao2025)
        numero: order.id.slice(0, 10), // Bling uses numeric/string ID
        data: new Date(order.created_at).toISOString().split('T')[0],
        contato: {
          nome: order.customer_name || "Cliente Balão",
          tipoPessoa: "F", // Assume PF default
          // cpf_cnpj: order.customer_document // Need this if available
        },
        itens: order.items.map((item: any) => ({
          produto: {
            codigo: item.id.slice(0, 20), // Truncate if needed
            descricao: item.name,
            unidade: "UN",
            valor: item.price,
            quantidade: item.quantity
          }
        })),
        parcelas: {
          parcela: [
            {
              dataVencimento: new Date().toISOString().split('T')[0],
              valor: order.total,
              formaPagamento: {
                id: 1 // Dinheiro/Outros default. Need mapping.
              }
            }
          ]
        }
      };

      // 4. Send to Bling API via Proxy (to avoid CORS)
      // We send the constructed order + token to our Vercel function
      const response = await fetch("/api/bling-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          order: blingOrder,
          access_token: settings.access_token
        })
      });

      if (!response.ok) {
        // Check for 404 (localhost)
        if (response.status === 404) {
           console.warn("API Proxy not found (localhost). Skipping Bling sync.");
           return { success: false, error: "Localhost: API Proxy not found" };
        }

        const errorData = await response.json().catch(() => ({ details: response.statusText }));
        console.error("Bling API Error (Proxy):", errorData);
        return { success: false, error: errorData.details || "Unknown proxy error" };
      }

      const responseData = await response.json();
      return { success: true, data: responseData };

    } catch (error) {
      console.error("Bling Service Error:", error);
      return { success: false, error };
    }
  }
};
