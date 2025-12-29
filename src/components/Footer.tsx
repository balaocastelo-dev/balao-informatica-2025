import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Globe } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-foreground text-background mt-auto">
      <div className="container-balao py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <Link to="/">
              <img
                src="https://www.balao.info/media/wysiwyg/balao500.png"
                alt="Balão da Informática"
                className="h-16 w-auto object-contain brightness-0 invert mb-4"
              />
            </Link>
            <p className="text-background/80 text-sm leading-relaxed max-w-md">
              Comércio e assistência técnica em informática. Há mais de 20 anos oferecendo 
              as melhores soluções em tecnologia para você e sua empresa.
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contato</h3>
            <ul className="space-y-3 text-sm text-background/80">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  Avenida Anchieta, 789<br />
                  Cambuí — Campinas — SP
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <a href="tel:+551932551661" className="hover:text-primary transition-colors">
                  (19) 3255-1661
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <a href="mailto:balaocastelo@balaodainformatica.com.br" className="hover:text-primary transition-colors">
                  balaocastelo@balaodainformatica.com.br
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Globe className="w-4 h-4 flex-shrink-0" />
                <a href="http://www.balao.info" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                  www.balao.info
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Institucional</h3>
            <ul className="space-y-2 text-sm text-background/80">
              <li>
                <Link to="/sobre" className="hover:text-primary transition-colors">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <span className="font-medium">Razão Social:</span><br />
                CASTELO DISTRIBUIÇÃO LTDA
              </li>
              <li>
                <span className="font-medium">CNPJ:</span><br />
                34.397.947/0001-08
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/20 mt-10 pt-6 text-center text-sm text-background/60">
          <p>© {new Date().getFullYear()} Balão da Informática. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
