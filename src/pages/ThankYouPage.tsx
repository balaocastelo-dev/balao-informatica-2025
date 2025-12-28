import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { SEOHead } from "@/components/SEOHead";

const ThankYouPage = () => {
  const [showConfetti, setShowConfetti] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <Layout>
      <SEOHead title="Obrigado pela compra | Balão da Informática" description="Seu pedido foi registrado com sucesso. Em instantes você receberá o e-mail de confirmação com os detalhes e a chave PIX, caso necessário." />
      <div className="container-balao py-12 text-center">
        <div className="inline-flex items-center justify-center gap-2 bg-green-100 text-green-800 rounded-full px-4 py-2 mb-4">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium">Pedido registrado com sucesso</span>
        </div>
        {showConfetti && (
          <div className="relative h-0">
            <style>{`
              @keyframes burst {
                0% { transform: translate(0,0) rotate(0deg); opacity: 1; }
                100% { transform: translate(var(--dx), var(--dy)) rotate(360deg); opacity: 0; }
              }
            `}</style>
            {[...Array(18)].map((_, i) => {
              const colors = ['#22c55e','#3b82f6','#f59e0b','#ef4444','#8b5cf6','#06b6d4'];
              const dx = (Math.random() * 180 - 90).toFixed(0) + 'px';
              const dy = (Math.random() * 120 - 20).toFixed(0) + 'px';
              const size = (Math.random() * 6 + 6).toFixed(0) + 'px';
              const left = (Math.random() * 240 + 0).toFixed(0) + 'px';
              const bg = colors[i % colors.length];
              const delay = (Math.random() * 0.15).toFixed(2) + 's';
              return (
                <span
                  key={i}
                  style={{
                    position: 'absolute',
                    top: '-10px',
                    left,
                    width: size,
                    height: size,
                    borderRadius: '50%',
                    background: bg,
                    animation: `burst 1.1s ease-out forwards`,
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

        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Obrigado!</h1>
        <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
          Seu pedido foi recebido e está em processamento. Em alguns instantes você receberá o e-mail de confirmação com os detalhes, valor e chave PIX para pagamento (se ainda não tiver concluído).
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/" className="btn-primary inline-flex">
            Continuar comprando
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link to="/pedidos">
            <Button variant="outline">Ver meus pedidos</Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default ThankYouPage;
