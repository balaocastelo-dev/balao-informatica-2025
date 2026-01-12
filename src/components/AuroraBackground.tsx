import { useEffect, useState } from 'react';

export function AuroraBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 z-[-10] overflow-hidden pointer-events-none select-none bg-background">
      {/* Primary Blob (Balão Red) */}
      <div 
        className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-blob"
        style={{
          transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
        }}
      />
      
      {/* Secondary Blob (Purple/Blue for Gamer vibe) */}
      <div 
        className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000"
        style={{
          transform: `translate(${mousePosition.x * -0.02}px, ${mousePosition.y * 0.02}px)`,
        }}
      />
      
      {/* Third Blob (Orange/Accent) */}
      <div 
        className="absolute -bottom-32 left-1/3 w-[500px] h-[500px] bg-orange-500/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-4000"
        style={{
          transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * -0.02}px)`,
        }}
      />

      {/* Grid Overlay (Optional, keeping it very subtle for texture) */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02] dark:opacity-[0.05]" />
    </div>
  );
}
