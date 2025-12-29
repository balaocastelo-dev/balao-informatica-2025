import { Layout } from "@/components/Layout";
import { SEOHead, BreadcrumbSchema } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BadgeCheck, 
  ShieldCheck, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  Server, 
  Cloud, 
  FileText, 
  AlertTriangle,
  Monitor,
  Briefcase
} from "lucide-react";
import { Link } from "react-router-dom";

export default function LandingLicencasMicrosoftPage() {
  const title = "Licenças Microsoft Corporativas | Windows, Office, Server | Balão da Informática";
  const description =
    "Regularize sua empresa com Licenças Microsoft Originais. Windows 11 Pro, Office 2021, Windows Server e Microsoft 365. Consultoria em licenciamento CSP, OEM e Open.";
  const keywords =
    "licença microsoft, windows 11 pro, windows 10 pro, office 2021 home business, microsoft 365 business standard, windows server 2022, sql server standard, cal de acesso, rds cal, open value, csp perpetuo, compliance microsoft, auditoria de software, regularização ti, revenda autorizada microsoft, licença fpp, licença oem, comprar licença volume, são paulo, brasil";
  const url = "https://www.balao.info/licencas-microsoft";

  return (
    <Layout>
      <SEOHead title={title} description={description} keywords={keywords} url={url} type="article" />
      <BreadcrumbSchema
        items={[
          { name: "Início", url: "https://www.balao.info" },
          { name: "Licenciamento Microsoft", url },
        ]}
      />

      <div className="bg-slate-50 min-h-screen font-sans">
        
        {/* --- HERO SECTION --- */}
        <div className="relative overflow-hidden bg-white border-b">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-100 to-white opacity-50" />
          <div className="container-balao relative py-12 md:py-20">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-sm font-medium mb-6">
                <BadgeCheck className="w-4 h-4" />
                Parceiro Microsoft Autorizado
              </div>
              
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-6">
                Licenciamento Microsoft <span className="text-[#E30613]">Original e Seguro</span> para sua Empresa
              </h1>
              
              <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-2xl">
                Evite riscos jurídicos e garanta a segurança dos seus dados. Oferecemos consultoria completa em licenciamento 
                <strong> Windows, Office, Server e Cloud</strong>. Emissão de Nota Fiscal e suporte técnico especializado.
              </p>
              

              <div className="flex flex-wrap gap-4">
                <Link to="/busca?q=windows%2011%20pro">
                  <Button size="lg" className="bg-[#E30613] hover:bg-[#c30511] text-white font-semibold shadow-md transition-all">
                    Ver Ofertas Windows
                  </Button>
                </Link>
                <Link to="/busca?q=microsoft%20365">
                  <Button size="lg" variant="outline" className="border-slate-300 hover:bg-slate-50 text-slate-700">
                    Soluções em Nuvem (365)
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* --- TRUST BADGES --- */}
        <div className="bg-white py-8 border-b">
          <div className="container-balao grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="bg-green-100 p-3 rounded-full">
                <FileText className="w-6 h-6 text-green-700" />
              </div>
              <span className="font-semibold text-slate-800">Nota Fiscal (NFe)</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="bg-blue-100 p-3 rounded-full">
                <ShieldCheck className="w-6 h-6 text-blue-700" />
              </div>
              <span className="font-semibold text-slate-800">100% Auditável</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="bg-purple-100 p-3 rounded-full">
                <BadgeCheck className="w-6 h-6 text-purple-700" />
              </div>
              <span className="font-semibold text-slate-800">Chave Genuína</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="bg-orange-100 p-3 rounded-full">
                <Phone className="w-6 h-6 text-orange-700" />
              </div>
              <span className="font-semibold text-slate-800">Suporte Técnico</span>
            </div>
          </div>
        </div>

        {/* --- MAIN PRODUCT CATEGORIES --- */}
        <div className="container-balao py-16">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Catálogo de Produtos</h2>
              <p className="text-slate-600">Selecione a categoria ideal para regularizar seu parque de máquinas.</p>
            </div>
            <Link to="/busca?q=microsoft">
              <Button variant="ghost" className="text-[#E30613] hover:text-[#c30511]">Ver todo o catálogo &rarr;</Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Windows */}
            <Card className="hover:shadow-lg transition-shadow border-t-4 border-t-blue-500">
              <CardHeader>
                <Monitor className="w-10 h-10 text-blue-600 mb-2" />
                <CardTitle>Windows Desktop</CardTitle>
                <CardDescription>Sistemas Operacionais</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-slate-600">Essencial para segurança e performance das estações de trabalho.</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Link to="/busca?q=windows%2011%20pro" className="text-xs bg-slate-100 px-2 py-1 rounded hover:bg-slate-200">Win 11 Pro</Link>
                  <Link to="/busca?q=windows%2010%20pro" className="text-xs bg-slate-100 px-2 py-1 rounded hover:bg-slate-200">Win 10 Pro</Link>
                  <span className="text-xs bg-slate-100 px-2 py-1 rounded">GGWA</span>
                </div>
              </CardContent>
            </Card>

            {/* Office */}
            <Card className="hover:shadow-lg transition-shadow border-t-4 border-t-orange-500">
              <CardHeader>
                <Briefcase className="w-10 h-10 text-orange-600 mb-2" />
                <CardTitle>Pacote Office</CardTitle>
                <CardDescription>Produtividade Perpétua</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-slate-600">Licenças vitalícias (pagamento único) para Word, Excel e PowerPoint.</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Link to="/busca?q=office%202021" className="text-xs bg-slate-100 px-2 py-1 rounded hover:bg-slate-200">Home & Business 2021</Link>
                  <Link to="/busca?q=office%20pro" className="text-xs bg-slate-100 px-2 py-1 rounded hover:bg-slate-200">Professional 2021</Link>
                </div>
              </CardContent>
            </Card>

            {/* Server */}
            <Card className="hover:shadow-lg transition-shadow border-t-4 border-t-slate-600">
              <CardHeader>
                <Server className="w-10 h-10 text-slate-700 mb-2" />
                <CardTitle>Infraestrutura</CardTitle>
                <CardDescription>Servers e Banco de Dados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                

[Image of server rack data center]

                <p className="text-sm text-slate-600">Soluções robustas para data centers e redes corporativas.</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Link to="/busca?q=windows%20server" className="text-xs bg-slate-100 px-2 py-1 rounded hover:bg-slate-200">Win Server 2022</Link>
                  <Link to="/busca?q=sql%20server" className="text-xs bg-slate-100 px-2 py-1 rounded hover:bg-slate-200">SQL Server</Link>
                  <span className="text-xs bg-slate-100 px-2 py-1 rounded">CALs RDS</span>
                </div>
              </CardContent>
            </Card>

            {/* Cloud */}
            <Card className="hover:shadow-lg transition-shadow border-t-4 border-t-sky-500">
              <CardHeader>
                <Cloud className="w-10 h-10 text-sky-600 mb-2" />
                <CardTitle>Microsoft 365</CardTitle>
                <CardDescription>Nuvem e Colaboração</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-slate-600">Assinaturas flexíveis com Teams, Exchange Online e OneDrive.</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Link to="/busca?q=microsoft%20365%20business" className="text-xs bg-slate-100 px-2 py-1 rounded hover:bg-slate-200">Business Standard</Link>
                  <Link to="/busca?q=exchange%20online" className="text-xs bg-slate-100 px-2 py-1 rounded hover:bg-slate-200">Exchange</Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* --- WHY ORIGINAL SECTION (SEO RICH) --- */}
        <div className="bg-slate-100 py-16">
          <div className="container-balao">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-block bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold mb-4">
                  Compliance e Segurança
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">
                  Por que sua empresa não pode usar software pirata?
                </h2>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-slate-800">Risco de Multas Pesadas</h4>
                      <p className="text-sm text-slate-600">
                        Em uma auditoria de software, a falta de comprovação de licenciamento (Nota Fiscal e Chave) 
                        pode acarretar multas de até 3.000 vezes o valor do software.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <ShieldCheck className="w-6 h-6 text-blue-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-slate-800">Segurança de Dados</h4>
                      <p className="text-sm text-slate-600">
                        Ativadores ilegais (cracks) frequentemente contêm malwares que expõem dados bancários e 
                        informações sigilosas da sua empresa a ataques de ransomware.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-slate-800">Modelos de Licenciamento Flexíveis</h4>
                      <p className="text-sm text-slate-600">
                        Trabalhamos com <strong>ESD</strong> (Download Eletrônico), <strong>OEM</strong> (Para máquinas novas), 
                        <strong>FPP</strong> (Caixa) e contratos de volume <strong>CSP/Open License</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
                <h3 className="text-xl font-bold mb-4 border-b pb-2">Dúvidas Frequentes</h3>
                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium text-slate-900 text-sm">O que é licença OEM vs FPP?</h5>
                    <p className="text-xs text-slate-500 mt-1">
                      OEM morre com a máquina (não transferível). FPP pode ser transferida para outro PC se você desinstalar do antigo.
                    </p>
                  </div>
                  <div>
                    <h5 className="font-medium text-slate-900 text-sm">Enviam Nota Fiscal para PJ?</h5>
                    <p className="text-xs text-slate-500 mt-1">
                      Sim, todas as vendas acompanham NFe com os dados da sua empresa, válida para auditorias Microsoft.
                    </p>
                  </div>
                  <div>
                    <h5 className="font-medium text-slate-900 text-sm">O que são CALs de acesso?</h5>
                    <p className="text-xs text-slate-500 mt-1">
                      São licenças (Client Access License) necessárias para que usuários ou dispositivos acessem um servidor Windows Server ou SQL Server legalmente.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- REGIONS (SEO LOCAL) --- */}
        <div className="container-balao py-16">
          <div className="bg-[#E30613] text-white rounded-2xl p-8 md:p-12 text-center md:text-left relative overflow-hidden">
             {/* Decorative circle */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Atendimento Nacional Especializado</h2>
                <p className="text-white/90 mb-6">
                  Não importa onde sua empresa está, o Balão da Informática entrega licenciamento digital imediato 
                  e hardware com logística eficiente.
                </p>
                <div className="flex flex-wrap gap-2 text-sm font-medium text-white/80">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> São Paulo</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Rio de Janeiro</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Minas Gerais</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Brasília</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Curitiba</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Porto Alegre</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Nordeste</span>
                </div>
              </div>
              <div className="flex justify-center md:justify-end">
                <Link to="/fale-conosco">
                  <Button className="bg-white text-[#E30613] hover:bg-slate-100 font-bold text-lg px-8 py-6 h-auto">
                    Solicitar Orçamento PJ
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* --- FOOTER SEO TEXT (Discreet) --- */}
        <div className="container-balao pb-12">
          <p className="text-[10px] text-slate-400 text-center leading-relaxed max-w-4xl mx-auto">
            A Balão da Informática é revenda de softwares originais. Comercializamos Windows 11 Home e Pro, Windows 10, Office Home & Business 2019 e 2021, 
            Project, Visio, Windows Server Standard e Datacenter 2019/2022, SQL Server, CALs de acesso de usuário e dispositivo (User/Device CAL), 
            RDS CAL (Remote Desktop Services). Atendemos licitações, órgãos públicos e empresas de todos os portes com faturamento e condições especiais. 
            Regularize seu software e evite pirataria. Imagens meramente ilustrativas. Microsoft é uma marca registrada.
          </p>
        </div>
      </div>
    </Layout>
  );
}
