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
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  CreditCard
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import confetti from 'canvas-confetti';

import { supabase } from "@/integrations/supabase/client";
import { BlingService } from "@/services/bling";

interface CustomerData {
  name: string;
  cpf: string;
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

const STEPS = [
  { id: 'name', title: 'Nome', icon: User },
  { id: 'cpf', title: 'CPF', icon: CreditCard },
  { id: 'phone', title: 'Telefone', icon: User },
  { id: 'email', title: 'Email', icon: User },
  { id: 'cep', title: 'CEP', icon: MapPin },
  { id: 'number', title: 'Número', icon: MapPin },
  { id: 'review', title: 'Revisão', icon: CheckCircle2 },
];

export default function CartPage() {
  const { items, removeFromCart, clearCart, total } = useCart();
  const { user, profile } = useAuth();
  
  const [step, setStep] = useState(0);
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: '',
    cpf: '',
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

  const [isProcessing, setIsProcessing] = useState(false);

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
          toast({ title: 'Endereço encontrado!', description: 'Informe o número da residência.' });
          setStep(5); // Auto-advance to Number step
        } else {
          toast({ title: 'CEP não encontrado', variant: 'destructive' });
        }
      } catch (error) {
        console.error('Error fetching CEP:', error);
        toast({ title: 'Erro ao buscar CEP', variant: 'destructive' });
      } finally {
        setIsLoadingCep(false);
      }
    }
  };

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerData({ ...customerData, cpf: formatCPF(e.target.value) });
  };

  const validateStep = (currentStep: number) => {
    switch (currentStep) {
      case 0: // Name
        if (!customerData.name.trim()) return 'Nome é obrigatório';
        return null;
      case 1: // CPF
        if (!customerData.cpf.trim() || customerData.cpf.length < 11) return 'CPF inválido';
        return null;
      case 2: // Phone
        if (!customerData.phone.trim()) return 'Telefone é obrigatório';
        return null;
      case 3: // Email
        if (!customerData.email.trim()) return 'Email é obrigatório';
        return null;
      case 4: // CEP
        if (!customerData.cep.trim() || customerData.cep.replace(/\D/g, '').length !== 8) return 'CEP inválido';
        return null;
      case 5: // Number
        if (!customerData.number.trim()) return 'Número é obrigatório';
        if (!customerData.street.trim()) return 'Endereço não carregado. Verifique o CEP.';
        return null;
      default:
        return null;
    }
  };

  const nextStep = () => {
    const error = validateStep(step);
    if (error) {
      toast({ title: 'Atenção', description: error, variant: 'destructive' });
      return;
    }
    setStep(prev => Math.min(prev + 1, STEPS.length - 1));
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 0));
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

  const handleCheckout = async () => {
    const error = validateStep(step); 
    if (error) {
      toast({ title: 'Atenção', description: error, variant: 'destructive' });
      return;
    }

    setIsProcessing(true);

    try {
      const finalTotal = total;

      // 1. Create Order
      const orderPayload = {
          user_id: user?.id || null,
          status: 'pending',
          total: finalTotal,
          customer_name: customerData.name,
          customer_document: customerData.cpf,
          customer_email: customerData.email,
          customer_phone: customerData.phone,
          shipping_address: getFullAddress(),
          payment_method: 'whatsapp',
          payment_status: 'pending',
          items: items.map(i => ({
              id: i.product.id,
              name: i.product.name,
              price: i.product.price,
              quantity: i.quantity,
              image: i.product.image
          }))
      };

      let { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderPayload)
        .select()
        .single();

      // Fallback: If column missing, try without customer_document
      if (orderError && (orderError.message?.includes('customer_document') || orderError.code === '42703')) {
          console.warn("Retrying order without customer_document...");
          const { customer_document, ...fallbackPayload } = orderPayload;
          const retry = await supabase
            .from('orders')
            .insert(fallbackPayload)
            .select()
            .single();
          order = retry.data;
          orderError = retry.error;
      }

      if (orderError) throw orderError;

      // 2. Send to Bling
      if (order) {
         console.log("Syncing order to Bling:", order);
         // Ensure CPF is present for Bling even if DB rejected it
         const orderForBling = { ...order, customer_document: customerData.cpf };
         const blingResult = await BlingService.sendOrder(orderForBling);
         if (!blingResult.success) {
           console.error("Bling sync failed:", blingResult.error);
         } else {
           console.log("Bling sync success:", blingResult.data);
           toast({ title: "Pedido sincronizado com Bling!" });
         }
      }

      // 3. Animation
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      const itemsList = items.map(item => 
        `• ${item.quantity}x ${item.product.name} - ${(item.product.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
      ).join('\n');

      const subtotal = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      const finalTotalStr = finalTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

      const message = `*Novo Pedido - Balão da Informática*\n\n` +
        `*Cliente:* ${customerData.name}\n` +
        `*CPF:* ${customerData.cpf}\n` +
        `*Email:* ${customerData.email}\n` +
        `*Telefone:* ${customerData.phone}\n\n` +
        `*Endereço de Entrega:*\n${getFullAddress()}\n\n` +
        `*Itens do Pedido:*\n${itemsList}\n\n` +
        `*Resumo:*\nSubtotal: ${subtotal}${discount}\n` +
        `*Total: ${finalTotalStr}*\n\n` +
        `Gostaria de finalizar este pedido.`;

      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/5519987510267?text=${encodedMessage}`;

      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
        clearCart();
        toast({
            title: 'Redirecionando...',
            description: 'Finalize seu pedido no WhatsApp.',
        });
      }, 1500);

    } catch (err) {
      console.error("Checkout error:", err);
      toast({ title: "Erro ao processar pedido", description: "Tente novamente.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
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
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">Finalizar Compra</h1>
            
            {/* Steps Progress Bar */}
            <div className="flex items-center justify-between relative mb-8 px-2">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted -z-10 rounded-full" />
              <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-10 rounded-full transition-all duration-300" 
                style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
              />
              
              {STEPS.map((s, i) => {
                const isActive = i === step;
                const isCompleted = i < step;
                
                return (
                  <div key={s.id} className="flex flex-col items-center gap-2 bg-background px-1">
                    <div className={`
                      w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition-colors
                      ${isActive || isCompleted ? 'border-primary bg-primary text-primary-foreground' : 'border-muted bg-background text-muted-foreground'}
                    `}>
                      <s.icon className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    {/* Hide text on mobile if too many steps, or use tooltip */}
                    <span className={`hidden md:block text-xs font-medium ${isActive || isCompleted ? 'text-primary' : 'text-muted-foreground'}`}>
                      {s.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7">
              <Card className="h-full border-2 border-primary/10 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    {STEPS[step].title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 min-h-[250px] flex flex-col justify-center">
                  
                  {/* Step 0: Name */}
                  {step === 0 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                      <Label className="text-lg">Como podemos te chamar?</Label>
                      <Input 
                        value={customerData.name} 
                        onChange={e => setCustomerData({...customerData, name: e.target.value})}
                        placeholder="Nome Completo"
                        className="mt-2 text-lg h-12"
                        autoFocus
                      />
                    </div>
                  )}

                  {/* Step 1: CPF */}
                  {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                      <Label className="text-lg">Qual seu CPF? (Para emissão da NF)</Label>
                      <Input 
                        value={customerData.cpf} 
                        onChange={handleCpfChange}
                        placeholder="000.000.000-00"
                        maxLength={14}
                        className="mt-2 text-lg h-12"
                        autoFocus
                      />
                    </div>
                  )}

                  {/* Step 2: Phone */}
                  {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                      <Label className="text-lg">Qual seu WhatsApp/Telefone?</Label>
                      <Input 
                        value={customerData.phone} 
                        onChange={e => setCustomerData({...customerData, phone: e.target.value})}
                        placeholder="(00) 90000-0000"
                        className="mt-2 text-lg h-12"
                        autoFocus
                      />
                    </div>
                  )}

                  {/* Step 3: Email */}
                  {step === 3 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                      <Label className="text-lg">Qual seu melhor email?</Label>
                      <Input 
                        type="email"
                        value={customerData.email} 
                        onChange={e => setCustomerData({...customerData, email: e.target.value})}
                        placeholder="seu@email.com"
                        className="mt-2 text-lg h-12"
                        autoFocus
                      />
                    </div>
                  )}

                  {/* Step 4: CEP */}
                  {step === 4 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                      <Label className="text-lg">Qual o CEP de entrega?</Label>
                      <div className="relative mt-2">
                        <Input 
                          value={customerData.cep} 
                          onChange={handleCepChange}
                          placeholder="00000-000"
                          maxLength={9}
                          className="text-lg h-12 pr-10"
                          autoFocus
                        />
                        {isLoadingCep && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Buscaremos seu endereço automaticamente.
                      </p>
                    </div>
                  )}

                  {/* Step 5: Number & Address Details */}
                  {step === 5 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4">
                       <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="font-medium text-lg">{customerData.street}</p>
                          <p className="text-muted-foreground">{customerData.neighborhood} - {customerData.city}/{customerData.state}</p>
                          <Button variant="link" className="p-0 h-auto text-sm" onClick={() => setStep(4)}>Não é este endereço? Trocar CEP</Button>
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Número</Label>
                          <Input 
                            value={customerData.number} 
                            onChange={e => setCustomerData({...customerData, number: e.target.value})}
                            autoFocus
                            className="h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Complemento</Label>
                          <Input 
                            value={customerData.complement} 
                            onChange={e => setCustomerData({...customerData, complement: e.target.value})}
                            placeholder="Apto, Bloco..."
                            className="h-11"
                          />
                        </div>
                       </div>
                    </div>
                  )}

                  {/* Step 6: Review */}
                  {step === 6 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4">
                      <div className="rounded-lg border p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">Dados Pessoais</p>
                            <p className="text-sm text-muted-foreground">{customerData.name}</p>
                            <p className="text-sm text-muted-foreground">{customerData.cpf}</p>
                            <p className="text-sm text-muted-foreground">{customerData.phone}</p>
                            <p className="text-sm text-muted-foreground">{customerData.email}</p>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => setStep(0)}><User className="w-4 h-4" /></Button>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">Endereço de Entrega</p>
                            <p className="text-sm text-muted-foreground">{getFullAddress()}</p>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => setStep(4)}><MapPin className="w-4 h-4" /></Button>
                        </div>
                      </div>
                      
                      <div className="bg-green-50 p-4 rounded-lg border border-green-100 text-green-800">
                        <p className="font-medium flex items-center gap-2">
                          <MessageCircle className="w-4 h-4" />
                          Tudo pronto!
                        </p>
                        <p className="text-sm mt-1">
                          Ao clicar em finalizar, você será redirecionado para o WhatsApp com o pedido montado.
                        </p>
                      </div>
                    </div>
                  )}

                </CardContent>
                <CardFooter className="flex justify-between border-t pt-6">
                  <Button 
                    variant="outline" 
                    onClick={prevStep} 
                    disabled={step === 0 || isProcessing}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>
                  
                  {step === STEPS.length - 1 ? (
                    <Button 
                      className="bg-green-600 hover:bg-green-700" 
                      onClick={handleCheckout}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        <>
                          Finalizar Pedido
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button onClick={nextStep} disabled={isProcessing}>
                      Próximo
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </div>

            {/* Right Column: Cart Summary */}
            <div className="lg:col-span-5">
              <Card className="bg-muted/30 sticky top-24">
                <CardHeader>
                  <CardTitle>Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-4">
                      <div className="w-16 h-16 bg-white rounded-md overflow-hidden shrink-0 border">
                        <img 
                          src={item.product.image} 
                          alt={item.product.name} 
                          className="w-full h-full object-contain p-1"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium line-clamp-2">{item.product.name}</h4>
                        <div className="flex justify-between items-end mt-1">
                          <p className="text-sm text-muted-foreground">Qtd: {item.quantity}</p>
                          <p className="font-medium">
                            {(item.product.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <Separator />
                  
                  <div className="space-y-2 pt-4">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
