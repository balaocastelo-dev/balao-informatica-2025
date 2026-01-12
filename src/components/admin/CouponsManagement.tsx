import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Check, X, Tag, CalendarRange, Percent, DollarSign } from 'lucide-react';

type Coupon = {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_value: number | null;
  max_discount_value: number | null;
  starts_at: string | null;
  ends_at: string | null;
  usage_limit: number | null;
  usage_count: number;
  active: boolean;
  created_at: string;
};

type CouponForm = {
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: string;
  min_order_value: string;
  max_discount_value: string;
  starts_at: string;
  ends_at: string;
  usage_limit: string;
  active: boolean;
};

export function CouponsManagement() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState<CouponForm>({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    min_order_value: '',
    max_discount_value: '',
    starts_at: '',
    ends_at: '',
    usage_limit: '',
    active: true,
  });

  const resetForm = () => {
    setForm({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: '',
      min_order_value: '',
      max_discount_value: '',
      starts_at: '',
      ends_at: '',
      usage_limit: '',
      active: true,
    });
    setEditing(null);
  };

  const fetchCoupons = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      toast({ title: 'Erro ao buscar cupons', variant: 'destructive' });
    } else {
      setCoupons((data || []) as Coupon[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return coupons;
    return coupons.filter(c => c.code.toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q));
  }, [coupons, search]);

  const parseNumber = (s: string) => {
    const n = Number(String(s || '').replace(',', '.'));
    return isNaN(n) ? null : n;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      code: form.code.trim().toUpperCase(),
      description: form.description.trim() || null,
      discount_type: form.discount_type,
      discount_value: parseNumber(form.discount_value) || 0,
      min_order_value: parseNumber(form.min_order_value),
      max_discount_value: parseNumber(form.max_discount_value),
      starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
      ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
      usage_limit: parseNumber(form.usage_limit),
      active: form.active,
    };
    if (!payload.code || payload.discount_value <= 0) {
      toast({ title: 'Código e valor de desconto são obrigatórios', variant: 'destructive' });
      return;
    }
    setLoading(true);
    if (editing) {
      const { error } = await supabase.from('coupons').update(payload).eq('id', editing.id);
      if (error) {
        console.error('Erro ao atualizar cupom:', error);
        toast({ title: 'Erro ao atualizar cupom', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Cupom atualizado!' });
        setShowForm(false);
        resetForm();
        fetchCoupons();
      }
    } else {
      const { error } = await supabase.from('coupons').insert(payload);
      if (error) {
        console.error('Erro ao criar cupom:', error);
        toast({ title: 'Erro ao criar cupom', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Cupom criado!' });
        setShowForm(false);
        resetForm();
        fetchCoupons();
      }
    }
    setLoading(false);
  };

  const handleEdit = (c: Coupon) => {
    setEditing(c);
    setForm({
      code: c.code,
      description: c.description || '',
      discount_type: c.discount_type,
      discount_value: String(c.discount_value),
      min_order_value: c.min_order_value != null ? String(c.min_order_value) : '',
      max_discount_value: c.max_discount_value != null ? String(c.max_discount_value) : '',
      starts_at: c.starts_at ? c.starts_at.slice(0, 16) : '',
      ends_at: c.ends_at ? c.ends_at.slice(0, 16) : '',
      usage_limit: c.usage_limit != null ? String(c.usage_limit) : '',
      active: c.active,
    });
    setShowForm(true);
  };

  const handleDelete = async (c: Coupon) => {
    if (!confirm(`Excluir cupom ${c.code}?`)) return;
    const { error } = await supabase.from('coupons').delete().eq('id', c.id);
    if (error) {
      toast({ title: 'Erro ao excluir cupom', variant: 'destructive' });
    } else {
      toast({ title: 'Cupom excluído!' });
      fetchCoupons();
    }
  };

  const toggleActive = async (c: Coupon) => {
    const { error } = await supabase.from('coupons').update({ active: !c.active }).eq('id', c.id);
    if (error) {
      toast({ title: 'Erro ao atualizar status', variant: 'destructive' });
    } else {
      fetchCoupons();
    }
  };

  const formatBRL = (v: number | null) => {
    if (v == null) return '-';
    return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Gerenciar Cupons</h2>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Cupom
        </button>
      </div>

      <div className="admin-card">
        <div className="flex items-center justify-between mb-4">
          <div className="relative">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por código ou descrição"
              className="input-field w-64"
            />
          </div>
          {loading && <span className="text-sm text-muted-foreground">Carregando…</span>}
        </div>

        <div className="overflow-x-auto border border-border rounded-lg">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-secondary/50">
              <tr>
                <th className="p-3 text-left text-sm font-medium">Código</th>
                <th className="p-3 text-left text-sm font-medium">Descrição</th>
                <th className="p-3 text-left text-sm font-medium">Tipo</th>
                <th className="p-3 text-left text-sm font-medium">Valor</th>
                <th className="p-3 text-left text-sm font-medium">Mín. Pedido</th>
                <th className="p-3 text-left text-sm font-medium">Máx. Desconto</th>
                <th className="p-3 text-left text-sm font-medium">Início</th>
                <th className="p-3 text-left text-sm font-medium">Fim</th>
                <th className="p-3 text-left text-sm font-medium">Limite</th>
                <th className="p-3 text-left text-sm font-medium">Usado</th>
                <th className="p-3 text-left text-sm font-medium">Ativo</th>
                <th className="p-3 text-right text-sm font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-secondary/50 transition-colors">
                  <td className="p-3 font-medium">{c.code}</td>
                  <td className="p-3 text-sm">{c.description || '-'}</td>
                  <td className="p-3 text-sm flex items-center gap-1">
                    {c.discount_type === 'percentage' ? <Percent className="w-3 h-3" /> : <DollarSign className="w-3 h-3" />}
                    {c.discount_type === 'percentage' ? 'Porcentagem' : 'Valor Fixo'}
                  </td>
                  <td className="p-3 text-sm">
                    {c.discount_type === 'percentage' ? `${c.discount_value}%` : formatBRL(c.discount_value)}
                  </td>
                  <td className="p-3 text-sm">{formatBRL(c.min_order_value)}</td>
                  <td className="p-3 text-sm">{formatBRL(c.max_discount_value)}</td>
                  <td className="p-3 text-xs">
                    {c.starts_at ? new Date(c.starts_at).toLocaleString('pt-BR') : '-'}
                  </td>
                  <td className="p-3 text-xs">
                    {c.ends_at ? new Date(c.ends_at).toLocaleString('pt-BR') : '-'}
                  </td>
                  <td className="p-3 text-sm">{c.usage_limit ?? '-'}</td>
                  <td className="p-3 text-sm">{c.usage_count}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${c.active ? 'bg-green-100 text-green-800' : 'bg-zinc-200 text-zinc-700'}`}>
                      {c.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => toggleActive(c)}
                        className="p-1.5 rounded-lg hover:bg-secondary"
                        title={c.active ? 'Desativar' : 'Ativar'}
                      >
                        {c.active ? <X className="w-4 h-4 text-muted-foreground" /> : <Check className="w-4 h-4 text-green-600" />}
                      </button>
                      <button
                        onClick={() => handleEdit(c)}
                        className="p-1.5 rounded-lg hover:bg-secondary"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => handleDelete(c)}
                        className="p-1.5 rounded-lg hover:bg-destructive/10"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td className="p-8 text-center text-muted-foreground" colSpan={12}>Nenhum cupom encontrado</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content max-w-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">{editing ? 'Editar Cupom' : 'Novo Cupom'}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-secondary rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Código</label>
                  <input
                    value={form.code}
                    onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="CUPOM10"
                    className="input-field"
                    maxLength={32}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Descrição</label>
                  <input
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="Ex.: 10% off em todo o site"
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Tipo de Desconto</label>
                  <select
                    value={form.discount_type}
                    onChange={e => setForm({ ...form, discount_type: e.target.value as 'percentage' | 'fixed' })}
                    className="input-field"
                  >
                    <option value="percentage">Porcentagem</option>
                    <option value="fixed">Valor Fixo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Valor do Desconto</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.discount_value}
                    onChange={e => setForm({ ...form, discount_value: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Valor Mínimo do Pedido</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.min_order_value}
                    onChange={e => setForm({ ...form, min_order_value: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Máximo de Desconto</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.max_discount_value}
                    onChange={e => setForm({ ...form, max_discount_value: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Início</label>
                  <input
                    type="datetime-local"
                    value={form.starts_at}
                    onChange={e => setForm({ ...form, starts_at: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Fim</label>
                  <input
                    type="datetime-local"
                    value={form.ends_at}
                    onChange={e => setForm({ ...form, ends_at: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Limite de Uso</label>
                  <input
                    type="number"
                    value={form.usage_limit}
                    onChange={e => setForm({ ...form, usage_limit: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={e => setForm({ ...form, active: e.target.checked })}
                    className="rounded border-border"
                  />
                  <span className="text-sm">Ativo</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarRange className="w-4 h-4" />
                  <span className="text-xs">Deixe datas vazias para uso imediato e sem expiração</span>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  {editing ? 'Salvar alterações' : 'Criar cupom'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
