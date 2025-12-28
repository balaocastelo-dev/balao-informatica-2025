import { Link } from 'react-router-dom';

interface PromoBannerProps {
  imageUrl: string;
  link?: string;
  title?: string;
  fullWidth?: boolean;
}

export function PromoBanner({ imageUrl, link, title, fullWidth = true }: PromoBannerProps) {
  const content = (
    <div className="relative overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all group">
      <img
        src={imageUrl}
        alt={title || 'Banner promocional'}
        className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
      />
    </div>
  );

  const wrapper = fullWidth ? (
    <div className="container-balao my-6">
      {link ? (
        <Link to={link} className="block">
          {content}
        </Link>
      ) : content}
    </div>
  ) : (
    link ? (
      <Link to={link} className="block">
        {content}
      </Link>
    ) : content
  );

  return wrapper;
}
