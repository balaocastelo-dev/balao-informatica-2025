import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { 
  Trash2, 
  ShoppingBag, 
  Loader2, 
  User, 
  MapPin, 
  MessageCircle,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { CouponInput } from '@/components/CouponInput';
import { Separator } from '@/components/ui/separator';

interface CustomerData {
  name: string;
  email: string;
  phone: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

export default function CartPage() {
  const { items, removeFromCart, clearCart, total } = useCart();
  const { user, profile } = useAuth();
  
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: '',
    email: '',
    phone: '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: ''
  });

  // Load User Profile
  useEffect(() => {
    if (profile) {
      setCustomerData(prev => ({
        ...prev,
        name: profile.full_name || '',
        email: profile.email || user?.email || '',
        phone: profile.phone || '',
        cep: profile.zip_code || '',
        street: profile.address || '',
        city: profile.city || '',
        state: profile.state || ''
      }));
    } else if (user?.email) {
      setCustomerData(prev => ({ ...prev, email: user.email! }));
    }
  }, [profile, user]);

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const formatted = value.replace(/^(\d{5})(\d)/, '$1-$2').slice(0, 9);
    
    setCustomerData(prev => ({ ...prev, cep: formatted }));

    if (value.length === 8) {
      setIsLoadingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${value}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setCustomerData(prev => ({
            ...prev,
            street: data.logradouro || '',
            neighborhood: data.bairro || '',
            city: data.localidade || '',
            state: data.uf || ''
          }));
          toast({ title: 'Endereço encontrado!', description: 'Complete com o número.' });
        }
      } catch (error) {
        console.error('Error fetching CEP:', error);
      } finally {
        setIsLoadingCep(false);
      }
    }
  };

  const validateForm = () => {
    if (!customerData.name.trim()) return 'Nome é obrigatório';
    // Basic validation, phone is important for WhatsApp contact but here we are sending TO WhatsApp.
    // Still good to have their contact in the message.
    if (!customerData.phone.trim()) return 'Telefone é obrigatório';
    if (!customerData.cep.trim() || customerData.cep.replace(/\D/g, '').length !== 8) return 'CEP inválido';
    if (!customerData.street.trim()) return 'Endereço incompleto';
    if (!customerData.number.trim()) return 'Número é obrigatório';
    if (!customerData.city.trim() || !customerData.state.trim()) return 'Cidade/Estado obrigatórios';
    return null;
  };

  const getFullAddress = () => {
    const parts = [
      customerData.street,
      customerData.number,
      customerData.complement,
      customerData.neighborhood,
      `${customerData.city} - ${customerData.state}`,
      `CEP: ${customerData.cep}`
    ].filter(Boolean);
    return parts.join(', ');
  };

  const handleCheckout = () => {
    const error = validateForm();
    if (error) {
      toast({ title: 'Atenção', description: error, variant: 'destructive' });
      return;
    }

    const itemsList = items.map(item => 
      `• ${item.quantity}x ${item.product.name} - ${(item.product.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
    ).join('\n');

    const subtotal = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const discount = couponDiscount > 0 ? `\nDesconto: - ${couponDiscount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}` : '';
    const finalTotal = Math.max(0, total - couponDiscount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const message = `*Novo Pedido - Balão da Informática*\n\n` +
      `*Cliente:* ${customerData.name}\n` +
      `*Email:* ${customerData.email}\n` +
      `*Telefone:* ${customerData.phone}\n\n` +
      `*Endereço de Entrega:*\n${getFullAddress()}\n\n` +
      `*Itens do Pedido:*\n${itemsList}\n\n` +
      `*Resumo:*\nSubtotal: ${subtotal}${discount}\n` +
      `*Total: ${finalTotal}*\n\n` +
      `Gostaria de finalizar este pedido.`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/5519987510267?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
    
    // Optional: Clear cart logic. 
    // We might want to keep it in case they come back, but standard flow is to clear.
    // Let's clear it to avoid confusion.
    clearCart();
    
    toast({
      title: 'Redirecionando...',
      description: 'Finalize seu pedido no WhatsApp.',
    });
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container-balao pt-0 pb-6 flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Seu carrinho está vazio</h1>
          <p className="text-muted-foreground mb-8 text-center max-w-md">
            Parece que você ainda não adicionou nenhum item. Explore nossa loja e encontre os melhores produtos!
          </p>
          <Link to="/" className="btn-primary px-8 py-3 rounded-full text-lg">
            Ver Produtos
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-balao pt-4 pb-12">
        <h1 className="text-3xl font-bold text-foreground mb-8">Finalizar Compra</h1>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Column: Customer Details */}
          <div className="lg:col-span-7 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Seus Dados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome Completo</Label>
                  <Input 
                    value={customerData.name} 
                    onChange={e => setCustomerData({...customerData, name: e.target.value})}
                    placeholder="Ex: João Silva"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input 
                      type="email"
                      value={customerData.email} 
                      onChange={e => setCustomerData({...customerData, email: e.target.value})}
                      placeholder="seu@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone / WhatsApp</Label>
                    <Input 
                      value={customerData.phone} 
                      onChange={e => setCustomerData({...customerData, phone: e.target.value})}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Endereço de Entrega
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>CEP</Label>
                    <div className="relative">
                      <Input 
                        value={customerData.cep} 
                        onChange={handleCepChange}
                        placeholder="00000-000"
                        maxLength={9}
                      />
                      {isLoadingCep && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Cidade</Label>
                    <Input value={customerData.city} readOnly className="bg-muted" />
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-3 space-y-2">
                    <Label>Rua</Label>
                    <Input 
                      value={customerData.street} 
                      onChange={e => setCustomerData({...customerData, street: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Número</Label>
                    <Input 
                      value={customerData.number} 
                      onChange={e => setCustomerData({...customerData, number: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Bairro</Label>
                    <Input 
                      value={customerData.neighborhood} 
                      onChange={e => setCustomerData({...customerData, neighborhood: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Complemento</Label>
                    <Input 
                      value={customerData.complement} 
                      onChange={e => setCustomerData({...customerData, complement: e.target.value})}
                      placeholder="Ex: Apto 101"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 max-h-[300px] overflow-auto pr-2">
                    {items.map(item => (
                      <div key={item.product.id} className="flex gap-3">
                        <div className="w-16 h-16 bg-white rounded-md border p-1 flex-shrink-0">
                          <img src={item.product.image} alt={item.product.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <p className="text-sm font-medium line-clamp-2">{item.product.name}</p>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 text-muted-foreground hover:text-destructive -mr-2"
                              onClick={() => removeFromCart(item.product.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-sm text-muted-foreground">Qtd: {item.quantity}</p>
                            <p className="text-sm font-semibold">
                              {(item.product.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />
                  <CouponInput onApply={setCouponDiscount} />
                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                    {couponDiscount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Desconto</span>
                        <span>- {couponDiscount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold pt-2">
                      <span>Total</span>
                      <span>{Math.max(0, total - couponDiscount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full h-12 text-lg bg-[#25D366] hover:bg-[#128C7E] text-white" 
                    onClick={handleCheckout}
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Finalizar no WhatsApp
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}