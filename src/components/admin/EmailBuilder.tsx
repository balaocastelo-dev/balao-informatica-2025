import { useState, useCallback } from 'react';
import { 
  GripVertical, 
  Type, 
  Image, 
  ShoppingBag, 
  Square, 
  Trash2,
  Plus,
  Eye,
  Code,
  Heading1,
  AlignLeft,
  Sparkles
} from 'lucide-react';
import { Product } from '@/types/product';

interface EmailBlock {
  id: string;
  type: 'header' | 'text' | 'image' | 'products' | 'button' | 'divider' | 'spacer';
  content: Record<string, string | string[]>;
}

interface EmailBuilderProps {
  products: Product[];
  selectedProducts: string[];
  initialSubject?: string;
  initialContent?: string;
  onSave: (blocks: EmailBlock[], subject: string) => void;
  onCancel: () => void;
}

const BLOCK_TEMPLATES: { type: EmailBlock['type']; icon: React.ReactNode; label: string }[] = [
  { type: 'header', icon: <Heading1 className="w-4 h-4" />, label: 'Cabeçalho' },
  { type: 'text', icon: <AlignLeft className="w-4 h-4" />, label: 'Texto' },
  { type: 'image', icon: <Image className="w-4 h-4" />, label: 'Imagem' },
  { type: 'products', icon: <ShoppingBag className="w-4 h-4" />, label: 'Produtos' },
  { type: 'button', icon: <Square className="w-4 h-4" />, label: 'Botão' },
  { type: 'divider', icon: <Type className="w-4 h-4" />, label: 'Divisor' },
  { type: 'spacer', icon: <Plus className="w-4 h-4" />, label: 'Espaço' },
];

const DEFAULT_BLOCKS: EmailBlock[] = [
  { id: '1', type: 'header', content: { title: '🎉 Ofertas Especiais!', subtitle: 'Confira nossos produtos em destaque' } },
  { id: '2', type: 'text', content: { text: 'Olá! Temos novidades incríveis para você. Não perca essas oportunidades!' } },
  { id: '3', type: 'products', content: { layout: 'grid' } },
  { id: '4', type: 'button', content: { text: 'Ver Todas as Ofertas', url: 'https://www.balao.info', color: '#E60000' } },
  { id: '5', type: 'divider', content: {} },
  { id: '6', type: 'text', content: { text: 'Atenciosamente,\nEquipe Balão da Informática' } },
];

export function EmailBuilder({ products, selectedProducts, initialSubject, onSave, onCancel }: EmailBuilderProps) {
  const [blocks, setBlocks] = useState<EmailBlock[]>(DEFAULT_BLOCKS);
  const [subject, setSubject] = useState(initialSubject || '🎉 Ofertas Especiais - Balão da Informática');
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [editingBlock, setEditingBlock] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'code'>('edit');

  const selectedProductsList = products.filter(p => selectedProducts.includes(p.id));

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addBlock = (type: EmailBlock['type']) => {
    const newBlock: EmailBlock = {
      id: generateId(),
      type,
      content: getDefaultContent(type),
    };
    setBlocks([...blocks, newBlock]);
  };

  const getDefaultContent = (type: EmailBlock['type']): Record<string, string | string[]> => {
    switch (type) {
      case 'header': return { title: 'Título do Email', subtitle: 'Subtítulo opcional' };
      case 'text': return { text: 'Digite seu texto aqui...' };
      case 'image': return { url: 'https://via.placeholder.com/600x200', alt: 'Imagem' };
      case 'products': return { layout: 'grid' };
      case 'button': return { text: 'Clique Aqui', url: '#', color: '#E60000' };
      case 'divider': return {};
      case 'spacer': return { height: '20' };
      default: return {};
    }
  };

  const updateBlock = (id: string, content: Record<string, string | string[]>) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, content } : b));
  };

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
  };

  const moveBlock = (fromIndex: number, toIndex: number) => {
    const newBlocks = [...blocks];
    const [removed] = newBlocks.splice(fromIndex, 1);
    newBlocks.splice(toIndex, 0, removed);
    setBlocks(newBlocks);
  };

  const handleDragStart = (e: React.DragEvent, blockId: string) => {
    setDraggedBlock(blockId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    if (draggedBlock) {
      const fromIndex = blocks.findIndex(b => b.id === draggedBlock);
      if (fromIndex !== -1 && fromIndex !== toIndex) {
        moveBlock(fromIndex, toIndex);
      }
    }
    setDraggedBlock(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedBlock(null);
    setDragOverIndex(null);
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const renderBlockPreview = (block: EmailBlock) => {
    switch (block.type) {
      case 'header':
        return (
          <div className="text-center py-6 px-4 bg-gradient-to-r from-[#E60000] to-[#ff3333] text-white rounded-t-lg">
            <h1 className="text-2xl font-bold">{block.content.title as string}</h1>
            {block.content.subtitle && (
              <p className="text-sm mt-2 opacity-90">{block.content.subtitle as string}</p>
            )}
          </div>
        );
      case 'text':
        return (
          <div className="py-4 px-6 whitespace-pre-wrap text-gray-700">
            {block.content.text as string}
          </div>
        );
      case 'image':
        return (
          <div className="py-2 px-4">
            <img 
              src={block.content.url as string} 
              alt={block.content.alt as string} 
              className="w-full rounded-lg"
            />
          </div>
        );
      case 'products':
        return (
          <div className="py-4 px-4 bg-gray-100">
            <div className="grid grid-cols-2 gap-3">
              {selectedProductsList.slice(0, 4).map(product => (
                <div key={product.id} className="border border-gray-200 rounded-lg p-3 text-center bg-white shadow-sm">
                  <div className="bg-gray-100 rounded-md p-2 mb-2">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-24 object-contain"
                    />
                  </div>
                  <p className="text-xs font-medium line-clamp-2 text-gray-800">{product.name}</p>
                  <p className="text-sm font-bold text-[#E60000] mt-1">{formatPrice(product.price)}</p>
                  <button className="mt-2 px-3 py-1 bg-[#E60000] text-white text-xs rounded font-semibold">
                    VER PRODUTO
                  </button>
                </div>
              ))}
            </div>
            {selectedProductsList.length > 4 && (
              <p className="text-center text-sm text-gray-500 mt-3">
                +{selectedProductsList.length - 4} produtos
              </p>
            )}
            {selectedProductsList.length === 0 && (
              <p className="text-center text-gray-400 py-8">Nenhum produto selecionado</p>
            )}
          </div>
        );
      case 'button':
        return (
          <div className="py-4 px-6 text-center">
            <a 
              href={block.content.url as string}
              className="inline-block px-8 py-3 rounded-lg font-semibold text-white"
              style={{ backgroundColor: block.content.color as string }}
            >
              {block.content.text as string}
            </a>
          </div>
        );
      case 'divider':
        return <hr className="my-4 mx-6 border-gray-200" />;
      case 'spacer':
        return <div style={{ height: `${block.content.height}px` }} />;
      default:
        return null;
    }
  };

  const renderBlockEditor = (block: EmailBlock) => {
    if (editingBlock !== block.id) return null;

    return (
      <div className="p-4 bg-secondary rounded-lg mt-2 space-y-3">
        {block.type === 'header' && (
          <>
            <input
              type="text"
              value={block.content.title as string}
              onChange={e => updateBlock(block.id, { ...block.content, title: e.target.value })}
              className="input-field"
              placeholder="Título"
            />
            <input
              type="text"
              value={block.content.subtitle as string}
              onChange={e => updateBlock(block.id, { ...block.content, subtitle: e.target.value })}
              className="input-field"
              placeholder="Subtítulo"
            />
          </>
        )}
        {block.type === 'text' && (
          <textarea
            value={block.content.text as string}
            onChange={e => updateBlock(block.id, { ...block.content, text: e.target.value })}
            className="input-field min-h-[100px]"
            placeholder="Digite o texto..."
          />
        )}
        {block.type === 'image' && (
          <>
            <input
              type="url"
              value={block.content.url as string}
              onChange={e => updateBlock(block.id, { ...block.content, url: e.target.value })}
              className="input-field"
              placeholder="URL da imagem"
            />
            <input
              type="text"
              value={block.content.alt as string}
              onChange={e => updateBlock(block.id, { ...block.content, alt: e.target.value })}
              className="input-field"
              placeholder="Texto alternativo"
            />
          </>
        )}
        {block.type === 'button' && (
          <>
            <input
              type="text"
              value={block.content.text as string}
              onChange={e => updateBlock(block.id, { ...block.content, text: e.target.value })}
              className="input-field"
              placeholder="Texto do botão"
            />
            <input
              type="url"
              value={block.content.url as string}
              onChange={e => updateBlock(block.id, { ...block.content, url: e.target.value })}
              className="input-field"
              placeholder="URL do link"
            />
            <div className="flex items-center gap-2">
              <label className="text-sm">Cor:</label>
              <input
                type="color"
                value={block.content.color as string}
                onChange={e => updateBlock(block.id, { ...block.content, color: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer"
              />
            </div>
          </>
        )}
        {block.type === 'spacer' && (
          <div className="flex items-center gap-2">
            <label className="text-sm">Altura (px):</label>
            <input
              type="number"
              value={block.content.height as string}
              onChange={e => updateBlock(block.id, { ...block.content, height: e.target.value })}
              className="input-field w-24"
              min="10"
              max="100"
            />
          </div>
        )}
      </div>
    );
  };

  const generateHtmlPreview = () => {
    let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background-color:#ffffff;">
    <!-- Logo Header -->
    <div style="text-align:center;padding:20px;background-color:#ffffff;border-bottom:3px solid #E60000;">
      <img src="https://www.balao.info/media/wysiwyg/balao500.png" alt="Balão da Informática" style="max-width:200px;height:auto;">
    </div>
`;

    blocks.forEach(block => {
      switch (block.type) {
        case 'header':
          html += `
    <div style="text-align:center;padding:24px 16px;background:linear-gradient(to right,#E60000,#ff3333);color:#ffffff;">
      <h1 style="margin:0;font-size:24px;font-weight:bold;">${block.content.title}</h1>
      ${block.content.subtitle ? `<p style="margin:8px 0 0;font-size:14px;opacity:0.9;">${block.content.subtitle}</p>` : ''}
    </div>`;
          break;
        case 'text':
          html += `
    <div style="padding:16px 24px;color:#374151;white-space:pre-wrap;">
      ${(block.content.text as string).replace(/\n/g, '<br>')}
    </div>`;
          break;
        case 'image':
          html += `
    <div style="padding:8px 16px;">
      <img src="${block.content.url}" alt="${block.content.alt}" style="width:100%;border-radius:8px;">
    </div>`;
          break;
        case 'products':
          html += `
    <div style="padding:16px;background-color:#f8f9fa;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>`;
          selectedProductsList.slice(0, 4).forEach((product, i) => {
            html += `
          <td style="width:50%;padding:8px;text-align:center;vertical-align:top;">
            <div style="border:1px solid #e5e7eb;border-radius:8px;padding:12px;background:#ffffff;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
              <div style="background:#f3f4f6;padding:8px;border-radius:6px;margin-bottom:8px;">
                <img src="${product.image}" alt="${product.name}" style="width:100%;height:96px;object-fit:contain;">
              </div>
              <p style="font-size:12px;margin:8px 0 4px;color:#1f2937;font-weight:500;line-height:1.3;">${product.name.substring(0, 50)}...</p>
              <p style="font-size:16px;margin:0;color:#E60000;font-weight:bold;">${formatPrice(product.price)}</p>
              <a href="https://www.balao.info/produto/${product.id}" style="display:inline-block;margin-top:8px;padding:6px 12px;background:#E60000;color:#fff;text-decoration:none;border-radius:4px;font-size:11px;font-weight:600;">VER PRODUTO</a>
            </div>
          </td>`;
            if (i % 2 === 1 && i < selectedProductsList.slice(0, 4).length - 1) {
              html += `
        </tr>
        <tr>`;
            }
          });
          html += `
        </tr>
      </table>
    </div>`;
          break;
        case 'button':
          html += `
    <div style="padding:16px 24px;text-align:center;">
      <a href="${block.content.url}" style="display:inline-block;padding:12px 32px;background-color:${block.content.color};color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;">
        ${block.content.text}
      </a>
    </div>`;
          break;
        case 'divider':
          html += `
    <hr style="margin:16px 24px;border:none;border-top:1px solid #e5e7eb;">`;
          break;
        case 'spacer':
          html += `
    <div style="height:${block.content.height}px;"></div>`;
          break;
      }
    });

    html += `
    <div style="text-align:center;padding:24px;background:#1f2937;color:#ffffff;font-size:12px;">
      <img src="https://www.balao.info/media/wysiwyg/balao500.png" alt="Balão da Informática" style="max-width:120px;height:auto;margin-bottom:12px;">
      <p style="margin:0;">© ${new Date().getFullYear()} Balão da Informática - Todos os direitos reservados</p>
      <p style="margin:8px 0 0;color:#9ca3af;">Campinas, SP - (19) 98751-0267</p>
    </div>
  </div>
</body>
</html>`;

    return html;
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">Editor de Email Visual</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('edit')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${viewMode === 'edit' ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-muted'}`}
            >
              Editar
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-1 ${viewMode === 'preview' ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-muted'}`}
            >
              <Eye className="w-4 h-4" /> Preview
            </button>
            <button
              onClick={() => setViewMode('code')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-1 ${viewMode === 'code' ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-muted'}`}
            >
              <Code className="w-4 h-4" /> HTML
            </button>
          </div>
        </div>

        {/* Subject */}
        <div className="p-4 border-b border-border">
          <label className="text-sm font-medium mb-1 block">Assunto do Email</label>
          <input
            type="text"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            className="input-field"
            placeholder="Assunto do email..."
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex">
          {viewMode === 'edit' && (
            <>
              {/* Sidebar - Block Palette */}
              <div className="w-48 border-r border-border p-4 overflow-y-auto">
                <h3 className="text-sm font-semibold mb-3">Blocos</h3>
                <div className="space-y-2">
                  {BLOCK_TEMPLATES.map(template => (
                    <button
                      key={template.type}
                      onClick={() => addBlock(template.type)}
                      className="w-full flex items-center gap-2 p-2 bg-secondary hover:bg-muted rounded-lg transition-colors text-sm"
                    >
                      {template.icon}
                      {template.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Editor Area */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
                  {blocks.map((block, index) => (
                    <div
                      key={block.id}
                      draggable
                      onDragStart={e => handleDragStart(e, block.id)}
                      onDragOver={e => handleDragOver(e, index)}
                      onDrop={e => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`relative group ${dragOverIndex === index ? 'border-t-2 border-primary' : ''} ${draggedBlock === block.id ? 'opacity-50' : ''}`}
                    >
                      {/* Block Controls */}
                      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <button
                          onClick={() => setEditingBlock(editingBlock === block.id ? null : block.id)}
                          className="p-1.5 bg-primary text-primary-foreground rounded hover:bg-primary/80 transition-colors"
                          title="Editar"
                        >
                          <Type className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => deleteBlock(block.id)}
                          className="p-1.5 bg-destructive text-destructive-foreground rounded hover:bg-destructive/80 transition-colors"
                          title="Remover"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Drag Handle */}
                      <div className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity">
                        <GripVertical className="w-4 h-4 text-gray-400" />
                      </div>

                      {/* Block Preview */}
                      <div 
                        className="cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => setEditingBlock(editingBlock === block.id ? null : block.id)}
                      >
                        {renderBlockPreview(block)}
                      </div>

                      {/* Block Editor */}
                      {renderBlockEditor(block)}
                    </div>
                  ))}

                  {blocks.length === 0 && (
                    <div className="py-20 text-center text-gray-400">
                      <Plus className="w-12 h-12 mx-auto mb-4" />
                      <p>Adicione blocos para construir seu email</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {viewMode === 'preview' && (
            <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
              <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
                {blocks.map(block => (
                  <div key={block.id}>
                    {renderBlockPreview(block)}
                  </div>
                ))}
                <div className="text-center py-6 bg-gray-50 text-gray-500 text-xs">
                  © {new Date().getFullYear()} Balão da Informática - Todos os direitos reservados
                </div>
              </div>
            </div>
          )}

          {viewMode === 'code' && (
            <div className="flex-1 overflow-y-auto p-4">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap">
                {generateHtmlPreview()}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-secondary hover:bg-muted rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => onSave(blocks, subject)}
            className="btn-primary"
          >
            Salvar Template
          </button>
        </div>
      </div>
    </div>
  );
}
