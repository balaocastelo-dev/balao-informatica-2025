import React, { useState } from 'react';
import { useProducts } from '@/contexts/ProductContext';
import { useCategories } from '@/contexts/CategoryContext';
import { supabase } from '@/integrations/supabase/client';
import { parseBulkImport, ParsedProduct } from '@/utils/productImportParser';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { AlertCircle, CheckCircle2, Upload, FileText, LayoutGrid, X, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export const BulkImport = () => {
  const { bulkImportProducts, loading: productsLoading } = useProducts();
  const { categories } = useCategories();
  
  const [inputText, setInputText] = useState('');
  const [profitMargin, setProfitMargin] = useState('25');
  const [selectedCategory, setSelectedCategory] = useState<string>('auto');
  const [parsedProducts, setParsedProducts] = useState<ParsedProduct[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState('input');
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  const handleParse = () => {
    if (!inputText.trim()) {
      toast({
        title: "Texto vazio",
        description: "Cole o texto dos produtos para analisar.",
        variant: "destructive"
      });
      return;
    }

    const margin = parseFloat(profitMargin) || 0;
    
    const results = parseBulkImport(inputText, {
      defaultCategory: selectedCategory === 'auto' ? undefined : selectedCategory,
      autoDetectCategory: selectedCategory === 'auto',
      profitMargin: margin
    });

    if (results.length === 0) {
      toast({
        title: "Nenhum produto identificado",
        description: "Verifique o formato do texto colado.",
        variant: "destructive"
      });
      return;
    }

    setParsedProducts(results);
    // Selecionar todos os válidos por padrão
    const validIndices = results
      .map((p, i) => p.isValid ? i : -1)
      .filter(i => i !== -1);
    setSelectedIndices(new Set(validIndices));
    
    setActiveTab('preview');
    toast({
      title: "Análise concluída",
      description: `${results.length} itens encontrados. Verifique e confirme.`
    });
  };

  const toggleSelection = (index: number) => {
    const newSelection = new Set(selectedIndices);
    if (newSelection.has(index)) {
      newSelection.delete(index);
    } else {
      newSelection.add(index);
    }
    setSelectedIndices(newSelection);
  };

  const toggleAll = () => {
    if (selectedIndices.size === parsedProducts.length) {
      setSelectedIndices(new Set());
    } else {
      // Selecionar apenas os válidos
      const validIndices = parsedProducts
        .map((p, i) => p.isValid ? i : -1)
        .filter(i => i !== -1);
      setSelectedIndices(new Set(validIndices));
    }
  };

  const handleImport = async () => {
    const productsToImport = parsedProducts
      .filter((_, index) => selectedIndices.has(index))
      .map(p => ({
        name: p.name,
        price: p.price,
        costPrice: p.costPrice,
        image: p.image,
        category: p.category,
        stock: 10, // Default stock
        sourceUrl: p.sourceUrl,
        tags: p.tags
      }));

    if (productsToImport.length === 0) {
      toast({
        title: "Nenhum produto selecionado",
        variant: "destructive"
      });
      return;
    }

    setIsImporting(true);
    setImportProgress(10);

    try {
      // Usamos profitMargin 0 porque o preço já foi calculado no parser
      await bulkImportProducts(productsToImport);
      
      setImportProgress(100);
      toast({
        title: "Importação concluída!",
        description: `${productsToImport.length} produtos foram adicionados.`
      });
      
      // Limpar tudo após sucesso
      setTimeout(() => {
        setInputText('');
        setParsedProducts([]);
        setSelectedIndices(new Set());
        setActiveTab('input');
        setImportProgress(0);
        setIsImporting(false);
      }, 1500);
      
    } catch (error) {
      console.error(error);
      setIsImporting(false);
      setImportProgress(0);
      toast({
        title: "Erro na importação",
        description: "Ocorreu um erro ao salvar os produtos.",
        variant: "destructive"
      });
    }
  };

  const validCount = parsedProducts.filter(p => p.isValid).length;
  const selectedCount = selectedIndices.size;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Importação em Massa</h2>
        {isImporting && <span className="text-sm text-muted-foreground animate-pulse">Processando...</span>}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="input" disabled={isImporting}>
            <FileText className="mr-2 h-4 w-4" />
            Texto / Entrada
          </TabsTrigger>
          <TabsTrigger value="preview" disabled={parsedProducts.length === 0 || isImporting}>
            <LayoutGrid className="mr-2 h-4 w-4" />
            Pré-visualização ({parsedProducts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="input" className="space-y-4 mt-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Categoria Padrão</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">✨ Auto-detectar (Recomendado)</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Margem de Lucro (%)</Label>
                  <Input 
                    type="number" 
                    value={profitMargin} 
                    onChange={e => setProfitMargin(e.target.value)}
                    placeholder="Ex: 25"
                  />
                  <p className="text-xs text-muted-foreground">Aplicada sobre o preço encontrado (se houver custo)</p>
                </div>

                <div className="flex items-center space-x-2 pt-8">
                  <Checkbox 
                    id="gen-desc" 
                    checked={generateDescriptions}
                    onCheckedChange={(checked) => setGenerateDescriptions(!!checked)}
                  />
                  <Label htmlFor="gen-desc" className="cursor-pointer text-sm">
                    Gerar descrição com IA
                  </Label>
                </div>

                <div className="flex items-end">
                  <Button onClick={handleParse} className="w-full">
                    <Upload className="mr-2 h-4 w-4" />
                    Analisar Produtos
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Cole aqui os dados (URL Imagem + Nome + Preço)</Label>
                <Textarea 
                  placeholder={`Exemplo:\nhttps://site.com/img1.jpg Processador Ryzen 5 5600 R$ 899,00\nhttps://site.com/img2.jpg Placa de Vídeo RTX 3060 R$ 1.899,00`}
                  className="min-h-[300px] font-mono text-sm"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4 mt-4">
          {parsedProducts.length > 0 && (
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-muted/50 p-4 rounded-lg border">
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="select-all" 
                    checked={selectedCount === parsedProducts.length && parsedProducts.length > 0}
                    onCheckedChange={toggleAll}
                  />
                  <Label htmlFor="select-all" className="cursor-pointer">
                    Selecionar Todos ({selectedCount})
                  </Label>
                </div>
                <div className="text-sm text-muted-foreground">
                  {validCount} válidos, {parsedProducts.length - validCount} com erros
                </div>
              </div>
              
              <Button onClick={handleImport} disabled={selectedCount === 0 || isImporting} className="w-full md:w-auto">
                {isImporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Confirmar Importação ({selectedCount})
                  </>
                )}
              </Button>
            </div>
          )}

          {isImporting && (
            <Progress value={importProgress} className="w-full h-2" />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {parsedProducts.map((product, index) => (
              <Card key={index} className={`relative overflow-hidden transition-all ${!product.isValid ? 'border-destructive/50 bg-destructive/5' : selectedIndices.has(index) ? 'border-primary ring-1 ring-primary/20' : ''}`}>
                {!product.isValid && (
                  <div className="absolute top-2 right-2 z-10">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  </div>
                )}
                
                <div className="absolute top-2 left-2 z-10">
                  <Checkbox 
                    checked={selectedIndices.has(index)}
                    onCheckedChange={() => toggleSelection(index)}
                    disabled={!product.isValid}
                  />
                </div>

                <CardContent className="p-4 space-y-3">
                  <div className="aspect-square rounded-md overflow-hidden bg-muted relative group">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-contain mix-blend-multiply"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <FileText className="h-10 w-10 opacity-20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs p-2 text-center">
                      Ver imagem original
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {product.category}
                    </div>
                    <h3 className="font-medium text-sm line-clamp-2 h-10" title={product.name}>
                      {product.name || <span className="text-destructive italic">Nome não identificado</span>}
                    </h3>
                  </div>

                  <div className="pt-2 border-t flex justify-between items-end">
                    <div>
                      {product.costPrice && product.costPrice !== product.price && (
                        <div className="text-xs text-muted-foreground line-through">
                          {product.costPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </div>
                      )}
                      <div className="font-bold text-lg text-primary">
                        {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </div>
                    </div>
                    {product.tags && product.tags.length > 0 && (
                      <div className="flex gap-1">
                        {product.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-secondary-foreground">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {product.validationError && (
                    <Alert variant="destructive" className="py-2 px-3 mt-2 text-xs">
                      <AlertDescription>{product.validationError}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
