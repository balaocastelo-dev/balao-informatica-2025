import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  id: string;
  status: string;
  total: number;
  items: OrderItem[];
  shipping_address: string | null;
  payment_method: string | null;
  payment_status: string | null;
  transaction_id: string | null;
  created_at: string;
}

const statusConfig: Record<string, { label: string; icon: React.ElementType; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pendente', icon: Clock, variant: 'secondary' },
  processing: { label: 'Processando', icon: Package, variant: 'default' },
  shipped: { label: 'Enviado', icon: Truck, variant: 'default' },
  delivered: { label: 'Entregue', icon: CheckCircle, variant: 'default' },
  cancelled: { label: 'Cancelado', icon: XCircle, variant: 'destructive' }
};

export default function OrdersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      // Parse items from JSONB
      const parsedOrders = data.map(order => ({
        ...order,
        items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items
      })) as Order[];
      setOrders(parsedOrders);
    }
    setIsLoading(false);
  };

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-balao py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">Meus Pedidos</h1>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Nenhum pedido encontrado</h2>
              <p className="text-muted-foreground mb-4">
                Você ainda não fez nenhum pedido. Que tal começar a comprar?
              </p>
              <button
                onClick={() => navigate('/')}
                className="btn-primary"
              >
                Ver Produtos
              </button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const status = statusConfig[order.status] || statusConfig.pending;
              const StatusIcon = status.icon;

              return (
                <Card key={order.id}>
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <CardTitle className="text-lg">
                          Pedido #{order.id.slice(0, 8).toUpperCase()}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(order.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                      <Badge variant={status.variant} className="gap-1 w-fit">
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 object-contain rounded bg-secondary"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Qtd: {item.quantity} × R$ {item.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="text-sm text-muted-foreground">
                        {order.payment_method && (
                          <span>Pagamento: {order.payment_method}</span>
                        )}
                        {order.transaction_id && (
                          <span className="ml-2">• ID: {order.transaction_id}</span>
                        )}
                      </div>
                      <p className="text-lg font-bold text-primary">
                        Total: R$ {order.total.toFixed(2)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
