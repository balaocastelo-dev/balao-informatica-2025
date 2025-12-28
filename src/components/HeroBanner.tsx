import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

// Importação das imagens locais
import pcGamerBanner from "@/assets/banners/pc-gamer-promo.png";
import ofertasBanner from "@/assets/banners/ofertas-hardware.png";
import perifericosBanner from "@/assets/banners/perifericos-gamer.png";
import notebooksBanner from "@/assets/banners/notebooks-promo.png";
import nvidiaGamingBanner from "@/assets/banners/nvidia-gaming-promo.png";
import amdTechBanner from "@/assets/banners/amd-tech-promo.png";

const bannerImageMap: Record<string, string> = {
  "/src/assets/banners/pc-gamer-promo.png": pcGamerBanner,
  "/src/assets/banners/ofertas-hardware.png": ofertasBanner,
  "/src/assets/banners/perifericos-gamer.png": perifericosBanner,
  "/src/assets/banners/notebooks-promo.png": notebooksBanner,
  "/src/assets/banners/nvidia-gaming-promo.png": nvidiaGamingBanner,
  "/src/assets/banners/amd-tech-promo.png": amdTechBanner,
};

interface Banner {
  id: string;
  image_url: string;
  image_mobile_url?: string | null;
  title: string | null;
  link: string | null;
  position: string;
  active: boolean;
  order_index: number;
}

interface HeroBannerProps {
  singleBanner?: boolean;
}

export function HeroBanner({ singleBanner = false }: HeroBannerProps) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    fetchBanners();
  }, [singleBanner]);

  // Autoplay Manual
  useEffect(() => {
    if (!api) return;

    const intervalId = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0);
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [api]);

  const fetchBanners = async () => {
    let query = supabase.from("banners").select("*").eq("active", true).order("order_index");

    if (!singleBanner) {
      query = query.eq("position", "hero");
    } else {
      query = query.eq("position", "middle_page").limit(1);
    }

    const { data } = await query;
    setBanners(data || []);
  };

  const getResolvedImageUrl = (imageUrl: string) => {
    return bannerImageMap[imageUrl] || imageUrl;
  };

  // Skeleton Loading ajustado para a nova altura mobile
  if (banners.length === 0) {
    return (
      // Altura inicial maior no mobile (h-64 = 256px)
      <div className="w-full h-64 md:aspect-[21/9] bg-zinc-100 animate-pulse rounded-2xl" />
    );
  }

  return (
    <div className="relative w-full overflow-hidden shadow-sm rounded-2xl">
      <Carousel
        setApi={setApi}
        className="w-full"
        opts={{
          loop: true,
          align: "start",
        }}
      >
        <CarouselContent>
          {banners.map((banner) => (
            <CarouselItem key={banner.id} className="pl-0">
              {/* CORREÇÃO DE ALTURA DO CONTAINER:
                 - h-[250px]: Define uma altura fixa e alta para Celulares (aprox. o dobro do anterior).
                 - sm:h-[350px]: Altura para tablets.
                 - md:h-auto: A partir de notebooks/PC, volta a usar a altura automática baseada na proporção da imagem.
              */}
              <div className="relative w-full h-[250px] sm:h-[350px] md:h-auto overflow-hidden group rounded-2xl">
                {banner.link ? (
                  <Link to={banner.link} className="block w-full h-full md:h-auto">
                    <img
                      src={getResolvedImageUrl(banner.image_mobile_url || banner.image_url)}
                      alt={banner.title || "Banner Balão da Informática"}
                      className="block md:hidden w-full h-full object-fill transition-transform duration-700 group-hover:scale-[1.01]"
                      loading="eager"
                    />
                    <img
                      src={getResolvedImageUrl(banner.image_url)}
                      alt={banner.title || "Banner Balão da Informática"}
                      className="hidden md:block w-full h-auto object-contain transition-transform duration-700 group-hover:scale-[1.01]"
                      loading="eager"
                    />
                  </Link>
                ) : (
                  <>
                    <img
                      src={getResolvedImageUrl(banner.image_mobile_url || banner.image_url)}
                      alt={banner.title || "Banner Balão da Informática"}
                      className="block md:hidden w-full h-full object-fill"
                      loading="eager"
                    />
                    <img
                      src={getResolvedImageUrl(banner.image_url)}
                      alt={banner.title || "Banner Balão da Informática"}
                      className="hidden md:block w-full h-auto object-contain"
                      loading="eager"
                    />
                  </>
                )}

                {/* Sombra sutil */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none rounded-2xl" />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Setas de Navegação */}
        {!singleBanner && (
          <>
            <CarouselPrevious className="left-2 sm:left-4 h-8 w-8 sm:h-12 sm:w-12 border-none bg-black/20 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-black/50 hover:text-white group-hover:opacity-100" />
            <CarouselNext className="right-2 sm:right-4 h-8 w-8 sm:h-12 sm:w-12 border-none bg-black/20 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-black/50 hover:text-white group-hover:opacity-100" />
          </>
        )}
      </Carousel>
    </div>
  );
}
