import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Check, Edit, Trash2 } from 'lucide-react';

type DiscountType = 'percentage' | 'fixed';

type CouponRow = {
  id: string;
  code: string;
  description: string | null;
  discount_type: DiscountType;
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

type FormState = {
  id?: string;
  code: string;
  description: string;
  discount_type: DiscountType;
  discount_value: string;
  min_order_value: string;
  max_discount_value: string;
  starts_at: string;
  ends_at: string;
  usage_limit: string;
  active: boolean;
};

export function CouponsManagement() {
  const [coupons, setCoupons] = useState<CouponRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<FormState>({
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

  const refresh = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setCoupons((data || []) as CouponRow[]);
    } catch (err) {
      toast({ title: 'Erro ao carregar cupons', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return coupons;
    return coupons.filter(c => c.code.toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q));
  }, [coupons, search]);

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
  };

  const startEdit = (c: CouponRow) => {
    setForm({
      id: c.id,
      code: c.code,
      description: c.description || '',
      discount_type: c.discount_type,
      discount_value: String(c.discount_value || ''),
      min_order_value: c.min_order_value != null ? String(c.min_order_value) : '',
      max_discount_value: c.max_discount_value != null ? String(c.max_discount_value) : '',
      starts_at: c.starts_at ? c.starts_at.slice(0, 16) : '',
      ends_at: c.ends_at ? c.ends_at.slice(0, 16) : '',
      usage_limit: c.usage_limit != null ? String(c.usage_limit) : '',
      active: c.active,
    });
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm('Excluir este cupom?')) return;
    try {
      setSaving(true);
      const { error } = await supabase.from('coupons').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Cupom excluído!' });
      await refresh();
    } catch {
      toast({ title: 'Erro ao excluir', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (c: CouponRow) => {
    try {
      setSaving(true);
      const { error } = await supabase.from('coupons').update({ active: !c.active }).eq('id', c.id);
      if (error) throw error;
      await refresh();
    } catch {
      toast({ title: 'Erro ao atualizar status', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      code: form.code.trim().toUpperCase(),
      description: form.description.trim() || null,
      discount_type: form.discount_type,
      discount_value: parseFloat(form.discount_value) || 0,
      min_order_value: form.min_order_value ? parseFloat(form.min_order_value) : null,
      max_discount_value: form.max_discount_value ? parseFloat(form.max_discount_value) : null,
      starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
      ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
      usage_limit: form.usage_limit ? parseInt(form.usage_limit) : null,
      active: form.active,
    };
    if (!payload.code || payload.discount_value <= 0) {
      toast({ title: 'Informe código e valor de desconto válidos', variant: 'destructive' });
      return;
    }
    try {
      setSaving(true);
      if (form.id) {
        const { error } = await supabase.from('coupons').update(payload).eq('id', form.id);
        if (error) throw error;
        toast({ title: 'Cupom atualizado!' });
      } else {
        const { error } = await supabase.from('coupons').insert(payload);
        if (error) throw error;
        toast({ title: 'Cupom criado!' });
      }
      resetForm();
      await refresh();
    } catch {
      toast({ title: 'Erro ao salvar cupom', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>{form.id ? 'Editar Cupom' : 'Novo Cupom'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={submit}>
              <div className="space-y-1">
                <Label htmlFor="code">Código</Label>
                <Input id="code" value={form.code.toUpperCase()} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="EXEMPLO10" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="description">Descrição</Label>
                <Input id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Ex.: 10% em primeira compra" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Tipo</Label>
                  <Select value={form.discount_type} onValueChange={(v: DiscountType) => setForm({ ...form, discount_type: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentual (%)</SelectItem>
                      <SelectItem value="fixed">Valor fixo (R$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="discount_value">Valor</Label>
                  <Input id="discount_value" type="number" step="0.01" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="min_order_value">Pedido mínimo</Label>
                  <Input id="min_order_value" type="number" step="0.01" value={form.min_order_value} onChange={(e) => setForm({ ...form, min_order_value: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="max_discount_value">Desconto máx.</Label>
                  <Input id="max_discount_value" type="number" step="0.01" value={form.max_discount_value} onChange={(e) => setForm({ ...form, max_discount_value: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="starts_at">Início</Label>
                  <Input id="starts_at" type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="ends_at">Fim</Label>
                  <Input id="ends_at" type="datetime-local" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="usage_limit">Limite de uso</Label>
                  <Input id="usage_limit" type="number" value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Status</Label>
                  <Select value={form.active ? 'true' : 'false'} onValueChange={(v) => setForm({ ...form, active: v === 'true' })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Ativo</SelectItem>
                      <SelectItem value="false">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={saving}>
                  {form.id ? 'Salvar alterações' : 'Criar cupom'}
                </Button>
                {form.id && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Cupons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-3">
              <Input placeholder="Buscar por código ou descrição" value={search} onChange={(e) => setSearch(e.target.value)} />
              <Button variant="outline" onClick={refresh} disabled={loading}>
                Atualizar
              </Button>
            </div>
            <div className="border border-border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Mínimo</TableHead>
                    <TableHead>Máx.</TableHead>
                    <TableHead>Janela</TableHead>
                    <TableHead>Uso</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.code}</TableCell>
                      <TableCell>{c.discount_type === 'percentage' ? '%' : 'R$'}</TableCell>
                      <TableCell>{c.discount_value}</TableCell>
                      <TableCell>{c.min_order_value ?? '-'}</TableCell>
                      <TableCell>{c.max_discount_value ?? '-'}</TableCell>
                      <TableCell className="text-sm">
                        {(c.starts_at ? new Date(c.starts_at).toLocaleString('pt-BR') : '-') + ' → ' + (c.ends_at ? new Date(c.ends_at).toLocaleString('pt-BR') : '-')}
                      </TableCell>
                      <TableCell className="text-sm">{c.usage_count}/{c.usage_limit ?? '∞'}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${c.active ? 'bg-green-100 text-green-800' : 'bg-zinc-200 text-zinc-700'}`}>
                          <Check className={`w-3 h-3 ${c.active ? 'opacity-100' : 'opacity-0'}`} />
                          {c.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => startEdit(c)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => toggleActive(c)}>
                            {c.active ? 'Desativar' : 'Ativar'}
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => deleteCoupon(c.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground py-6">
                        {loading ? 'Carregando...' : 'Nenhum cupom encontrado'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
