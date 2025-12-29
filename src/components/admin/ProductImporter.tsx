import { useMemo, useRef, useState } from 'react';
import { useProducts } from '@/contexts/ProductContext';
import { useCategories } from '@/contexts/CategoryContext';
import { Product } from '@/types/product';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Check, XCircle, AlertTriangle, FileUp, Wand2, Eye, FileText } from 'lucide-react';

type Confidence = 'low' | 'medium' | 'high';
type ImportStatus = 'draft' | 'published' | 'hidden';

interface ParsedRow {
  name?: string;
  price?: number;
  image?: string;
  sourceUrl?: string;
  category?: string;
  costPrice?: number;
}

interface EnrichedProduct extends Omit<Product, 'id' | 'createdAt' | 'updatedAt'> {
  aiGenerated?: boolean;
  aiConfidence?: Confidence;
  shortDescription?: string;
  benefits?: string[];
  reviewRecommended?: boolean;
  approved?: boolean;
}

function parseCSV(text: string): ParsedRow[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  const rows: ParsedRow[] = [];
  for (const line of lines) {
    const parts = line.split(/[,;|\t]/).map(p => p.trim()).filter(Boolean);
    let name = '';
    let price: number | undefined;
    let image = '';
    let sourceUrl = '';
    for (const p of parts) {
      const priceMatch = p.match(/(?:R\$|\$)?\s*([\d,.]+)/i);
      const isUrl = /^https?:\/\//i.test(p);
      const isImg = /\.(png|jpg|jpeg|webp|gif)$/i.test(p) || /image/i.test(p);
      if (isUrl && isImg && !image) image = p;
      else if (isUrl && !sourceUrl) sourceUrl = p;
      else if (priceMatch && !price) {
        const normalized = priceMatch[1].replace(/\./g, '').replace(',', '.');
        const num = parseFloat(normalized);
        if (!isNaN(num)) price = num;
      } else {
        name = name ? `${name} ${p}` : p;
      }
    }
    if (name && (price || image || sourceUrl)) {
      rows.push({ name, price, image, sourceUrl });
    }
  }
  return rows;
}

function extractAttributes(name: string, description?: string) {
  const text = `${name} ${description || ''}`.toLowerCase();
  let ramGb: number | undefined;
  let storageGb: number | undefined;
  let screenInches: number | undefined;

  const ramMatch = text.match(/\b(\d{1,3})\s*(gb|g)\s*(?:ram|mem[oó]ria)?\b/i);
  if (ramMatch) {
    const n = Number(ramMatch[1]);
    if (!isNaN(n)) ramGb = n;
  }

  const storageMatch = text.match(/\b(\d{1,4})\s*(gb|tb)\s*(?:ssd|hd|hdd)?\b/i);
  if (storageMatch) {
    const n = Number(storageMatch[1]);
    const unit = String(storageMatch[2]).toUpperCase();
    const gb = unit === 'TB' ? n * 1024 : n;
    if (!isNaN(gb)) storageGb = gb;
  }

  const screenMatch = text.match(/\b(\d{1,2}(?:[.,]\d)?)\s*(?:["']|pol|inch|polegadas)?\b/i);
  if (screenMatch) {
    const val = String(screenMatch[1]).replace(',', '.');
    const num = Number(val);
    if (!isNaN(num)) screenInches = num;
  }

  return { ramGb, storageGb, screenInches };
}

function generateDescriptions(name: string): { shortDescription: string; benefits: string[]; confidence: Confidence; reviewRecommended: boolean } {
  const baseName = name.replace(/\s{2,}/g, ' ').trim();
  const genericShort = `Produto ${baseName} com excelente custo-benefício. Ideal para uso diário e tarefas comuns.`;
  const genericBenefits = ['Bom custo-benefício', 'Uso versátil', 'Fácil integração no dia a dia'];

  const isNotebook = /\b(notebook|laptop)\b/i.test(name);
  const isMonitor = /\b(monitor|tela)\b/i.test(name);

  if (isNotebook || isMonitor) {
    const attrs = extractAttributes(name);
    const confident = !!(attrs.ramGb || attrs.storageGb || attrs.screenInches);
    const confidence: Confidence = confident ? 'medium' : 'low';
    const reviewRecommended = !confident;
    const shortDescription = isNotebook
      ? `Notebook ${baseName} pensado para produtividade e mobilidade.`
      : `Monitor ${baseName} com visual moderno para um setup organizado.`;
    const benefits = [
      ...(isNotebook ? ['Mobilidade e praticidade'] : ['Visual confortável e moderno']),
      'Boa experiência geral',
      'Adequado para tarefas cotidianas',
    ];
    return { shortDescription, benefits, confidence, reviewRecommended };
  }

  return { shortDescription: genericShort, benefits: genericBenefits, confidence: 'low', reviewRecommended: true };
}

function applyRounding(price: number, mode: 'none' | '90' | '99'): number {
  if (mode === 'none') return price;
  const base = Math.floor(price);
  if (mode === '90') return base + 0.9;
  if (mode === '99') return base + 0.99;
  return price;
}

export function ProductImporter({ onClose }: { onClose?: () => void }) {
  const { bulkImportProducts } = useProducts();
  const { categories } = useCategories();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [fileName, setFileName] = useState('');
  const [rawText, setRawText] = useState('');
  const [parsed, setParsed] = useState<ParsedRow[]>([]);
  const [items, setItems] = useState<EnrichedProduct[]>([]);
  const [defaultCategory, setDefaultCategory] = useState<string>('');
  const [tagsInput, setTagsInput] = useState('');
  const [status, setStatus] = useState<ImportStatus>('draft');
  const [marginFixed, setMarginFixed] = useState<number>(25);
  const [roundMode, setRoundMode] = useState<'none' | '90' | '99'>('90');
  const [enableAI, setEnableAI] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const parentCategories = categories.filter(c => !c.parent_id);

  const handleUpload = async (file: File) => {
    setFileName(file.name);
    const isCSV = /\.csv$/i.test(file.name) || file.type.includes('csv') || file.type === '';
    const isXLSX = /\.xlsx$/i.test(file.name) || /sheet/i.test(file.type);

    if (isCSV) {
      const text = await file.text();
      setRawText(text);
      setParsed(parseCSV(text));
      setStep(2);
    } else if (isXLSX) {
      toast({ title: 'Suporte XLSX', description: 'Para XLSX, instale a biblioteca xlsx ou exporte como CSV.', variant: 'destructive' });
    } else {
      toast({ title: 'Formato não suportado', variant: 'destructive' });
    }
  };

  const buildPreviewItems = () => {
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    const arr: EnrichedProduct[] = parsed.map(row => {
      const name = row.name || '';
      const basePrice = row.price || 0;
      const finalPrice = applyRounding(basePrice * (1 + marginFixed / 100), roundMode);
      const ai = enableAI ? generateDescriptions(name) : { shortDescription: '', benefits: [], confidence: 'low' as Confidence, reviewRecommended: false };
      const attrs = extractAttributes(name);
      return {
        name,
        price: finalPrice,
        costPrice: basePrice || undefined,
        image: row.image || '/placeholder.svg',
        category: row.category || defaultCategory || 'todos',
        description: ai.shortDescription || undefined,
        sourceUrl: row.sourceUrl || undefined,
        ramGb: attrs.ramGb,
        storageGb: attrs.storageGb,
        screenInches: attrs.screenInches,
        status,
        tags,
        aiGenerated: enableAI,
        aiConfidence: ai.confidence,
        shortDescription: ai.shortDescription,
        benefits: ai.benefits,
        reviewRecommended: ai.reviewRecommended,
        approved: true,
      };
    });
    setItems(arr);
    setStep(3);
  };

  const approvedCount = useMemo(() => items.filter(i => i.approved).length, [items]);

  const finalizeImport = async () => {
    const approved = items.filter(i => i.approved);
    if (approved.length === 0) {
      toast({ title: 'Nenhum item aprovado', variant: 'destructive' });
      return;
    }
    setIsProcessing(true);
    try {
      const payload = approved.map(i => ({
        name: i.name,
        price: i.price,
        costPrice: i.costPrice,
        image: i.image,
        category: i.category,
        description: i.shortDescription || i.description,
        stock: 0,
        sourceUrl: i.sourceUrl,
        ramGb: i.ramGb,
        storageGb: i.storageGb,
        screenInches: i.screenInches,
        status: i.status,
        tags: i.tags,
        aiGenerated: i.aiGenerated,
        aiConfidence: i.aiConfidence,
      }));
      await bulkImportProducts(payload);
      toast({ title: 'Importação concluída!', description: `${approved.length} produto(s) inserido(s).` });
      setStep(4);
      onClose?.();
    } catch {
      // toast already handled in context
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Importador Inteligente de Produtos</h3>
        <Badge variant="secondary">Etapa {step}/4</Badge>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <Label>Arquivo CSV ou XLSX</Label>
          <input
            ref={fileRef}
            type="file"
            accept=".csv, .xlsx, text/csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={e => {
              const f = e.target.files?.[0];
              if (f) handleUpload(f);
            }}
            className="w-full"
          />
          <div className="text-sm text-muted-foreground">
            Dica: Exporte sua planilha como CSV para melhor compatibilidade.
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Categoria padrão</Label>
              <Select value={defaultCategory} onValueChange={setDefaultCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {parentCategories.map(c => (
                    <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tags / Rótulos (separadas por vírgula)</Label>
              <Input value={tagsInput} onChange={e => setTagsInput(e.target.value)} placeholder="Promoção,Novo,Frete Grátis" />
            </div>
            <div>
              <Label>Margem fixa (%)</Label>
              <Input type="number" value={marginFixed} onChange={e => setMarginFixed(parseFloat(e.target.value || '0'))} />
            </div>
            <div>
              <Label>Arredondamento inteligente</Label>
              <Select value={roundMode} onValueChange={(v: any) => setRoundMode(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Escolha..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem arredondamento</SelectItem>
                  <SelectItem value="90">Final .90</SelectItem>
                  <SelectItem value="99">Final .99</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status inicial</Label>
              <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="published">Publicado</SelectItem>
                  <SelectItem value="hidden">Oculto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 mt-6">
              <Checkbox id="enableAI" checked={enableAI} onCheckedChange={() => setEnableAI(!enableAI)} />
              <Label htmlFor="enableAI" className="cursor-pointer">Habilitar IA para enriquecer descrição</Label>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={buildPreviewItems} className="gap-2">
              <Wand2 className="w-4 h-4" />
              Aplicar configurações
            </Button>
            <Button variant="outline" onClick={() => { setStep(1); setParsed([]); setRawText(''); setFileName(''); }}>
              Voltar
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Pré-visualização e revisão. Aprovados: {approvedCount}/{items.length}</div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setItems(prev => prev.map(i => ({ ...i, approved: true })))}>
                Aprovar todos
              </Button>
              <Button variant="outline" onClick={() => setItems(prev => prev.map(i => ({ ...i, approved: false })))}>
                Reprovar todos
              </Button>
            </div>
          </div>
          <div className="overflow-auto border border-border rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="p-2 text-left">Aprovar</th>
                  <th className="p-2 text-left">Nome</th>
                  <th className="p-2 text-left">Preço</th>
                  <th className="p-2 text-left">Categoria</th>
                  <th className="p-2 text-left">Descrição (IA)</th>
                  <th className="p-2 text-left">Confiança</th>
                  <th className="p-2 text-left">Tags</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} className="border-t border-border">
                    <td className="p-2">
                      <Checkbox checked={!!item.approved} onCheckedChange={(v) => {
                        setItems(prev => prev.map((it, j) => j === idx ? { ...it, approved: !!v } : it));
                      }} />
                    </td>
                    <td className="p-2">
                      <Input value={item.name} onChange={e => {
                        const val = e.target.value;
                        setItems(prev => prev.map((it, j) => j === idx ? { ...it, name: val } : it));
                      }} />
                    </td>
                    <td className="p-2">
                      <Input type="number" value={item.price} onChange={e => {
                        const val = parseFloat(e.target.value || '0');
                        setItems(prev => prev.map((it, j) => j === idx ? { ...it, price: val } : it));
                      }} />
                    </td>
                    <td className="p-2">
                      <Select value={item.category} onValueChange={(v) => {
                        setItems(prev => prev.map((it, j) => j === idx ? { ...it, category: v } : it));
                      }}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {parentCategories.map(c => (
                            <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-2">
                      <Input value={item.shortDescription || ''} onChange={e => {
                        const val = e.target.value;
                        setItems(prev => prev.map((it, j) => j === idx ? { ...it, shortDescription: val } : it));
                      }} />
                    </td>
                    <td className="p-2">
                      {item.aiConfidence === 'high' && <Badge>Alto</Badge>}
                      {item.aiConfidence === 'medium' && <Badge variant="secondary">Médio</Badge>}
                      {item.aiConfidence === 'low' && <Badge variant="outline">Baixo</Badge>}
                      {item.reviewRecommended && (
                        <span className="ml-2 inline-flex items-center text-xs text-amber-600">
                          <AlertTriangle className="w-3 h-3 mr-1" /> Revisão recomendada
                        </span>
                      )}
                    </td>
                    <td className="p-2">
                      <Input value={(item.tags || []).join(',')} onChange={e => {
                        const val = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                        setItems(prev => prev.map((it, j) => j === idx ? { ...it, tags: val } : it));
                      }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-2">
            <Button onClick={finalizeImport} className="gap-2" disabled={isProcessing}>
              {isProcessing ? <Eye className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Aprovar e importar
            </Button>
            <Button variant="outline" onClick={() => setStep(2)}>Voltar</Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-2 text-center">
          <div className="text-2xl font-semibold text-foreground">Importação finalizada</div>
          <div className="text-muted-foreground">Os produtos aprovados foram inseridos e estarão disponíveis na listagem.</div>
          <Button variant="outline" onClick={onClose} className="mt-2">Fechar</Button>
        </div>
      )}
    </div>
  );

