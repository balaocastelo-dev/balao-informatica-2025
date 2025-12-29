import { ImageIcon } from 'lucide-react';

interface PlaceholderBannerProps {
  position: string;
  className?: string;
  aspectRatio?: string;
}

export function PlaceholderBanner({ position, className = '', aspectRatio = 'aspect-[4/1]' }: PlaceholderBannerProps) {
  return (
    <div 
      className={`bg-gradient-to-br from-muted to-muted/50 rounded-xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center ${aspectRatio} ${className}`}
    >
      <ImageIcon className="w-12 h-12 text-muted-foreground/50 mb-2" />
      <span className="text-muted-foreground font-medium text-lg">BANNER ME TROQUE</span>
      <span className="text-muted-foreground/60 text-sm mt-1">Posição: {position}</span>
    </div>
  );
}
