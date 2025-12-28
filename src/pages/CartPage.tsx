import { useState, useEffect } from 'react';
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
import { Trash2, Plus, Minus, ShoppingBag, CreditCard, Loader2, User, ArrowLeft, ArrowRight, MapPin, QrCode, Wrench } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button as UiButton } from '@/components/ui/button';

 

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
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card'>('credit_card');
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  // PIX removido do checkout
  const [currentStep, setCurrentStep] = useState<number>(1);
  // PIX removido do checkout
  const [showConfetti, setShowConfetti] = useState(false);
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
  useEffect(() => {
    if (showCheckoutForm) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [showCheckoutForm]);

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
          toast({ title: 'Endereço encontrado!', description: 'Agora informe o número.' });
          setCurrentStep(4);
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

  const canGoNextFromStep = (step: number): boolean => {
    if (step === 1) return !!customerData.name.trim();
    if (step === 2) return !!customerData.phone.trim() && customerData.phone.replace(/\D/g, '').length >= 10;
    if (step === 3) return !!customerData.cep.trim() && customerData.cep.replace(/\D/g, '').length === 8 && !!customerData.street;
    if (step === 4) return !!customerData.number.trim();
    if (step === 5) return !!customerData.email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email);
    return true;
  };

  const nextStep = () => {
    if (!canGoNextFromStep(currentStep)) {
      toast({ title: 'Campo obrigatório', variant: 'destructive' });
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 6));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
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
        try {
          await supabase.functions.invoke('bling-sync-order', {
            body: { order_id: order.id },
          });
        } catch (_) {}
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
          payment_method: 'credit_card',
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

      const providerRaw = localStorage.getItem('payment_provider_settings');
      const provider = providerRaw ? JSON.parse(providerRaw) : { provider: 'mercadopago' };
      let fnName = 'mercadopago-payment';
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke(fnName, {
        body: {
          items: orderItems,
          customer_name: customerData.name.trim(),
          customer_email: customerData.email.trim(),
          customer_phone: customerData.phone.trim(),
          customer_address: fullAddress,
          order_id: order.id,
          payment_method: 'credit_card',
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

      // PIX removido do checkout

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
        try {
          await supabase.functions.invoke('bling-sync-order', {
            body: { order_id: order.id },
          });
        } catch (_) {}
      } catch (emailError) {
        console.error('Error sending notification:', emailError);
      }

      if (provider?.provider === 'digitalmanager') {
        if (!paymentData?.checkout_url) {
          toast({ title: 'Erro no pagamento', description: 'Checkout indisponível', variant: 'destructive' });
          return;
        }
        clearCart();
        toast({ title: 'Pedido criado!', description: 'Redirecionando para o pagamento...' });
        window.location.href = paymentData.checkout_url;
        return;
      }

      if (!paymentData?.init_point) {
        toast({ title: 'Erro no pagamento', description: 'Resposta inválida', variant: 'destructive' });
        return;
      }

      clearCart();
      toast({ title: 'Pedido criado!', description: 'Redirecionando para o pagamento...' });
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
        <div className="container-balao pt-0 pb-6">
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

    return (
      <Layout>
        <div className="container-balao pt-0 pb-6 sm:pb-8">
          <Button
            variant="ghost"
            onClick={() => setShowCheckoutForm(false)}
            className="mb-3 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao carrinho
          </Button>

          <div className="grid lg:grid-cols-2 gap-4 max-w-5xl mx-auto">
            {/* Customer Form - Etapas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Finalização em etapas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentStep === 1 && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Qual seu nome? *</Label>
                    <Input
                      id="name"
                      placeholder="Seu nome"
                      value={customerData.name}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <div className="flex gap-2">
                      <Button onClick={nextStep} className="flex-1">Continuar</Button>
                    </div>
                  </div>
                )}
                {currentStep === 2 && (
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone / WhatsApp *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(00) 00000-0000"
                      value={customerData.phone}
                      onChange={handlePhoneChange}
                    />
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={prevStep}>Voltar</Button>
                      <Button onClick={nextStep} className="flex-1">Continuar</Button>
                    </div>
                  </div>
                )}
                {currentStep === 3 && (
                  <div className="space-y-2">
                    <Label htmlFor="cep">CEP de entrega *</Label>
                    <div className="relative">
                      <Input
                        id="cep"
                        placeholder="00000-000"
                        value={customerData.cep}
                        onChange={handleCepChange}
                        maxLength={9}
                      />
                      {isLoadingCep && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={prevStep}>Voltar</Button>
                      <Button onClick={nextStep} className="flex-1">Continuar</Button>
                    </div>
                  </div>
                )}
                {currentStep === 4 && (
                  <div className="space-y-4">
                    <div className="p-3 bg-secondary/50 rounded">
                      <p className="text-sm text-muted-foreground">
                        {customerData.street && (
                          <>
                            {customerData.street}, {customerData.neighborhood} — {customerData.city}/{customerData.state}
                          </>
                        )}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="number">Número *</Label>
                      <Input
                        id="number"
                        placeholder="Número"
                        value={customerData.number}
                        onChange={(e) => setCustomerData(prev => ({ ...prev, number: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="complement">Complemento</Label>
                      <Input
                        id="complement"
                        placeholder="Apartamento, bloco, referência (opcional)"
                        value={customerData.complement}
                        onChange={(e) => setCustomerData(prev => ({ ...prev, complement: e.target.value }))}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={prevStep}>Voltar</Button>
                      <Button onClick={nextStep} className="flex-1">Continuar</Button>
                    </div>
                  </div>
                )}
                {currentStep === 5 && (
                  <div className="space-y-2">
                    <Label htmlFor="email">Email para envio do pedido *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={customerData.email}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
                    />
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={prevStep}>Voltar</Button>
                      <Button
                        onClick={() => {
                          setCurrentStep(6);
                          setShowConfetti(true);
                          setTimeout(() => setShowConfetti(false), 2000);
                        }}
                        className="flex-1"
                      >
                        Continuar
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Summary */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent>
                  {showConfetti && (
                    <div className="relative mb-3">
                      <div className="inline-block px-3 py-1 rounded bg-green-100 text-green-800 font-medium">
                        Dados coletados com sucesso
                      </div>
                      <style>{`
                        @keyframes burst {
                          0% { transform: translate(0,0) rotate(0deg); opacity: 1; }
                          100% { transform: translate(var(--dx), var(--dy)) rotate(360deg); opacity: 0; }
                        }
                      `}</style>
                      {[...Array(12)].map((_, i) => {
                        const colors = ['#22c55e','#3b82f6','#f59e0b','#ef4444','#8b5cf6','#06b6d4'];
                        const dx = (Math.random() * 120 - 60).toFixed(0) + 'px';
                        const dy = (Math.random() * 80 - 10).toFixed(0) + 'px';
                        const size = (Math.random() * 6 + 6).toFixed(0) + 'px';
                        const left = (Math.random() * 160 + 0).toFixed(0) + 'px';
                        const bg = colors[i % colors.length];
                        const delay = (Math.random() * 0.1).toFixed(2) + 's';
                        return (
                          <span
                            key={i}
                            style={{
                              position: 'absolute',
                              top: '-6px',
                              left,
                              width: size,
                              height: size,
                              borderRadius: '50%',
                              background: bg,
                              animation: `burst 0.9s ease-out forwards`,
                              animationDelay: delay,
                              transform: 'translate(0,0)',
                              // @ts-ignore
                              '--dx': dx,
                              '--dy': dy,
                            } as React.CSSProperties}
                          />
                        );
                      })}
                    </div>
                  )}
                  <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                    {items.map(item => (
                      <div key={item.product.id} className="flex items-center gap-3 text-sm">
                        {/servi[cç]o de montagem/i.test(item.product.name) ? (
                          <div className="w-12 h-12 bg-white rounded flex items-center justify-center">
                            <Wrench className="w-6 h-6 text-primary" />
                          </div>
                        ) : (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-12 h-12 object-contain bg-white rounded"
                          />
                        )}
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
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border">
                    <CreditCard className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Cartão de Crédito</p>
                      <p className="text-xs text-muted-foreground">Em até 12x sem juros (Mercado Pago)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <Button
                  onClick={handleOnlinePayment}
                  disabled={isProcessing || currentStep < 6}
                  className="w-full gap-2"
                  size="lg"
                >
                  {isProcessing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <CreditCard className="w-5 h-5" />
                  )}
                  Pagar com Cartão (Mercado Pago)
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Seus dados estão seguros e serão usados apenas para contato e entrega.
              </p>
            </div>
          </div>
        </div>
        {/* PIX removido do checkout */}
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-balao pt-0 pb-6 sm:pb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
          Carrinho de Compras
        </h1>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <div
                key={item.product.id}
                className="flex gap-4 bg-card rounded-xl p-4 border border-border"
              >
                {/servi[cç]o de montagem/i.test(item.product.name) ? (
                  <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-lg flex items-center justify-center">
                    <Wrench className="w-8 h-8 text-primary" />
                  </div>
                ) : (
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-24 h-24 sm:w-32 sm:h-32 object-contain bg-white rounded-lg"
                  />
                )}
                
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
                  setCurrentStep(1);
                  setShowCheckoutForm(true);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full gap-2"
                size="lg"
              >
                Continuar
                <ArrowRight className="w-5 h-5" />
              </Button>

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
