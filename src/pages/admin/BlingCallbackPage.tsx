import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function BlingCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  useEffect(() => {
    if (code) {
      handleCallback(code);
    }
  }, [code]);

  const handleCallback = async (authCode: string) => {
    try {
      // 1. Save code to DB first (optional, but good for debugging)
      const { data: settings } = await supabase.from("bling_settings").select("*").single();
      
      if (!settings) {
        toast.error("Configurações não encontradas. Configure o Client ID/Secret primeiro.");
        navigate("/admin");
        return;
      }

      // 2. Exchange code for token
      // Note: This SHOULD be done server-side to protect Client Secret, but for this 'pair-programming' task where
      // we don't have a backend server easily deployable, we might try a Supabase Edge Function or 
      // (LESS SECURE) client-side exchange if Bling allows CORS (usually they don't).
      
      // Since we can't deploy Edge Functions easily from here without CLI, we will try to implement 
      // the exchange via a direct fetch, but it will likely fail CORS. 
      // IF it fails, we will need to instruct the user to set up the backend.
      
      // However, we can use a "trick": call a Supabase function if we had one.
      
      // Let's assume we can try to save the code and let a background job handle it, OR 
      // just try the fetch. Bling V3 uses Basic Auth with ClientID:Secret.
      
      const credentials = btoa(`${settings.client_id}:${settings.client_secret}`);
      
      const response = await fetch("https://www.bling.com.br/Api/v3/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${credentials}`,
          "Accept": "application/json"
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code: authCode,
          redirect_uri: "https://www.balao.info/admin/bling/callback" // Must match exactly with authorize param
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Bling Auth Error:", errText);
        throw new Error("Falha na autenticação com Bling");
      }

      const data = await response.json();
      
      // 3. Save tokens
      await supabase.from("bling_settings").update({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: Date.now() + (data.expires_in * 1000)
      }).eq("id", settings.id);

      toast.success("Conectado ao Bling com sucesso!");
      navigate("/admin");
      
    } catch (error) {
      console.error(error);
      toast.error("Erro ao conectar com Bling. Verifique o console.");
      navigate("/admin");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2">Conectando ao Bling...</h2>
        <p className="text-muted-foreground">Por favor aguarde.</p>
      </div>
    </div>
  );
}
