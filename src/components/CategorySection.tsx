import { Link } from 'react-router-dom';
import { useCategories } from '@/contexts/CategoryContext';
import { ChevronRight } from 'lucide-react';

// Auto-generate emoji based on category name
const getCategoryEmoji = (name: string, slug: string): string => {
  const nameLower = name.toLowerCase();
  const slugLower = slug.toLowerCase();
  
  // Match by common keywords
  if (nameLower.includes('hardware') || slugLower.includes('hardware')) return '🔧';
  if (nameLower.includes('monitor')) return '🖥️';
  if (nameLower.includes('licen')) return '📜';
  if (nameLower.includes('placa') || nameLower.includes('video') || nameLower.includes('gpu')) return '🎮';
  if (nameLower.includes('notebook') || nameLower.includes('laptop')) return '💻';
  if (nameLower.includes('console') || nameLower.includes('playstation') || nameLower.includes('xbox')) return '🎯';
  if (nameLower.includes('office') || nameLower.includes('escritório')) return '🏢';
  if (nameLower.includes('gamer') || nameLower.includes('gaming')) return '⚡';
  if (nameLower.includes('câmera') || nameLower.includes('camera') || nameLower.includes('foto')) return '📷';
  if (nameLower.includes('acessório') || nameLower.includes('acessorio')) return '🎧';
  if (nameLower.includes('teclado') || nameLower.includes('keyboard')) return '⌨️';
  if (nameLower.includes('mouse')) return '🖱️';
  if (nameLower.includes('fone') || nameLower.includes('headset') || nameLower.includes('audio')) return '🎧';
  if (nameLower.includes('rede') || nameLower.includes('network') || nameLower.includes('wifi')) return '📡';
  if (nameLower.includes('armazenamento') || nameLower.includes('ssd') || nameLower.includes('hd')) return '💾';
  if (nameLower.includes('memória') || nameLower.includes('memoria') || nameLower.includes('ram')) return '🧠';
  if (nameLower.includes('processador') || nameLower.includes('cpu')) return '⚙️';
  if (nameLower.includes('fonte') || nameLower.includes('power')) return '🔌';
  if (nameLower.includes('gabinete') || nameLower.includes('case')) return '🖥️';
  if (nameLower.includes('cooler') || nameLower.includes('refrigeração')) return '❄️';
  if (nameLower.includes('cabo') || nameLower.includes('cable')) return '🔗';
  if (nameLower.includes('impressora') || nameLower.includes('printer')) return '🖨️';
  if (nameLower.includes('celular') || nameLower.includes('smartphone') || nameLower.includes('phone')) return '📱';
  if (nameLower.includes('tablet')) return '📱';
  if (nameLower.includes('tv') || nameLower.includes('televisão')) return '📺';
  if (nameLower.includes('drone')) return '🚁';
  if (nameLower.includes('segurança') || nameLower.includes('security')) return '🔒';
  if (nameLower.includes('software') || nameLower.includes('programa')) return '💿';
  if (nameLower.includes('cadeira') || nameLower.includes('chair')) return '🪑';
  if (nameLower.includes('mesa') || nameLower.includes('desk')) return '🪑';
  if (nameLower.includes('pilha') || nameLower.includes('bateria') || nameLower.includes('battery')) return '🔋';
  if (nameLower.includes('cartão') || nameLower.includes('cartao') || nameLower.includes('sd')) return '💳';
  
  // Default emoji for unknown categories
  return '📦';
};

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
              {getCategoryEmoji(category.name, category.slug)}
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
