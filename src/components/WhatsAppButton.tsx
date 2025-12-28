import { MessageCircle } from 'lucide-react';

export function WhatsAppButton() {
  const phoneNumber = '5519987510267';
  const message = encodeURIComponent('Olá! Vim pelo site da Balão da Informática e gostaria de mais informações.');
  
  const handleClick = () => {
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20BA5C] text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 animate-pulse hover:animate-none"
      aria-label="Falar no WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
    </button>
  );
}
