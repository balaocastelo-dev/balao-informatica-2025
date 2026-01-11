import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { QrCode, Loader2, Copy, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function PixGenerator() {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [copyPaste, setCopyPaste] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({ title: 'Valor inválido', variant: 'destructive' });
      return;
    }

    setLoading(true);
    setQrCode(null);
    setCopyPaste(null);

    try {
      const { data, error } = await supabase.functions.invoke('mercadopago-payment', {
        body: {
          transaction_amount: Number(amount),
          description: description || 'Pagamento Personalizado',
          payment_method: 'pix',
          customer_email: 'admin@balaoinformatica.com.br', // Default for generated QR
          customer_name: 'Cliente Balão',
          customer_phone: '11999999999',
          customer_address: 'Loja Física',
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      if (data.pix) {
        setQrCode(data.pix.qr_code_base64);
        setCopyPaste(data.pix.qr_code);
        toast({ title: 'QR Code gerado com sucesso!' });
      }
    } catch (error: any) {
      console.error(error);
      toast({ title: 'Erro ao gerar QR Code', description: error.message || 'Erro desconhecido', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (copyPaste) {
      navigator.clipboard.writeText(copyPaste);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: 'Copia e Cola copiado!' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="w-5 h-5" />
          Gerador de PIX Personalizado
        </CardTitle>
        <CardDescription>
          Crie um QR Code PIX com valor específico para pagamentos avulsos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Valor (R$)</Label>
            <Input 
              type="number" 
              placeholder="0,00" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Descrição (Opcional)</Label>
            <Input 
              placeholder="Ex: Venda Balcão" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <Button onClick={handleGenerate} disabled={loading} className="w-full">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <QrCode className="w-4 h-4 mr-2" />}
          Gerar QR Code
        </Button>

        {qrCode && (
          <div className="mt-6 flex flex-col items-center space-y-4 p-4 border rounded-lg bg-slate-50 dark:bg-slate-900">
            <img 
              src={`data:image/png;base64,${qrCode}`} 
              alt="QR Code PIX" 
              className="w-48 h-48 mix-blend-multiply dark:mix-blend-screen"
            />
            
            <div className="w-full space-y-2">
              <Label>Copia e Cola</Label>
              <div className="flex gap-2">
                <Input value={copyPaste || ''} readOnly className="font-mono text-xs" />
                <Button size="icon" variant="outline" onClick={copyToClipboard}>
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
