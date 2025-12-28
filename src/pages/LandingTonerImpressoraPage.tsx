import { Layout } from "@/components/Layout";
import { SEOHead, BreadcrumbSchema } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Printer, Truck, ShieldCheck, Phone, MapPin, CheckCircle2, Package } from "lucide-react";
import { Link } from "react-router-dom";

export default function LandingTonerImpressoraPage() {
  const title = "Toner para Impressora | Original e Compatível | Balão da Informática";
  const description =
    "Toner original e compatível para HP, Brother, Samsung, Canon, Lexmark e mais. Alto rendimento, garantia, pronta entrega e envio para todo o Brasil.";
  const keywords =
    "toner, cartucho toner, toner hp, toner brother, toner samsung, toner canon, toner lexmark, compatível, original, alto rendimento, 12A, 35A, 85A, 78A, 83A, 1052, 106, 111, 104, 121, 122, 128, cartucho laser, impressora laser, comprar toner brasil, preço toner, envio rápido, garantia";
  const url = "https://www.balao.info/toner-para-impressora";

  return (
    <Layout>
      <SEOHead title={title} description={description} keywords={keywords} url={url} type="article" />
      <BreadcrumbSchema
        items={[
          { name: "Início", url: "https://www.balao.info" },
          { name: "Toner para Impressora", url },
        ]}
      />

      <div className="bg-zinc-50 min-h-screen">
        <div className="container-balao py-6">
          <div className="bg-white border rounded-xl p-4 md:p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-[#E30613] text-white p-2 rounded-lg">
                <Printer className="w-5 h-5" />
              </div>
              <h1 className="text-lg md:text-2xl font-bold">Toner para Impressora: Original e Compatível</h1>
            </div>
            <p className="text-muted-foreground mb-4">
              Toners originais e compatíveis com alto rendimento e qualidade profissional para impressoras laser.
              Entrega rápida, garantia e suporte para empresas e consumidores em todo o Brasil.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link to="/busca?q=toner">
                <Button className="bg-[#E30613] hover:bg-[#c30511]">Buscar Toner</Button>
              </Link>
              <Link to="/busca?q=toner%20hp%2085a%2078a%2083a%2012a">
                <Button variant="outline">HP 12A | 85A | 78A | 83A</Button>
              </Link>
              <Link to="/busca?q=toner%20brother%20tn%20360%20tn%20450">
                <Button variant="outline">Brother TN360 | TN450</Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="container-balao grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#E30613]" />
                Pronta Entrega
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Linhas mais usadas com estoque contínuo e reposição rápida para empresas e escritórios.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-green-600" />
                Envio Nacional
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Envio para todas as capitais e principais cidades. Fretes competitivos e rastreio.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Qualidade Garantida
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Toners com padrão ISO, alto rendimento e cobertura uniforme. Nota fiscal e garantia.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="container-balao py-6">
          <div className="bg-white border rounded-xl p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold mb-3">Marcas e Modelos Atendidos</h2>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="bg-zinc-50 border rounded-lg p-3">
                <h3 className="font-semibold mb-2">HP e Brother</h3>
                <p className="text-sm">
                  HP 12A, 35A, 78A, 83A, 85A, 80A, 44A, 79A; Brother TN-360, TN-450, TN-660, TN-750, DR-360, DR-450.
                </p>
              </div>
              <div className="bg-zinc-50 border rounded-lg p-3">
                <h3 className="font-semibold mb-2">Canon, Samsung, Lexmark</h3>
                <p className="text-sm">
                  Canon 128, 137, 045; Samsung 104, 1052, 106, 111; Lexmark T640, E260, E460, MX310, MX410.
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
                  São Paulo, Campinas, Santo André, São Bernardo, Osasco; Rio de Janeiro, Niterói; Belo Horizonte,
                  Contagem; Vitória.
                </p>
              </div>
              <div className="bg-zinc-50 border rounded-lg p-3">
                <h3 className="font-semibold mb-2">Sul</h3>
                <p className="text-sm">
                  Porto Alegre, Canoas, Novo Hamburgo; Curitiba, Londrina; Florianópolis, Joinville, Blumenau.
                </p>
              </div>
              <div className="bg-zinc-50 border rounded-lg p-3">
                <h3 className="font-semibold mb-2">Norte, Nordeste e Centro-Oeste</h3>
                <p className="text-sm">
                  Brasília, Goiânia; Salvador, Recife, Fortaleza; Manaus, Belém; Cuiabá, Campo Grande, Teresina.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Retirada em Campinas e envio para todo o Brasil com nota e garantia.
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-sm text-muted-foreground">Atendimento a empresas, condomínios e órgãos públicos.</span>
            </div>
          </div>
        </div>

        <div className="container-balao pb-16">
          <div className="bg-white border rounded-xl p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold mb-3">Palavras-chave e termos de busca</h2>
            <p className="text-xs text-muted-foreground">
              Toner HP 12A 85A 78A 83A 44A, toner Brother TN360 TN450 TN660 TN750, cartucho laser compatível, toner
              original, alto rendimento, rendimento ISO, cobertura uniforme, impressão nítida, preto, colorido, CMYK,
              toner samsung 104 1052 106 111, canon 128 137 045, lexmark e260 e460 mx310 mx410; comprar toner Brasil,
              preço, pronta entrega, frete, garantia, campinas, são paulo, rio de janeiro, minas gerais, paraná, rio
              grande do sul, santa catarina, brasil.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

