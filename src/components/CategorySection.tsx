import { Link } from 'react-router-dom';
import { useCategories } from '@/contexts/CategoryContext';
import { ChevronRight } from 'lucide-react';
import { getCategoryEmoji } from '@/utils/categoryEmojis';

export function CategorySection() {
  const { categories } = useCategories();

  return (
    <section className="py-8 sm:py-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
          Categorias
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {categories.map((category, index) => (
          <Link
            key={category.id}
            to={`/categoria/${category.slug}`}
            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-secondary to-muted p-4 sm:p-6 hover:shadow-lg"
          >
            <span className="text-3xl sm:text-4xl mb-3 block">
              {getCategoryEmoji(category.name, category.slug, category.emoji)}
            </span>
            <h3 className="font-semibold text-foreground text-sm sm:text-base">
              {category.name}
            </h3>
            <ChevronRight className="absolute bottom-4 right-4 w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100" />
          </Link>
        ))}
      </div>
    </section>
  );
}
