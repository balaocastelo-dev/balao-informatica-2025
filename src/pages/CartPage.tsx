import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus, Minus, ShoppingBag, MessageCircle, CreditCard, Loader2, User, ArrowLeft, ArrowRight, MapPin, QrCode } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const WHATSAPP_NUMBER = '5519987510267';

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

interface CustomerDataErrors {
  name?: string;
  email?: string;
  phone?: string;
  cep?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
}

const CartPage = () => {
  const { items, removeFromCart, updateQuantity, clearCart, total } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card'>('pix');
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: profile?.full_name || '',
    email: profile?.email || user?.email || '',
    phone: profile?.phone || '',
    cep: profile?.zip_code || '',
    street: profile?.address || '',
    number: '',
    complement: '',
    neighborhood: '',
    city: profile?.city || '',
    state: profile?.state || ''
  });
  const [errors, setErrors] = useState<CustomerDataErrors>({});

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CustomerData> = {};

    if (!customerData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (customerData.name.trim().length < 3) {
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
    }

    if (!customerData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!customerData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    } else if (customerData.phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = 'Telefone inválido';
    }

    if (!customerData.cep.trim() || customerData.cep.replace(/\D/g, '').length !== 8) {
      newErrors.cep = 'CEP inválido';
    }

    if (!customerData.street.trim()) {
      newErrors.street = 'Rua é obrigatória';
    }

    if (!customerData.number.trim()) {
      newErrors.number = 'Número é obrigatório';
    }

    if (!customerData.neighborhood.trim()) {
      newErrors.neighborhood = 'Bairro é obrigatório';
    }

    if (!customerData.city.trim()) {
      newErrors.city = 'Cidade é obrigatória';
    }

    if (!customerData.state.trim()) {
      newErrors.state = 'Estado é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  const formatCep = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 5) return numbers;
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCep(e.target.value);
    setCustomerData(prev => ({ ...prev, cep: formatted }));

    const cepNumbers = e.target.value.replace(/\D/g, '');
    if (cepNumbers.length === 8) {
      setIsLoadingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepNumbers}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setCustomerData(prev => ({
            ...prev,
            street: data.logradouro || '',
            neighborhood: data.bairro || '',
            city: data.localidade || '',
            state: data.uf || ''
          }));
          setErrors(prev => ({ ...prev, cep: undefined, street: undefined, neighborhood: undefined, city: undefined, state: undefined }));
          toast({ title: 'Endereço encontrado!', description: 'Complete com o número e complemento.' });
        } else {
          setErrors(prev => ({ ...prev, cep: 'CEP não encontrado' }));
        }
      } catch (error) {
        console.error('Error fetching CEP:', error);
        setErrors(prev => ({ ...prev, cep: 'Erro ao buscar CEP' }));
      } finally {
        setIsLoadingCep(false);
      }
    }
  };

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setCustomerData(prev => ({ ...prev, phone: formatted }));
  };

  const generateWhatsAppMessage = () => {
    const fullAddress = getFullAddress();
    let message = '🛒 *Orçamento - Balão da Informática*\n\n';
    
    message += `👤 *Dados do Cliente:*\n`;
    message += `Nome: ${customerData.name}\n`;
    message += `Email: ${customerData.email}\n`;
    message += `Telefone: ${customerData.phone}\n`;
    message += `Endereço: ${fullAddress}\n\n`;
    
    message += `📦 *Produtos:*\n`;
    items.forEach((item, index) => {
      message += `${index + 1}. ${item.product.name}\n`;
      message += `   Qtd: ${item.quantity} x ${formatPrice(item.product.price)}\n`;
      message += `   Subtotal: ${formatPrice(item.product.price * item.quantity)}\n\n`;
    });
    
    message += `━━━━━━━━━━━━━━━\n`;
    message += `*TOTAL: ${formatPrice(total)}*\n`;
    message += `━━━━━━━━━━━━━━━\n\n`;
    message += `Gostaria de finalizar este pedido!`;
    
    return encodeURIComponent(message);
  };

  const createOrderAndNotify = async (paymentMethod: string) => {
    if (!validateForm()) {
      toast({ title: 'Preencha todos os campos corretamente', variant: 'destructive' });
      return false;
    }

    setIsProcessing(true);
    
    try {
      // Create order items array
      const orderItems = items.map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image,
      }));

      const fullAddress = getFullAddress();

      // Insert order into database with customer data
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id || null,
          items: orderItems,
          total: total,
          payment_method: paymentMethod,
          payment_status: 'pending',
          status: 'pending',
          customer_name: customerData.name.trim(),
          customer_email: customerData.email.trim(),
          customer_phone: customerData.phone.trim(),
          customer_address: fullAddress,
          shipping_address: fullAddress,
        })
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        throw new Error('Erro ao criar pedido');
      }

      // Send email notification
      try {
        await supabase.functions.invoke('notify-order', {
          body: {
            customer_email: customerData.email.trim(),
            customer_name: customerData.name.trim(),
            customer_phone: customerData.phone.trim(),
            customer_address: fullAddress,
            order_id: order.id,
            items: orderItems,
            total: total,
            payment_method: paymentMethod,
            payment_status: 'pending',
          },
        });
      } catch (emailError) {
        console.error('Error sending notification:', emailError);
        // Don't fail the order if email fails
      }

      return order;
    } catch (error) {
      console.error('Error in createOrderAndNotify:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWhatsAppCheckout = async () => {
    const order = await createOrderAndNotify('whatsapp');
    if (!order) return;

    const message = generateWhatsAppMessage();
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
    
    clearCart();
    toast({ title: 'Pedido criado!', description: 'Redirecionando para o WhatsApp...' });
    window.location.href = whatsappUrl;
  };

  const handleOnlinePayment = async () => {
    if (!validateForm()) {
      toast({ title: 'Preencha todos os campos corretamente', variant: 'destructive' });
      return;
    }

    setIsProcessing(true);
    
    try {
      // First create the order
      const orderItems = items.map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image,
      }));

      const fullAddress = getFullAddress();

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id || null,
          items: orderItems,
          total: total,
          payment_method: paymentMethod === 'pix' ? 'pix' : 'credit_card',
          payment_status: 'pending',
          status: 'pending',
          customer_name: customerData.name.trim(),
          customer_email: customerData.email.trim(),
          customer_phone: customerData.phone.trim(),
          customer_address: fullAddress,
          shipping_address: fullAddress,
        })
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        throw new Error('Erro ao criar pedido');
      }

      // Now call Mercado Pago payment function
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke('mercadopago-payment', {
        body: {
          items: orderItems,
          customer_name: customerData.name.trim(),
          customer_email: customerData.email.trim(),
          customer_phone: customerData.phone.trim(),
          customer_address: fullAddress,
          order_id: order.id,
          payment_method: paymentMethod,
        },
      });

      if (paymentError) {
        console.error('Payment error:', paymentError);
        toast({ 
          title: 'Erro no pagamento', 
          description: 'Não foi possível processar o pagamento. Tente novamente.', 
          variant: 'destructive' 
        });
        return;
      }

      if (!paymentData?.init_point) {
        console.error('No init_point in response:', paymentData);
        toast({ 
          title: 'Erro no pagamento', 
          description: 'Resposta inválida do processador de pagamento.', 
          variant: 'destructive' 
        });
        return;
      }

      // Send email notification
      try {
        await supabase.functions.invoke('notify-order', {
          body: {
            customer_email: customerData.email.trim(),
            customer_name: customerData.name.trim(),
            customer_phone: customerData.phone.trim(),
            customer_address: fullAddress,
            order_id: order.id,
            items: orderItems,
            total: total,
            payment_method: paymentMethod,
            payment_status: 'pending',
          },
        });
      } catch (emailError) {
        console.error('Error sending notification:', emailError);
      }

      clearCart();
      toast({ 
        title: 'Pedido criado!', 
        description: 'Redirecionando para o pagamento...' 
      });
      
      // Redirect to Mercado Pago checkout
      window.location.href = paymentData.init_point;

    } catch (error) {
      console.error('Error in handleOnlinePayment:', error);
      toast({ 
        title: 'Erro', 
        description: 'Ocorreu um erro ao processar o pedido. Tente novamente.', 
        variant: 'destructive' 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container-balao py-12">
          <div className="max-w-md mx-auto text-center">
            <ShoppingBag className="w-20 h-20 mx-auto text-muted-foreground mb-6" />
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Seu carrinho está vazio
            </h1>
            <p className="text-muted-foreground mb-8">
              Adicione produtos para começar suas compras.
            </p>
            <Link to="/" className="btn-primary inline-flex">
              Ver Produtos
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  // Checkout Form View
  if (showCheckoutForm) {
    if (!user) {
      return (
        <Layout>
          <div className="container-balao py-8 sm:py-12">
            <div className="max-w-xl mx-auto bg-card border border-border rounded-2xl p-8 text-center">
              <h1 className="text-2xl font-bold text-foreground">Faça login para finalizar</h1>
              <p className="text-muted-foreground mt-2">
                Para fechar um pedido, é necessário estar logado.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                <Button onClick={() => navigate('/auth?redirect=/carrinho')} className="gap-2">
                  <User className="w-4 h-4" />
                  Entrar / Cadastrar
                </Button>
                <Button variant="secondary" onClick={() => setShowCheckoutForm(false)}>
                  Voltar ao carrinho
                </Button>
              </div>
            </div>
          </div>
        </Layout>
      );
    }

    return (
      <Layout>
        <div className="container-balao py-8 sm:py-12">
          <Button
            variant="ghost"
            onClick={() => setShowCheckoutForm(false)}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao carrinho
          </Button>

          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Customer Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Dados para Entrega
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    placeholder="Seu nome completo"
                    value={customerData.name}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                    className={errors.name ? 'border-destructive' : ''}
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={customerData.email}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
                    className={errors.email ? 'border-destructive' : ''}
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone / WhatsApp *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={customerData.phone}
                    onChange={handlePhoneChange}
                    className={errors.phone ? 'border-destructive' : ''}
                  />
                  {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cep">CEP *</Label>
                  <div className="relative">
                    <Input
                      id="cep"
                      placeholder="00000-000"
                      value={customerData.cep}
                      onChange={handleCepChange}
                      className={errors.cep ? 'border-destructive' : ''}
                      maxLength={9}
                    />
                    {isLoadingCep && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  {errors.cep && <p className="text-sm text-destructive">{errors.cep}</p>}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="street">Rua *</Label>
                    <Input
                      id="street"
                      placeholder="Nome da rua"
                      value={customerData.street}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, street: e.target.value }))}
                      className={errors.street ? 'border-destructive' : ''}
                    />
                    {errors.street && <p className="text-sm text-destructive">{errors.street}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="number">Número *</Label>
                    <Input
                      id="number"
                      placeholder="123"
                      value={customerData.number}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, number: e.target.value }))}
                      className={errors.number ? 'border-destructive' : ''}
                    />
                    {errors.number && <p className="text-sm text-destructive">{errors.number}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    placeholder="Apto, Bloco, etc. (opcional)"
                    value={customerData.complement}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, complement: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="neighborhood">Bairro *</Label>
                  <Input
                    id="neighborhood"
                    placeholder="Bairro"
                    value={customerData.neighborhood}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, neighborhood: e.target.value }))}
                    className={errors.neighborhood ? 'border-destructive' : ''}
                  />
                  {errors.neighborhood && <p className="text-sm text-destructive">{errors.neighborhood}</p>}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="city">Cidade *</Label>
                    <Input
                      id="city"
                      placeholder="Cidade"
                      value={customerData.city}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, city: e.target.value }))}
                      className={errors.city ? 'border-destructive' : ''}
                    />
                    {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">UF *</Label>
                    <Input
                      id="state"
                      placeholder="SP"
                      value={customerData.state}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, state: e.target.value.toUpperCase() }))}
                      className={errors.state ? 'border-destructive' : ''}
                      maxLength={2}
                    />
                    {errors.state && <p className="text-sm text-destructive">{errors.state}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                    {items.map(item => (
                      <div key={item.product.id} className="flex items-center gap-3 text-sm">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-12 h-12 object-contain bg-white rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium line-clamp-1">{item.product.name}</p>
                          <p className="text-muted-foreground">
                            {item.quantity}x {formatPrice(item.product.price)}
                          </p>
                        </div>
                        <p className="font-medium">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Frete</span>
                      <span>A calcular</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                      <span>Total</span>
                      <span className="text-primary">{formatPrice(total)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="text-base">Forma de Pagamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(value) => setPaymentMethod(value as 'pix' | 'credit_card')}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
                      <RadioGroupItem value="pix" id="pix" />
                      <Label htmlFor="pix" className="flex items-center gap-2 cursor-pointer flex-1">
                        <QrCode className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium">PIX</p>
                          <p className="text-xs text-muted-foreground">Pagamento instantâneo</p>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
                      <RadioGroupItem value="credit_card" id="credit_card" />
                      <Label htmlFor="credit_card" className="flex items-center gap-2 cursor-pointer flex-1">
                        <CreditCard className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium">Cartão de Crédito</p>
                          <p className="text-xs text-muted-foreground">Em até 12x sem juros</p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <Button
                  onClick={handleWhatsAppCheckout}
                  disabled={isProcessing}
                  variant="outline"
                  className="w-full gap-2"
                  size="lg"
                >
                  {isProcessing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <MessageCircle className="w-5 h-5" />
                  )}
                  Finalizar via WhatsApp
                </Button>
                
                <Button
                  onClick={handleOnlinePayment}
                  disabled={isProcessing}
                  className="w-full gap-2"
                  size="lg"
                >
                  {isProcessing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : paymentMethod === 'pix' ? (
                    <QrCode className="w-5 h-5" />
                  ) : (
                    <CreditCard className="w-5 h-5" />
                  )}
                  Pagar com {paymentMethod === 'pix' ? 'PIX' : 'Cartão'}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Seus dados estão seguros e serão usados apenas para contato e entrega.
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-balao py-8 sm:py-12">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">
          Carrinho de Compras
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <div
                key={item.product.id}
                className="flex gap-4 bg-card rounded-xl p-4 border border-border"
              >
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-24 h-24 sm:w-32 sm:h-32 object-contain bg-white rounded-lg"
                />
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground line-clamp-2 mb-2">
                    {item.product.name}
                  </h3>
                  
                  <p className="text-primary font-bold text-lg">
                    {formatPrice(item.product.price)}
                  </p>

                  <div className="flex items-center gap-4 mt-4">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 bg-secondary rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-2 hover:bg-muted rounded-l-lg transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="p-2 hover:bg-muted rounded-r-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Subtotal */}
                <div className="hidden sm:block text-right">
                  <p className="text-sm text-muted-foreground">Subtotal</p>
                  <p className="font-bold text-foreground">
                    {formatPrice(item.product.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}

            <button
              onClick={clearCart}
              className="text-muted-foreground hover:text-destructive text-sm transition-colors"
            >
              Limpar carrinho
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border border-border p-6 sticky top-32">
              <h2 className="text-xl font-bold text-foreground mb-6">
                Resumo do Pedido
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({items.length} itens)</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Frete</span>
                  <span>A calcular</span>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between text-lg font-bold text-foreground">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(total)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    ou 12x de {formatPrice(total / 12)} sem juros
                  </p>
                </div>
              </div>

              <Button
                onClick={() => {
                  if (!user) {
                    navigate('/auth?redirect=/carrinho');
                    return;
                  }
                  setShowCheckoutForm(true);
                }}
                className="w-full gap-2"
                size="lg"
                disabled={!user}
              >
                Continuar
                <ArrowRight className="w-5 h-5" />
              </Button>
              {!user && (
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Faça login para continuar.
                </p>
              )}

              <p className="text-xs text-muted-foreground text-center mt-4">
                Pagamento 100% seguro
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;
