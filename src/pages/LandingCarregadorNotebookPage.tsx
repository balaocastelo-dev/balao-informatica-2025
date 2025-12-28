import { Layout } from "@/components/Layout";
import { SEOHead, BreadcrumbSchema } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BatteryCharging, Truck, ShieldCheck, Phone, MapPin, CheckCircle2, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export default function LandingCarregadorNotebookPage() {
  const title = "Carregador de Notebook Original | Balão da Informática";
  const description =
    "Carregador de notebook original e compatível para Acer, Dell, Lenovo, HP, Asus, Samsung e mais. Entrega rápida, garantia e suporte especializado em todo o Brasil.";
  const keywords =
    "carregador notebook, fonte notebook, adaptador notebook, carregador original, carregador compatível, acer, dell, lenovo, hp, asus, samsung, positivo, vaio, apple macbook carregador, 19v, 20v, 65w, 90w, 135w, ponta fina, ponta grossa, tipo c, usb-c power delivery, assistência técnica, campinas, brasil, comprar carregador notebook, preço carregador notebook";
  const url = "https://www.balao.info/carregador-de-notebook";

  return (
    <Layout>
      <SEOHead title={title} description={description} keywords={keywords} url={url} type="article" />
      <BreadcrumbSchema
        items={[
          { name: "Início", url: "https://www.balao.info" },
          { name: "Carregador de Notebook", url },
        ]}
      />

      <div className="bg-zinc-50 min-h-screen">
        <div className="container-balao py-6">
          <div className="bg-white border rounded-xl p-4 md:p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-[#E30613] text-white p-2 rounded-lg">
                <BatteryCharging className="w-5 h-5" />
              </div>
              <h1 className="text-lg md:text-2xl font-bold">
                Carregador de Notebook Original e Compatível
              </h1>
            </div>
            <p className="text-muted-foreground mb-4">
              Encontre o carregador ideal para seu notebook com garantia e suporte especializado. Temos fontes
              originais e compatíveis para as principais marcas e modelos com despacho imediato para todo o Brasil.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link to="/busca?q=carregador%20notebook">
                <Button className="bg-[#E30613] hover:bg-[#c30511]">Buscar Carregador</Button>
              </Link>
              <Link to="/busca?q=usb-c%20power%20delivery">
                <Button variant="outline">USB-C Power Delivery</Button>
              </Link>
              <Link to="/busca?q=fonte%2065w%2090w%20135w">
                <Button variant="outline">65W | 90W | 135W</Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="container-balao grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-green-600" />
                Entrega Rápida
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Despacho em 24h com envio para todas as regiões do Brasil via transportadora e Correios.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Garantia e Segurança
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Todos os carregadores com garantia e nota fiscal. Produtos testados e homologados.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#E30613]" />
                Suporte Especializado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Auxiliamos na identificação do modelo correto (voltagem, amperagem, conector e potência).
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="container-balao py-6">
          <div className="bg-white border rounded-xl p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold mb-3">Compatibilidade por Marcas</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Acer, Dell, Lenovo, HP, Asus, Samsung, LG, Apple MacBook (USB-C PD), Vaio, Positivo, Philco,
              Multilaser, Compaq, Gateway, Toshiba, Sony, MSI, Gigabyte, Avell, Nex, Itautec.
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="bg-zinc-50 border rounded-lg p-3">
                <h3 className="font-semibold mb-2">Potências e Conectores</h3>
                <p className="text-sm">
                  45W, 65W, 90W, 120W, 135W, 180W. Conectores ponta fina, ponta grossa, retangular (Lenovo),
                  magnético, USB-C Power Delivery 20V 3.25A, 5.5x2.5mm, 4.5x3.0mm, 7.4x5.0mm, 11x4.5mm.
                </p>
              </div>
              <div className="bg-zinc-50 border rounded-lg p-3">
                <h3 className="font-semibold mb-2">Especificações Técnicas</h3>
                <p className="text-sm">
                  19V, 19.5V, 20V, 12V; 3.42A, 4.74A, 6.75A; bivolt 100-240V; cabo AC tripolar e bipolo; proteção
                  contra curto e sobrecarga; eficiência energética; certificações ABNT/INMETRO.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container-balao pb-10">
          <div className="bg-white border rounded-xl p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold mb-3">Cobertura Nacional</h2>
            <div className="grid md:grid-cols-3 gap-3">
              <div className="bg-zinc-50 border rounded-lg p-3">
                <h3 className="font-semibold mb-2">Sudeste</h3>
                <p className="text-sm">
                  São Paulo, Campinas, Ribeirão Preto, Santos, São José dos Campos, Barueri, Sorocaba; Rio de
                  Janeiro, Niterói; Belo Horizonte, Uberlândia; Vitória.
                </p>
              </div>
              <div className="bg-zinc-50 border rounded-lg p-3">
                <h3 className="font-semibold mb-2">Sul</h3>
                <p className="text-sm">
                  Curitiba, Londrina, Maringá; Porto Alegre, Caxias do Sul; Florianópolis, Joinville, Blumenau.
                </p>
              </div>
              <div className="bg-zinc-50 border rounded-lg p-3">
                <h3 className="font-semibold mb-2">Demais regiões</h3>
                <p className="text-sm">
                  Brasília, Goiânia; Salvador, Recife, Fortaleza, Natal; Manaus, Belém, Cuiabá, Campo Grande, Teresina.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Retirada imediata em Campinas (Cambuí/Castelo) e envio para todo o Brasil.
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-sm text-muted-foreground">
                Pagamento em até 12x, garantia e nota fiscal.
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Zap className="w-4 h-4 text-[#E30613]" />
              <span className="text-sm text-muted-foreground">
                Suporte por WhatsApp para identificar o modelo correto.
              </span>
            </div>
          </div>
        </div>

        <div className="container-balao pb-16">
          <div className="bg-white border rounded-xl p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold mb-3">Palavras-chave e termos de busca</h2>
            <p className="text-xs text-muted-foreground">
              Carregador notebook original, carregador notebook compatível, adaptador energia notebook, fonte notebook
              19V 3.42A, fonte 19.5V 4.74A, carregador USB-C PD 20V, tomada tripolar, ponta fina, ponta grossa,
              conector retangular Lenovo, conector magnético, Apple USB-C, Dell Latitude, Inspiron, Vostro, HP
              Pavilion, ProBook, EliteBook, Lenovo ThinkPad, IdeaPad, Acer Aspire, TravelMate, Asus VivoBook,
              Samsung Expert, Positivo, Vaio, Avell; comprar carregador notebook Brasil, preço, entrega rápida,
              garantia; campinas, são paulo, rio de janeiro, minas gerais, paraná, rio grande do sul, santa catarina,
              brasil.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

