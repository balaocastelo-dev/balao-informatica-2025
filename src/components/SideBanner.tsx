import { Link } from 'react-router-dom';

interface SideBannerProps {
  imageUrl: string;
  link?: string;
  title?: string;
  className?: string;
}

export function SideBanner({ imageUrl, link, title, className = '' }: SideBannerProps) {
  const content = (
    <div className={`relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow ${className}`}>
      <img
        src={imageUrl}
        alt={title || 'Banner'}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
    </div>
  );

  if (link) {
    return (
      <Link to={link} className="block hover:scale-[1.02] transition-transform">
        {content}
      </Link>
    );
  }

  return content;
}
