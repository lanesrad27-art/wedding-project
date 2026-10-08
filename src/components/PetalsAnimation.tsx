import React, { useMemo } from 'react';

/**
 * Floating white rose petals and warm romantic golden particles
 */
export const PetalsAnimation: React.FC = () => {
  const petals = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => ({
      id: i,
      left: `${(i * 7 + 4) % 94}%`,
      animationDuration: `${7 + (i % 6) * 1.8}s`,
      animationDelay: `${(i % 7) * 0.9}s`,
      size: 10 + (i % 4) * 4,
      rotation: (i * 47) % 360,
      opacity: 0.35 + (i % 3) * 0.15,
    }));
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-20">
      {petals.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: p.left,
            top: '-30px',
            animation: `floatingPetal ${p.animationDuration} cubic-bezier(0.4, 0, 0.2, 1) infinite`,
            animationDelay: p.animationDelay,
            opacity: p.opacity,
          }}
        >
          {/* Stylized organic petal SVG */}
          <svg
            width={p.size}
            height={p.size * 1.3}
            viewBox="0 0 24 32"
            fill="none"
            style={{
              transform: `rotate(${p.rotation}deg)`,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
            }}
          >
            <path
              d="M12 0C18 6 24 14 24 22C24 27.5 18.5 32 12 32C5.5 32 0 27.5 0 22C0 14 6 6 12 0Z"
              fill="#FFF9F0"
              fillOpacity="0.85"
            />
          </svg>
        </div>
      ))}
      <style>{`
        @keyframes floatingPetal {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 0;
          }
          15% {
            opacity: 0.6;
          }
          50% {
            transform: translateY(50vh) translateX(25px) rotate(180deg);
            opacity: 0.7;
          }
          85% {
            opacity: 0.5;
          }
          100% {
            transform: translateY(105vh) translateX(-20px) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
