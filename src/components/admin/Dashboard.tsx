import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProducts } from '@/contexts/ProductContext';
import { useCategories } from '@/contexts/CategoryContext';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign, 
  TrendingUp,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface Order {
  id: string;
  total: number;
  status: string;
  payment_status: string | null;
  payment_method: string | null;
  created_at: string;
  items: unknown;
  user_id: string | null;
  shipping_address: string | null;
}

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  totalVisitors: number;
  todayVisitors: number;
}

export function Dashboard() {
  const { products } = useProducts();
  const { categories } = useCategories();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    totalVisitors: 0,
    todayVisitors: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      const ordersList = (ordersData || []) as Order[];
      setOrders(ordersList);

      // Fetch visitor stats
      const { count: totalVisitors } = await supabase
        .from('visitor_logs')
        .select('*', { count: 'exact', head: true });

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { count: todayVisitors } = await supabase
        .from('visitor_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      // Calculate stats
      setStats({
        totalOrders: ordersList.length,
        pendingOrders: ordersList.filter(o => o.status === 'pending').length,
        completedOrders: ordersList.filter(o => o.status === 'completed').length,
        totalRevenue: ordersList.reduce((sum, o) => sum + Number(o.total), 0),
        totalVisitors: totalVisitors || 0,
        todayVisitors: todayVisitors || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
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

  const updateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (!error) {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'processing': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <AlertCircle className="w-4 h-4 text-orange-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      case 'processing': return 'Processando';
      default: return 'Pendente';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="admin-card">
          <Package className="w-8 h-8 text-primary mb-2" />
          <p className="text-2xl font-bold text-foreground">{products.length}</p>
          <p className="text-sm text-muted-foreground">Produtos</p>
        </div>
        <div className="admin-card">
          <ShoppingCart className="w-8 h-8 text-blue-500 mb-2" />
          <p className="text-2xl font-bold text-foreground">{stats.totalOrders}</p>
          <p className="text-sm text-muted-foreground">Pedidos</p>
        </div>
        <div className="admin-card">
          <Clock className="w-8 h-8 text-orange-500 mb-2" />
          <p className="text-2xl font-bold text-foreground">{stats.pendingOrders}</p>
          <p className="text-sm text-muted-foreground">Pendentes</p>
        </div>
        <div className="admin-card">
          <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
          <p className="text-2xl font-bold text-foreground">{stats.completedOrders}</p>
          <p className="text-sm text-muted-foreground">Concluídos</p>
        </div>
        <div className="admin-card">
          <DollarSign className="w-8 h-8 text-green-600 mb-2" />
          <p className="text-2xl font-bold text-foreground">{formatPrice(stats.totalRevenue)}</p>
          <p className="text-sm text-muted-foreground">Faturamento</p>
        </div>
        <div className="admin-card">
          <Eye className="w-8 h-8 text-purple-500 mb-2" />
          <p className="text-2xl font-bold text-foreground">{stats.todayVisitors}</p>
          <p className="text-sm text-muted-foreground">Visitantes Hoje</p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="admin-card">
        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Pedidos Recentes
        </h3>

        {orders.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Nenhum pedido encontrado</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary">
                <tr>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">ID</th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">Data</th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">Itens</th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">Total</th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">Pagamento</th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.slice(0, 20).map(order => (
                  <tr key={order.id} className="hover:bg-secondary/50">
                    <td className="p-3 font-mono text-sm">{order.id.slice(0, 8)}...</td>
                    <td className="p-3 text-sm">{formatDate(order.created_at)}</td>
                    <td className="p-3 text-sm">{Array.isArray(order.items) ? order.items.length : 0} item(s)</td>
                    <td className="p-3 font-semibold text-primary">{formatPrice(order.total)}</td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-1 rounded ${
                        order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.payment_status === 'paid' ? 'Pago' : 'Pendente'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        {getStatusIcon(order.status)}
                        <span className="text-sm">{getStatusLabel(order.status)}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="text-sm border border-border rounded px-2 py-1 bg-background"
                      >
                        <option value="pending">Pendente</option>
                        <option value="processing">Processando</option>
                        <option value="completed">Concluído</option>
                        <option value="cancelled">Cancelado</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Category Distribution */}
      <div className="admin-card">
        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Produtos por Categoria
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {categories.map(category => {
            // "todos" category should show all products
            const count = category.slug === 'todos' 
              ? products.length 
              : products.filter(p => p.category === category.slug).length;
            return (
              <div key={category.id} className="bg-secondary rounded-lg p-3">
                <p className="font-medium text-foreground">{category.name}</p>
                <p className="text-2xl font-bold text-primary">{count}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
