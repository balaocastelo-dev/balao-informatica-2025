import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Package, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  Truck,
  Eye
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  id: string;
  created_at: string;
  updated_at: string;
  status: string;
  total: number;
  items: OrderItem[];
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  shipping_address: string | null;
  payment_method: string | null;
  payment_status: string | null;
  transaction_id: string | null;
  user_id: string | null;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  processing: 'Processando',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};

const paymentStatusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
};

const paymentStatusLabels: Record<string, string> = {
  pending: 'Pendente',
  paid: 'Pago',
  failed: 'Falhou',
  refunded: 'Reembolsado',
};

export function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Erro ao carregar pedidos',
        description: error.message,
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }
    
    setOrders((data || []).map(order => ({
      ...order,
      items: Array.isArray(order.items) ? (order.items as unknown as OrderItem[]) : []
    })));
    setLoading(false);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      toast({
        title: 'Erro ao atualizar status',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Status atualizado',
        description: `Pedido atualizado para ${statusLabels[newStatus]}`,
      });
      fetchOrders();
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gerenciamento de Pedidos</h2>
          <p className="text-muted-foreground">{orders.length} pedido(s) no total</p>
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="processing">Processando</SelectItem>
            <SelectItem value="shipped">Enviado</SelectItem>
            <SelectItem value="delivered">Entregue</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Nenhum pedido encontrado</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Order Info */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-sm text-muted-foreground">
                      #{order.id.slice(0, 8)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                    {order.payment_status && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${paymentStatusColors[order.payment_status] || 'bg-gray-100 text-gray-800'}`}>
                        {paymentStatusLabels[order.payment_status] || order.payment_status}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(order.created_at)}
                    </span>
                    {order.customer_name && (
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {order.customer_name}
                      </span>
                    )}
                    {order.payment_method && (
                      <span className="flex items-center gap-1">
                        <CreditCard className="w-4 h-4" />
                        {order.payment_method}
                      </span>
                    )}
                  </div>

                  <div className="font-bold text-lg text-primary">
                    {formatPrice(order.total)}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Select
                    value={order.status}
                    onValueChange={(value) => updateOrderStatus(order.id, value)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="processing">Processando</SelectItem>
                      <SelectItem value="shipped">Enviado</SelectItem>
                      <SelectItem value="delivered">Entregue</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                    title="Ver detalhes"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Detalhes do Pedido #{selectedOrder?.id.slice(0, 8)}
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${statusColors[selectedOrder.status]}`}>
                  {statusLabels[selectedOrder.status]}
                </span>
                {selectedOrder.payment_status && (
                  <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${paymentStatusColors[selectedOrder.payment_status]}`}>
                    Pagamento: {paymentStatusLabels[selectedOrder.payment_status]}
                  </span>
                )}
              </div>

              {/* Customer Info */}
              <div className="bg-secondary/50 rounded-xl p-4 space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Informações do Cliente
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  {selectedOrder.customer_name && (
                    <div>
                      <span className="text-muted-foreground">Nome:</span>
                      <p className="font-medium">{selectedOrder.customer_name}</p>
                    </div>
                  )}
                  {selectedOrder.customer_email && (
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedOrder.customer_email}</span>
                    </div>
                  )}
                  {selectedOrder.customer_phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedOrder.customer_phone}</span>
                    </div>
                  )}
                  {selectedOrder.customer_address && (
                    <div className="col-span-full flex items-start gap-1">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <span>{selectedOrder.customer_address}</span>
                    </div>
                  )}
                  {selectedOrder.shipping_address && selectedOrder.shipping_address !== selectedOrder.customer_address && (
                    <div className="col-span-full flex items-start gap-1">
                      <Truck className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <span>Entrega: {selectedOrder.shipping_address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-secondary/50 rounded-xl p-4 space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Informações de Pagamento
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  {selectedOrder.payment_method && (
                    <div>
                      <span className="text-muted-foreground">Método:</span>
                      <p className="font-medium">{selectedOrder.payment_method}</p>
                    </div>
                  )}
                  {selectedOrder.transaction_id && (
                    <div>
                      <span className="text-muted-foreground">ID da Transação:</span>
                      <p className="font-mono text-xs">{selectedOrder.transaction_id}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Itens do Pedido</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 bg-secondary/30 rounded-lg p-3"
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Qtd: {item.quantity} x {formatPrice(item.price)}
                        </p>
                      </div>
                      <div className="font-semibold text-primary">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-border pt-4 flex justify-between items-center">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(selectedOrder.total)}
                </span>
              </div>

              {/* Timestamps */}
              <div className="text-xs text-muted-foreground flex justify-between">
                <span>Criado: {formatDate(selectedOrder.created_at)}</span>
                <span>Atualizado: {formatDate(selectedOrder.updated_at)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
