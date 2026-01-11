import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Save, Mic, FileText, Trash2, Upload, Key, MessageSquare, Brain } from 'lucide-react';

export const VoiceAgentConfig: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    openai_api_key: '',
    bling_api_key: '',
    voice_id: 'alloy',
    initial_message: '',
    system_prompt: '',
    is_active: true
  });
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchDocuments();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('voice_agent_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (data) {
      setSettings({
        openai_api_key: data.openai_api_key || '',
        voice_id: data.voice_id || 'alloy',
        initial_message: data.initial_message || '',
        system_prompt: data.system_prompt || '',
        is_active: data.is_active ?? true
      });
    }
  };

  const fetchDocuments = async () => {
    const { data } = await supabase
      .from('voice_agent_documents')
      .select('*')
      .order('created_at', { ascending: false });
    setDocuments(data || []);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Upsert settings (assuming single row concept or managing ID)
      // First check if exists
      const { data: existing } = await supabase.from('voice_agent_settings').select('id').limit(1).maybeSingle();
      
      let error;
      if (existing) {
        const { error: err } = await supabase
          .from('voice_agent_settings')
          .update(settings)
          .eq('id', existing.id);
        error = err;
      } else {
        const { error: err } = await supabase
          .from('voice_agent_settings')
          .insert([settings]);
        error = err;
      }

      if (error) throw error;
      toast({ title: 'Configurações salvas com sucesso!' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      // 1. Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from('agent-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Insert record in DB
      const { data: insertedDoc, error: dbError } = await supabase
        .from('voice_agent_documents')
        .insert({
          filename: file.name,
          file_path: filePath,
          size_bytes: file.size,
          content_type: file.type
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // 3. Trigger processing
      toast({ title: 'Processando documento...' });
      const { error: processError } = await supabase.functions.invoke('process-document', {
        body: { record: insertedDoc }
      });

      if (processError) {
        console.error("Erro no processamento:", processError);
        toast({ title: 'Documento salvo, mas houve erro no processamento de texto.', variant: 'destructive' });
      } else {
        toast({ title: 'Documento processado com sucesso!' });
      }

      fetchDocuments();
    } catch (error) {
      console.error(error);
      toast({ title: 'Erro no upload', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (id: string, path: string) => {
    try {
      await supabase.storage.from('agent-documents').remove([path]);
      await supabase.from('voice_agent_documents').delete().eq('id', id);
      toast({ title: 'Documento removido' });
      fetchDocuments();
    } catch (error) {
      toast({ title: 'Erro ao remover', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Configurações Gerais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              Configuração da API
            </CardTitle>
            <CardDescription>Conexão com OpenAI / ChatGPT Voice</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>OpenAI API Key</Label>
              <div className="relative">
                <Input 
                  type="password" 
                  value={settings.openai_api_key} 
                  onChange={e => setSettings({...settings, openai_api_key: e.target.value})}
                  placeholder="sk-..." 
                />
              </div>
              <p className="text-xs text-muted-foreground">Chave necessária para o serviço de voz e inteligência.</p>
            </div>
            
            <div className="space-y-2">
              <Label>Voz do Agente</Label>
              <Select 
                value={settings.voice_id} 
                onValueChange={v => setSettings({...settings, voice_id: v})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma voz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alloy">Alloy (Neutro/Masculino)</SelectItem>
                  <SelectItem value="echo">Echo (Masculino)</SelectItem>
                  <SelectItem value="fable">Fable (Neutro)</SelectItem>
                  <SelectItem value="onyx">Onyx (Masculino Profundo)</SelectItem>
                  <SelectItem value="nova">Nova (Feminino)</SelectItem>
                  <SelectItem value="shimmer">Shimmer (Feminino Claro)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Mensagem Inicial</Label>
              <Textarea 
                value={settings.initial_message}
                onChange={e => setSettings({...settings, initial_message: e.target.value})}
                placeholder="Olá! Como posso ajudar?"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Upload de Documentos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Base de Conhecimento (PDFs)
            </CardTitle>
            <CardDescription>Manuais, políticas e tabelas de preço</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:bg-muted/50 transition cursor-pointer relative">
              <input 
                type="file" 
                accept="application/pdf" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileUpload}
                disabled={uploading}
              />
              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Clique para fazer upload de PDF</p>
              <p className="text-xs text-muted-foreground">O agente priorizará estas informações.</p>
              {uploading && <p className="text-xs text-primary mt-2">Enviando...</p>}
            </div>

            <div className="space-y-2">
              {documents.map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-card border rounded-md shadow-sm">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileText className="w-4 h-4 flex-shrink-0 text-red-500" />
                    <span className="text-sm truncate">{doc.filename}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    onClick={() => handleDeleteDocument(doc.id, doc.file_path)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {documents.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum documento carregado.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Prompt do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Inteligência do Agente (Prompt)
          </CardTitle>
          <CardDescription>Defina como o agente deve se comportar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Instruções do Sistema</Label>
            <Textarea 
              value={settings.system_prompt}
              onChange={e => setSettings({...settings, system_prompt: e.target.value})}
              className="font-mono text-sm"
              rows={12}
            />
            <p className="text-xs text-muted-foreground">
              Estas instruções definem a personalidade e as regras estritas do agente.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading} size="lg" className="gap-2">
          <Save className="w-4 h-4" />
          {loading ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  );
};
