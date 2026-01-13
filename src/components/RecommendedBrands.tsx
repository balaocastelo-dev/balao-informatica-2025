import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ThumbsUp, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Import brand images
import corsairImg from '@/assets/brands/corsair.png';
import nvidiaImg from '@/assets/brands/nvidia.png';
import intelImg from '@/assets/brands/intel.png';
import kingstonImg from '@/assets/brands/kingston.png';
import logitechImg from '@/assets/brands/logitech.png';
import amdImg from '@/assets/brands/amd.png';
import hyperxImg from '@/assets/brands/hyperx.png';
import asusImg from '@/assets/brands/asus.png';

interface Brand {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  gradient: string;
  active: boolean;
  order_index: number;
}

const brandImages: Record<string, string> = {
  corsair: corsairImg,
  nvidia: nvidiaImg,
  intel: intelImg,
  kingston: kingstonImg,
  logitech: logitechImg,
  amd: amdImg,
  hyperx: hyperxImg,
  asus: asusImg,
};

export function RecommendedBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    const { data } = await supabase
      .from('brands')
      .select('*')
      .eq('active', true)
      .order('order_index');
    
    setBrands(data || []);
  };

  if (brands.length === 0) return null;

  return (
    <section className="container-balao py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ThumbsUp className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-foreground uppercase tracking-wide">
            Marcas Recomendadas
          </h2>
        </div>
        <Link 
          to="/categoria/todos" 
          className="text-primary text-sm font-medium hover:underline flex items-center gap-1"
        >
          VER TODAS
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Brands Grid - 4 columns like reference */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {brands.map((brand) => {
          const localImage = brandImages[brand.slug.toLowerCase()];
          const imageToUse = localImage || brand.image_url;
          
          // Special link for Intel - only processors and Arc GPUs
          const brandLink = brand.slug.toLowerCase() === 'intel' 
            ? `/busca?q=intel&categories=${encodeURIComponent('processadores,placa-de-video')}`
            : `/busca?q=${encodeURIComponent(brand.name)}`;
          
          return (
            <Link
              key={brand.id}
              to={brandLink}
              className="group block"
            >
              <div className="rounded-lg overflow-hidden border border-border hover:shadow-xl transition-all hover:border-primary/30">
                {/* Brand Card */}
                <div className={`aspect-[16/9] ${!imageToUse ? `bg-gradient-to-br ${brand.gradient}` : 'bg-gradient-to-br from-gray-900 to-black'} flex items-center justify-center relative overflow-hidden`}>
                  {imageToUse ? (
                    <img 
                      src={imageToUse} 
                      alt={brand.name} 
                      className="w-full h-full object-contain p-3" 
                    />
                  ) : (
                    <>
                      {/* Decorative elements */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-2 right-2 w-20 h-20 bg-white/20 rounded-full blur-2xl" />
                        <div className="absolute bottom-2 left-2 w-16 h-16 bg-white/10 rounded-full blur-xl" />
                      </div>
                      
                      {/* Brand Name as Logo */}
                      <div className="relative z-10 text-center px-4">
                        <span className="text-2xl md:text-3xl font-black text-white tracking-wider drop-shadow-lg">
                          {brand.name}
                        </span>
                      </div>
                    </>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20" />
                </div>
                
                {/* Brand Name & CTA */}
                <div className="p-3 text-center bg-card">
                  <h3 className="font-bold text-foreground text-sm mb-0.5">
                    {brand.name}
                  </h3>
                  <span className="text-primary text-xs font-medium flex items-center justify-center gap-1 group-hover:underline">
                    VER PRODUTOS
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
