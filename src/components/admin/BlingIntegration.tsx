import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react";

export function BlingIntegration() {
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"connected" | "disconnected" | "checking">("checking");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("bling_settings")
      .select("*")
      .single();

    if (data) {
      setClientId(data.client_id);
      setClientSecret(data.client_secret);
      if (data.access_token) {
        setStatus("connected");
      } else {
        setStatus("disconnected");
      }
    } else {
      setStatus("disconnected");
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setLoading(true);
    // Check if exists
    const { data: existing } = await supabase.from("bling_settings").select("id").single();

    let error;
    if (existing) {
      const { error: updateError } = await supabase
        .from("bling_settings")
        .update({ client_id: clientId, client_secret: clientSecret })
        .eq("id", existing.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from("bling_settings")
        .insert({ client_id: clientId, client_secret: clientSecret });
      error = insertError;
    }

    if (error) {
      toast.error("Erro ao salvar configurações");
    } else {
      toast.success("Configurações salvas!");
    }
    setLoading(false);
  };

  const handleConnect = () => {
    if (!clientId) {
      toast.error("Preencha o Client ID antes de conectar");
      return;
    }
    
    // Construct Auth URL
    const state = Math.random().toString(36).substring(7);
    const redirectUri = `${window.location.origin}/admin/bling/callback`;
    const authUrl = `https://www.bling.com.br/Api/v3/oauth/authorize?response_type=code&client_id=${clientId}&state=${state}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    
    window.location.href = authUrl;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Integração Bling ERP
          {status === "connected" && <CheckCircle className="text-green-500 w-5 h-5" />}
          {status === "disconnected" && <AlertCircle className="text-red-500 w-5 h-5" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Client ID</label>
          <Input 
            value={clientId} 
            onChange={(e) => setClientId(e.target.value)} 
            placeholder="Ex: bbd5f0cf..."
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Client Secret</label>
          <Input 
            value={clientSecret} 
            onChange={(e) => setClientSecret(e.target.value)} 
            type="password"
            placeholder="Ex: a121b7..."
          />
        </div>

        <div className="flex gap-4 pt-4">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
            Salvar Credenciais
          </Button>
          
          <Button variant="outline" onClick={handleConnect} disabled={!clientId || loading}>
            Conectar com Bling
          </Button>
        </div>

        <div className="bg-muted p-4 rounded-md text-sm text-muted-foreground mt-4">
          <p>Para configurar a integração:</p>
          <ol className="list-decimal list-inside space-y-1 mt-2">
            <li>Crie uma conta de desenvolvedor no Bling.</li>
            <li>Crie um aplicativo.</li>
            <li>Defina a URL de Callback como: <code className="bg-background px-1 rounded">{window.location.origin}/admin/bling/callback</code></li>
            <li>Copie o Client ID e Client Secret acima.</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
