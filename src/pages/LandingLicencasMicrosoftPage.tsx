import { Layout } from "@/components/Layout";
import { SEOHead, BreadcrumbSchema } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeCheck, ShieldCheck, Phone, MapPin, CheckCircle2, KeyRound } from "lucide-react";
import { Link } from "react-router-dom";

export default function LandingLicencasMicrosoftPage() {
  const title = "Licenças Microsoft Originais | Windows, Office, 365 | Balão da Informática";
  const description =
    "Licenças Microsoft originais: Windows 10/11 Pro, Office 2019/2021, Microsoft 365, Exchange, SQL Server. Nota fiscal, ativação legítima e suporte para empresas em todo o Brasil.";
  const keywords =
    "licença microsoft, windows 11 pro, windows 10 pro, office 2019, office 2021, microsoft 365 business, exchange, sql server, rds cal, windows server, licença original, ativação genuína, open license, CSP, empresa, pj, compra licença, nota fiscal, suporte, brasil";
  const url = "https://www.balao.info/licencas-microsoft";

  return (
    <Layout>
      <SEOHead title={title} description={description} keywords={keywords} url={url} type="article" />
      <BreadcrumbSchema
        items={[
          { name: "Início", url: "https://www.balao.info" },
          { name: "Licenças Microsoft", url },
        ]}
      />

      <div className="bg-zinc-50 min-h-screen">
        <div className="container-balao py-6">
          <div className="bg-white border rounded-xl p-4 md:p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-[#E30613] text-white p-2 rounded-lg">
                <BadgeCheck className="w-5 h-5" />
              </div>
              <h1 className="text-lg md:text-2xl font-bold">Licenças Microsoft Originais</h1>
            </div>
            <p className="text-muted-foreground mb-4">
              Fornecemos licenças genuínas Microsoft com emissão de nota fiscal e suporte técnico. Atendimento a
              empresas, profissionais e usuários finais com ativação legítima e segurança jurídica.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link to="/busca?q=windows%2011%20pro">
                <Button className="bg-[#E30613] hover:bg-[#c30511]">Windows 11 Pro</Button>
              </Link>
              <Link to="/busca?q=office%202021%20professional">
                <Button variant="outline">Office 2021</Button>
              </Link>
              <Link to="/busca?q=microsoft%20365%20business">
                <Button variant="outline">Microsoft 365</Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="container-balao grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Ativação Genuína
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Licenças oficiais, auditáveis e com compliance. Evite riscos de pirataria e multas.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#E30613]" />
                Modelos de Licenciamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                CSP (Microsoft 365), OEM, FPP, Volume (Open License), CALs RDS/Exchange/SQL, Windows Server.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#E30613]" />
                Suporte a Empresas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Proposta formal, implantação assistida e orientação de compliance e auditoria de software.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="container-balao py-6">
          <div className="bg-white border rounded-xl p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold mb-3">Produtos Disponíveis</h2>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="bg-zinc-50 border rounded-lg p-3">
                <h3 className="font-semibold mb-2">Windows e Office</h3>
                <p className="text-sm">
                  Windows 10/11 Pro, Windows Server Standard/Datacenter, Office 2019/2021 Professional, Office LTSC.
                </p>
              </div>
              <div className="bg-zinc-50 border rounded-lg p-3">
                <h3 className="font-semibold mb-2">Microsoft 365 e CALs</h3>
                <p className="text-sm">
                  Microsoft 365 Business/Enterprise, Exchange/SQL CALs, RDS CALs, EMS, Intune, Defender for Business.
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
                  São Paulo, Campinas, Barueri, Osasco; Rio de Janeiro, Niterói; Belo Horizonte, Contagem; Vitória.
                </p>
              </div>
              <div className="bg-zinc-50 border rounded-lg p-3">
                <h3 className="font-semibold mb-2">Sul</h3>
                <p className="text-sm">
                  Curitiba, Londrina; Porto Alegre, Caxias do Sul; Florianópolis, Blumenau, Joinville.
                </p>
              </div>
              <div className="bg-zinc-50 border rounded-lg p-3">
                <h3 className="font-semibold mb-2">Demais regiões</h3>
                <p className="text-sm">
                  Brasília, Goiânia; Salvador, Recife, Fortaleza; Manaus, Belém; Cuiabá, Campo Grande, Teresina.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Atendimento nacional com emissão de nota fiscal e documentação de conformidade.
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-sm text-muted-foreground">
                Vendas para empresas (PJ), órgãos públicos e profissionais liberais.
              </span>
            </div>
          </div>
        </div>

        <div className="container-balao pb-16">
          <div className="bg-white border rounded-xl p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold mb-3">Palavras-chave e termos de busca</h2>
            <p className="text-xs text-muted-foreground">
              Licença Microsoft original, Windows 11 Pro chave, Office 2021 Professional, Microsoft 365 Business
              Standard, CSP, OEM, FPP, Open License, Volume, compliance, auditoria software, RDS CAL, Exchange CAL,
              SQL Server CAL, Windows Server Standard Datacenter, ativação genuína, nota fiscal, proposta para empresa,
              suporte técnico, brasil.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

