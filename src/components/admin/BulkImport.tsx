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
import { AlertCircle, CheckCircle2, Upload, FileText, LayoutGrid, X, Loader2, Trash2, ImageOff } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export const BulkImport = () => {
  const { bulkImportProducts, loading: productsLoading, isImporting, importProgress } = useProducts();
  const { categories, addCategory } = useCategories();
  
  const [inputText, setInputText] = useState('');
  const [profitMargin, setProfitMargin] = useState('25');
  const [selectedCategory, setSelectedCategory] = useState<string>('auto');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [defaultTags, setDefaultTags] = useState('');
  const [highlightTag, setHighlightTag] = useState('');
  const [stockQuantity, setStockQuantity] = useState('10');
  const [ribbonType, setRibbonType] = useState('none');
  const [customRibbonText, setCustomRibbonText] = useState('');
  const [parsedProducts, setParsedProducts] = useState<ParsedProduct[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState('input');
  // Local state removed in favor of Context state
  const [generateDescriptions, setGenerateDescriptions] = useState(false);

  // Monitora o fim da importação para limpar a tela
  React.useEffect(() => {
    if (!isImporting && importProgress === 100 && parsedProducts.length > 0) {
      const timer = setTimeout(() => {
        setInputText('');
        setParsedProducts([]);
        setSelectedIndices(new Set());
        setActiveTab('input');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isImporting, importProgress, parsedProducts.length]);

  const handleRemoveProduct = (indexToRemove: number) => {
    setParsedProducts(prev => prev.filter((_, i) => i !== indexToRemove));
    setSelectedIndices(prev => {
      const newSet = new Set<number>();
      prev.forEach(i => {
        if (i < indexToRemove) newSet.add(i);
        if (i > indexToRemove) newSet.add(i - 1);
      });
      return newSet;
    });
  };

  const handleRemoveNoImage = () => {
    const productsToKeep = parsedProducts.filter(p => !!p.image);
    setParsedProducts(productsToKeep);
    
    // Re-selecionar todos os válidos após a limpeza
    const newIndices = new Set<number>();
    productsToKeep.forEach((p, i) => {
      if (p.isValid) newIndices.add(i);
    });
    setSelectedIndices(newIndices);

    toast({
      title: "Produtos sem imagem removidos",
      description: `${parsedProducts.length - productsToKeep.length} itens foram removidos.`
    });
  };

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
    
    // Converter string de tags separada por vírgula em array de strings
    const tagsList = defaultTags ? defaultTags.split(',').map(t => t.trim()).filter(Boolean) : [];
    
    // Determinar a categoria padrão a ser usada
    let categoryToUse = selectedCategory === 'auto' ? undefined : selectedCategory;
    if (selectedCategory === 'new_category') {
      if (!newCategoryName.trim()) {
        toast({
          title: "Nome da categoria obrigatório",
          description: "Por favor, informe o nome da nova categoria.",
          variant: "destructive"
        });
        return;
      }
      categoryToUse = newCategoryName.trim();
    }
    
    // Configurar Ribbon
    let ribbonLabel: string | undefined = undefined;
    if (ribbonType === 'custom' && customRibbonText.trim()) {
      ribbonLabel = customRibbonText.trim();
    } else if (ribbonType !== 'none' && ribbonType !== 'custom') {
      ribbonLabel = ribbonType === 'novidade' ? 'Novidade' : 'Usado';
    }

    const results = parseBulkImport(inputText, {
      defaultCategory: categoryToUse,
      autoDetectCategory: selectedCategory === 'auto',
      profitMargin: margin,
      defaultTags: tagsList,
      ribbonLabel: ribbonLabel
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
    // 1. Verificar se precisamos criar a categoria "manual" selecionada
    if (selectedCategory === 'new_category' && newCategoryName.trim()) {
      try {
        const slug = newCategoryName.trim().toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-');
        
        // Verifica se já existe para evitar erro
        const exists = categories.find(c => c.slug === slug);
        if (!exists) {
            await addCategory(newCategoryName.trim(), slug);
        }
      } catch (error) {
        console.error("Erro ao criar categoria:", error);
        toast({
            title: "Erro ao criar categoria manual",
            description: "Houve um problema ao criar a categoria especificada.",
            variant: "destructive"
        });
        return; // Interrompe se falhar
      }
    }

    // 2. Identificar categorias novas vindas da detecção automática
    const categoriesToCreate = new Map<string, string>(); // Name -> Slug

    parsedProducts.forEach((p, index) => {
        if (!selectedIndices.has(index)) return;

        // Lógica de determinação da categoria para este produto
        let targetCategoryName = p.category;
        
        // Se o usuário forçou uma categoria (diferente de auto), usamos ela
        if (selectedCategory !== 'auto' && selectedCategory !== 'new_category') {
             // Se selecionou uma existente, não precisamos criar nada, o nome já é conhecido
             return; 
        }
        if (selectedCategory === 'new_category') {
            // Já tratamos acima
            return;
        }

        // Se estamos no modo AUTO, verificamos se a categoria detectada existe
        const existingCategory = categories.find(c => c.name.toLowerCase() === targetCategoryName.toLowerCase());
        
        if (!existingCategory) {
            // Se não existe, vamos planejar criar
            // Normalizar nome (Title Case) para ficar bonito no banco
            const formattedName = targetCategoryName.charAt(0).toUpperCase() + targetCategoryName.slice(1);
            const slug = formattedName.toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-');
            
            categoriesToCreate.set(formattedName, slug);
        }
    });

    // 3. Criar as categorias novas detectadas em lote (sequencialmente)
    if (categoriesToCreate.size > 0) {
        toast({
            title: "Criando novas categorias...",
            description: `Detectamos ${categoriesToCreate.size} novas categorias necessárias.`
        });

        for (const [name, slug] of categoriesToCreate) {
            try {
                // Verificação dupla se não existe no contexto atual (pode ter sido criada no passo 1)
                const exists = categories.find(c => c.slug === slug);
                if (!exists) {
                    await addCategory(name, slug);
                }
            } catch (error) {
                console.error(`Erro ao criar categoria automática ${name}:`, error);
                // Não interrompemos tudo, mas o produto pode ficar sem categoria visível
            }
        }
        // Pequeno delay para garantir que o contexto atualize se necessário (embora addCategory já atualize state local)
    }

    // 4. Prosseguir com a importação dos produtos
    const productsToImport = parsedProducts
      .filter((_, index) => selectedIndices.has(index))
      .map(p => {
        // Encontrar o slug da categoria final
        let categorySlug = p.category.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        
        // Se o usuário selecionou uma categoria específica, use-a
        if (selectedCategory !== 'auto' && selectedCategory !== 'new_category') {
            const selected = categories.find(c => c.name === selectedCategory);
            if (selected) categorySlug = selected.slug;
        }
        else if (selectedCategory === 'new_category') {
             categorySlug = newCategoryName.trim().toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');
        }
        else {
            // Modo AUTO: Tentar casar com a lista atualizada de categorias
            // Nota: Como acabamos de chamar addCategory, o state 'categories' do hook pode ainda não ter refletido 
            // se o hook não tiver um mecanismo de optimistic update imediato ou re-fetch rápido.
            // Mas o addCategory do context atualiza o state local: setCategories(current => [...current, data]);
            // Então 'categories' aqui DENTRO DA FUNÇÃO pode estar desatualizado por ser closure?
            // Sim, 'categories' é const do render. 
            // Porém, podemos confiar na lógica de slug determinística ou buscar no map created.
            
            const catName = p.category;
            // Tenta achar na lista antiga
            const existing = categories.find(c => c.name.toLowerCase() === catName.toLowerCase());
            
            if (existing) {
                categorySlug = existing.slug;
            } else {
                // Se não estava na lista antiga, deve ser uma das novas que acabamos de criar
                // Recalcula o slug da mesma forma que fizemos para criar
                categorySlug = catName.trim().toLowerCase()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/\s+/g, '-');
            }
        }

        return {
          name: p.name,
          price: p.price,
          costPrice: p.costPrice,
          image: p.image,
          category: categorySlug,
          stock: 10, // Default stock
          sourceUrl: p.sourceUrl,
          tags: p.tags
        };
      });

    if (productsToImport.length === 0) {
      toast({
        title: "Nenhum produto selecionado",
        variant: "destructive"
      });
      return;
    }

    // Inicia a importação em background via Context
    bulkImportProducts(productsToImport);
    
    toast({
      title: "Importação iniciada",
      description: "O processo continuará em segundo plano. Você pode navegar para outras páginas.",
    });
  };

  const validCount = parsedProducts.filter(p => p.isValid).length;
  const selectedCount = selectedIndices.size;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Importação em Massa</h2>
          {isImporting && (
            <div className="flex items-center gap-2 text-sm text-primary animate-pulse">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Importando {importProgress}%</span>
            </div>
          )}
        </div>
        
        {isImporting && (
          <div className="w-full space-y-1">
            <Progress value={importProgress} className="w-full h-2 transition-all" />
            <p className="text-xs text-muted-foreground text-right">Processando em segundo plano...</p>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="input">
            <FileText className="mr-2 h-4 w-4" />
            Texto / Entrada
          </TabsTrigger>
          <TabsTrigger value="preview" disabled={parsedProducts.length === 0}>
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
                      <SelectItem value="new_category">➕ Nova Categoria...</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedCategory === 'new_category' && (
                    <Input 
                      className="mt-2"
                      placeholder="Nome da nova categoria"
                      value={newCategoryName}
                      onChange={e => setNewCategoryName(e.target.value)}
                    />
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Etiquetas Padrão (Tags)</Label>
                  <Input 
                    type="text" 
                    value={defaultTags} 
                    onChange={e => setDefaultTags(e.target.value)}
                    placeholder="Ex: promoção, usado, black friday"
                  />
                  <p className="text-xs text-muted-foreground">Separadas por vírgula. Serão adicionadas a todos os itens.</p>
                </div>

                <div className="space-y-2">
                  <Label>Fita / Ribbon (Opcional)</Label>
                  <Select value={ribbonType} onValueChange={setRibbonType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sem fita" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhuma</SelectItem>
                      <SelectItem value="novidade">Novidade</SelectItem>
                      <SelectItem value="usado">Usado</SelectItem>
                      <SelectItem value="custom">Personalizada...</SelectItem>
                    </SelectContent>
                  </Select>
                  {ribbonType === 'custom' && (
                    <Input 
                      className="mt-2"
                      placeholder="Texto da fita (Ex: Oferta)"
                      value={customRibbonText}
                      onChange={e => setCustomRibbonText(e.target.value)}
                      maxLength={15}
                    />
                  )}
                  <p className="text-xs text-muted-foreground">Aparecerá como uma faixa no card do produto.</p>
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
              <div className="flex items-center gap-4 flex-wrap">
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
                
                <div className="h-4 w-px bg-border mx-2" />
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRemoveNoImage}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 border-dashed"
                >
                  <ImageOff className="mr-2 h-4 w-4" />
                  Remover sem fotos
                </Button>

                <div className="text-sm text-muted-foreground ml-auto">
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
             // Progress moved to top
             null
          )}

          <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-1.5">
            {parsedProducts.map((product, index) => (
              <Card key={index} className={`relative overflow-hidden group/card transition-all ${!product.isValid ? 'border-destructive/50 bg-destructive/5' : selectedIndices.has(index) ? 'border-primary ring-1 ring-primary/20' : ''}`}>
                <div className="absolute top-0.5 right-0.5 z-20 flex gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                   <Button
                     size="icon"
                     variant="destructive"
                     className="h-4 w-4 rounded-full shadow-sm"
                     onClick={(e) => {
                       e.stopPropagation();
                       handleRemoveProduct(index);
                     }}
                     title="Remover produto"
                   >
                     <X className="h-2 w-2" />
                   </Button>
                </div>
                
                {!product.isValid && (
                  <div className="absolute top-0.5 right-0.5 z-10 group-hover/card:opacity-0 transition-opacity">
                    <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                  </div>
                )}
                
                <div className="absolute top-0.5 left-0.5 z-10">
                  <Checkbox 
                    checked={selectedIndices.has(index)}
                    onCheckedChange={() => toggleSelection(index)}
                    disabled={!product.isValid}
                    className="h-3 w-3 bg-white/80 backdrop-blur-sm data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                  />
                </div>

                <CardContent className="p-1.5 space-y-1">
                  <div className="aspect-square rounded-sm overflow-hidden bg-muted relative group">
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
                      <div className="flex items-center justify-center h-full text-muted-foreground bg-zinc-50">
                        <FileText className="h-5 w-5 opacity-20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[8px] p-0.5 text-center cursor-pointer" onClick={() => window.open(product.image, '_blank')}>
                      Ver
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <div className="text-[8px] font-medium text-muted-foreground uppercase tracking-wider truncate">
                      {product.category}
                    </div>
                    <h3 className="font-medium text-[9px] leading-3 line-clamp-2 h-[1.5em]" title={product.name}>
                      {product.name || <span className="text-destructive italic">Nome não identificado</span>}
                    </h3>
                  </div>

                  <div className="pt-1 border-t flex justify-between items-end">
                    <div>
                      {product.costPrice && product.costPrice !== product.price && (
                        <div className="text-[8px] text-muted-foreground line-through leading-none mb-0.5">
                          {product.costPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </div>
                      )}
                      <div className="font-bold text-[10px] text-primary leading-none">
                        {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </div>
                    </div>
                  </div>

                  {product.validationError && (
                    <div className="text-[8px] text-destructive mt-0.5 bg-destructive/10 p-0.5 rounded leading-tight">
                      {product.validationError}
                    </div>
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
