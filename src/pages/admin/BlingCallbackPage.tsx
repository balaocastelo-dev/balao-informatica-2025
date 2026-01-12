import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function BlingCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  useEffect(() => {
    if (code) {
      handleCallback(code);
    }
  }, [code]);

  const handleCallback = async (authCode: string) => {
    try {
      setErrorDetails(null);
      // 1. Save code to DB first (optional, but good for debugging)
      let { data: settings } = await supabase.from("bling_settings").select("*").single();
      
      if (!settings) {
        // Fallback to localStorage
        const localClientId = localStorage.getItem("bling_client_id") || "96f38dbc512f18abde6c338c696946d591b66c4a";
        const localClientSecret = localStorage.getItem("bling_client_secret") || "5e6628e22ff163c42e3b1793a9a360232e1246ef2072238293d6bd9c3008";
        
        if (localClientId && localClientSecret) {
           // Mock settings object
           settings = { id: 'local', client_id: localClientId, client_secret: localClientSecret };
        } else {
           toast.error("Configurações não encontradas. Configure o Client ID/Secret primeiro.");
           navigate("/admin");
           return;
        }
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
      
      // USE VERCEL SERVERLESS FUNCTION TO BYPASS CORS
      // We send credentials in body because we are in a protected Admin environment 
      // and we want to avoid complex env var setup for the user right now.
      
      const response = await fetch("/api/bling-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: authCode,
          client_id: settings.client_id,
          client_secret: settings.client_secret,
          redirect_uri: "https://www.balao.info/admin/bling/callback"
        })
      });

      if (!response.ok) {
        // If 404, it means we are on localhost without Vercel Dev or API not deployed
        if (response.status === 404) {
           throw new Error("API de token não encontrada. Se estiver no localhost, isso é esperado (Vercel Functions não rodam no Vite padrão). Se estiver em produção, verifique se o deploy finalizou.");
        }
        
        const errData = await response.json().catch(() => ({ details: response.statusText }));
        console.error("Bling Auth Error:", errData);
        throw new Error(`Falha na autenticação: ${errData.details || JSON.stringify(errData)}`);
      }

      const data = await response.json();
      
      // 3. Save tokens
      if (settings.id !== 'local') {
          const { error: updateError } = await supabase.from("bling_settings").update({
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_at: Date.now() + (data.expires_in * 1000)
          }).eq("id", settings.id);
          
          if (updateError) {
             console.error("Update error:", updateError);
             localStorage.setItem("bling_access_token", data.access_token);
             toast.warning("Token salvo localmente (Erro no DB)");
          }
      } else {
          // Save to localStorage
          localStorage.setItem("bling_access_token", data.access_token);
          localStorage.setItem("bling_refresh_token", data.refresh_token);
          toast.warning("Token salvo localmente (Modo fallback)");
      }

      toast.success("Conectado ao Bling com sucesso!");
      navigate("/admin");
      
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.message || "Erro desconhecido";
      setErrorDetails(errorMessage);
      toast.error(`Erro: ${errorMessage}`);
      // Do not navigate away immediately so user can see the error
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4">
      <div className="text-center max-w-md">
        <h2 className="text-xl font-bold mb-4">Conectando ao Bling...</h2>
        {errorDetails ? (
          <div className="bg-destructive/15 text-destructive p-4 rounded-md border border-destructive/20 text-left overflow-auto max-h-[300px]">
            <p className="font-semibold mb-2">Ocorreu um erro:</p>
            <code className="text-xs break-all whitespace-pre-wrap">{errorDetails}</code>
            <p className="text-sm mt-4 text-muted-foreground">
              Verifique se o "Redirect URI" no aplicativo do Bling está EXATAMENTE igual a: <br/>
              <strong className="select-all">https://www.balao.info/admin/bling/callback</strong>
            </p>
            <button 
              onClick={() => navigate("/admin")}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 w-full"
            >
              Voltar para Admin
            </button>
          </div>
        ) : (
          <p className="text-muted-foreground">Por favor aguarde enquanto finalizamos a conexão.</p>
        )}
      </div>
    </div>
  );
}
