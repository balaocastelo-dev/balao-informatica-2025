import { useEffect, useMemo, useState } from 'react';
import { 
  listCoupons, 
  createCoupon, 
  updateCoupon, 
  deleteCoupon, 
  setCouponActive, 
  Coupon, 
  CouponDiscountType 
} from '@/services/couponService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Check, Edit, Plus, Trash2 } from 'lucide-react';

type FormState = {
  id?: string;
  code: string;
  discount_type: CouponDiscountType;
  discount_value: string;
  min_cart_value: string;
  max_uses: string;
  starts_at: string;
  expires_at: string;
  active: boolean;
};

const emptyForm: FormState = {
  code: '',
  discount_type: 'percentage',
  discount_value: '',
  min_cart_value: '',
  max_uses: '',
  starts_at: '',
  expires_at: '',
  active: true,
};

export function CouponsManagement() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const data = await listCoupons();
      setCoupons(data);
    } catch (error: any) {
      toast({ title: 'Erro ao carregar cupons', description: String(error?.message || error), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleNew = () => {
    setForm(emptyForm);
    setShowModal(true);
  };

  const handleEdit = (c: Coupon) => {
    setForm({
      id: c.id,
      code: c.code,
      discount_type: c.discount_type,
      discount_value: String(c.discount_value),
      min_cart_value: c.min_cart_value != null ? String(c.min_cart_value) : '',
      max_uses: c.max_uses != null ? String(c.max_uses) : '',
      starts_at: c.starts_at || '',
      expires_at: c.expires_at || '',
      active: c.active,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    const payload = {
      code: form.code,
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      min_cart_value: form.min_cart_value ? Number(form.min_cart_value) : null,
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      starts_at: form.starts_at || null,
      expires_at: form.expires_at || null,
      active: form.active,
    };
    try {
      if (!payload.code || !payload.discount_type || isNaN(payload.discount_value)) {
        toast({ title: 'Dados inválidos', description: 'Preencha código e valor do desconto', variant: 'destructive' });
        return;
      }
      if (form.id) {
        await updateCoupon(form.id, payload);
        toast({ title: 'Cupom atualizado' });
      } else {
        await createCoupon(payload);
        toast({ title: 'Cupom criado' });
      }
      setShowModal(false);
      await fetchCoupons();
    } catch (error: any) {
      toast({ title: 'Erro ao salvar', description: String(error?.message || error), variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCoupon(id);
      toast({ title: 'Cupom excluído' });
      await fetchCoupons();
    } catch (error: any) {
      toast({ title: 'Erro ao excluir', description: String(error?.message || error), variant: 'destructive' });
    }
  };

  const handleToggleActive = async (c: Coupon, active: boolean) => {
    try {
      await setCouponActive(c.id, active);
      await fetchCoupons();
    } catch (error: any) {
      toast({ title: 'Erro ao atualizar status', description: String(error?.message || error), variant: 'destructive' });
    }
  };

  const rows = useMemo(() => coupons, [coupons]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Cupons de Desconto</h2>
          <p className="text-muted-foreground text-sm">Gerencie códigos, regras e validade</p>
        </div>
        <Button onClick={handleNew} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Cupom
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de cupons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Desconto</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expiração</TableHead>
                  <TableHead>Usos</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">Carregando...</TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">Nenhum cupom cadastrado</TableCell>
                  </TableRow>
                ) : (
                  rows.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.code}</TableCell>
                      <TableCell>{c.discount_type === 'percentage' ? '%' : 'fixo'}</TableCell>
                      <TableCell>
                        {c.discount_type === 'percentage' ? `${Number(c.discount_value)}%` : 
                          Number(c.discount_value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch checked={c.active} onCheckedChange={(v) => handleToggleActive(c, v)} />
                          <span className={c.active ? 'text-green-600' : 'text-red-600'}>
                            {c.active ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{c.expires_at ? new Date(c.expires_at).toLocaleString('pt-BR') : '-'}</TableCell>
                      <TableCell>{`${c.used_count}${c.max_uses ? ` / ${c.max_uses}` : ''}`}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" onClick={() => handleEdit(c)} className="gap-2">
                            <Edit className="w-4 h-4" />
                            Editar
                          </Button>
                          <Button variant="ghost" onClick={() => handleDelete(c.id)} className="gap-2 text-destructive">
                            <Trash2 className="w-4 h-4" />
                            Excluir
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id ? 'Editar Cupom' : 'Novo Cupom'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Código do cupom</Label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="EXEMPLO10"
                />
              </div>
              <div>
                <Label>Tipo de desconto</Label>
                <Select
                  value={form.discount_type}
                  onValueChange={(v) => setForm({ ...form, discount_type: v as CouponDiscountType })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentual (%)</SelectItem>
                    <SelectItem value="fixed">Valor fixo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Valor do desconto</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.discount_value}
                  onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                  placeholder="10 para 10% ou 50.00 para fixo"
                />
              </div>
              <div>
                <Label>Valor mínimo do carrinho (opcional)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.min_cart_value}
                  onChange={(e) => setForm({ ...form, min_cart_value: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Data de início (opcional)</Label>
                <Input
                  type="datetime-local"
                  value={form.starts_at}
                  onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                />
              </div>
              <div>
                <Label>Data de expiração (opcional)</Label>
                <Input
                  type="datetime-local"
                  value={form.expires_at}
                  onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Limite máximo de usos (opcional)</Label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={form.max_uses}
                  onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
                  placeholder="ex.: 100"
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
                <span>Ativo</span>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button onClick={() => setShowModal(false)} variant="ghost">Cancelar</Button>
              <Button onClick={handleSave} className="gap-2">
                <Check className="w-4 h-4" />
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

