import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WhatsAppConnectionStatus } from '@/types/chatCentral';

function statusLabel(status: WhatsAppConnectionStatus) {
  if (status === 'connected') return 'Conectado';
  if (status === 'qr') return 'Aguardando QR Code';
  return 'Desconectado';
}

function statusVariant(status: WhatsAppConnectionStatus): 'default' | 'secondary' | 'destructive' {
  if (status === 'connected') return 'default';
  if (status === 'qr') return 'secondary';
  return 'destructive';
}

export function QRCodeModal({
  open,
  onOpenChange,
  status,
  qrCodeImageUrl,
  onRequestQrCode,
  onDisconnect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: WhatsAppConnectionStatus;
  qrCodeImageUrl: string | null;
  onRequestQrCode: () => void;
  onDisconnect: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Configuração de Instância</DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">Status</div>
          <Badge variant={statusVariant(status)}>{statusLabel(status)}</Badge>
        </div>

        <div className="mt-4 border border-border rounded-lg bg-muted/30 p-4 flex items-center justify-center min-h-[280px]">
          {qrCodeImageUrl ? (
            <img src={qrCodeImageUrl} alt="QR Code do WhatsApp" className="w-[240px] h-[240px] object-contain" />
          ) : (
            <div className="text-sm text-muted-foreground text-center max-w-sm">
              QR Code indisponível no momento. Ao integrar com a API do gateway, este modal exibirá a imagem do QR Code.
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 mt-4">
          <Button variant="secondary" onClick={onRequestQrCode} type="button">
            Gerar QR Code
          </Button>
          <Button variant="destructive" onClick={onDisconnect} type="button">
            Desconectar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

