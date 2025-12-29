import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCategories } from '@/contexts/CategoryContext';

// Import AI-generated department images
import hardwareImg from '@/assets/departments/hardware.png';
import notebooksImg from '@/assets/departments/notebooks.png';
import monitoresImg from '@/assets/departments/monitores.png';
import placaDeVideoImg from '@/assets/departments/placa-de-video.png';
import pcGamerImg from '@/assets/departments/pc-gamer.png';
import consolesImg from '@/assets/departments/consoles.png';
import acessoriosImg from '@/assets/departments/acessorios.png';
import appleImg from '@/assets/departments/apple.png';
import processadoresImg from '@/assets/departments/processadores.png';
import memoriaRamImg from '@/assets/departments/memoria-ram.png';
import ssdHdImg from '@/assets/departments/ssd-hd.png';
import placasMaeImg from '@/assets/departments/placas-mae.png';
import fontesImg from '@/assets/departments/fontes.png';
import gabinetesImg from '@/assets/departments/gabinetes.png';
import coolersImg from '@/assets/departments/coolers.png';
import pcOfficeImg from '@/assets/departments/pc-office.png';
import licencasImg from '@/assets/departments/licencas.png';
import impressorasImg from '@/assets/departments/impressoras.png';
import iphoneImg from '@/assets/departments/iphone.png';
import ipadImg from '@/assets/departments/ipad.png';
import macbookImg from '@/assets/departments/macbook.png';
import imacImg from '@/assets/departments/imac.png';
import todosImg from '@/assets/departments/todos.png';
import workstationImg from '@/assets/departments/workstation.png';

const getCategoryImage = (slug: string): string => {
  const images: Record<string, string> = {
    'hardware': hardwareImg,
    'notebooks': notebooksImg,
    'monitores': monitoresImg,
    'placa-de-video': placaDeVideoImg,
    'pc-gamer': pcGamerImg,
    'consoles': consolesImg,
    'acessorios': acessoriosImg,
    'apple': appleImg,
    'Apple': appleImg,
    'processadores': processadoresImg,
    'memoria-ram': memoriaRamImg,
    'ssd-hd': ssdHdImg,
    'placas-mae': placasMaeImg,
    'fontes': fontesImg,
    'gabinetes': gabinetesImg,
    'coolers': coolersImg,
    'pc-office': pcOfficeImg,
    'licencas': licencasImg,
    'impressoras': impressorasImg,
    'iphone': iphoneImg,
    'ipad': ipadImg,
    'macbook': macbookImg,
    'imac': imacImg,
    'todos': todosImg,
    'todos-os-produtos': todosImg,
    'workstation': workstationImg,
  };
  
  return images[slug] || hardwareImg;
};

export function DepartmentsCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { categories } = useCategories();
  
  // Get parent categories only (main departments)
  const departments = categories
    .filter(c => !c.parent_id)
    .slice(0, 12);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (departments.length === 0) return null;

  return (
    <section className="container-balao py-8">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <LayoutGrid className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-bold text-foreground uppercase tracking-wide">
          Departamentos
        </h2>
      </div>

      {/* Carousel Container */}
      <div className="relative group">
        {/* Left Arrow */}
        <Button
          variant="outline"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/90 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1/2"
          onClick={() => scroll('left')}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        {/* Scrollable Content */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {departments.map((dept) => (
            <Link
              key={dept.id}
              to={`/categoria/${dept.slug}`}
              className="flex-shrink-0 group/item"
            >
              <div className="w-32 md:w-40 text-center">
                {/* Image */}
                <div className="bg-secondary/30 rounded-xl p-4 mb-3 aspect-square flex items-center justify-center overflow-hidden group-hover/item:bg-secondary/50 transition-colors">
                  <img
                    src={getCategoryImage(dept.slug)}
                    alt={dept.name}
                    className="w-full h-full object-contain group-hover/item:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                {/* Name */}
                <span className="text-sm font-medium text-primary uppercase tracking-wide group-hover/item:underline">
                  {dept.name}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Right Arrow */}
        <Button
          variant="outline"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/90 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity translate-x-1/2"
          onClick={() => scroll('right')}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </section>
  );
}
