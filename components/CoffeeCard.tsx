
import React, { useEffect, useRef, useState } from 'react';
import { Star, Plus, Clock } from 'lucide-react';
import { Coffee } from '../types';

interface CoffeeCardProps {
  coffee: Coffee;
  onAddToCart: (coffee: Coffee) => void;
}

const CoffeeCard: React.FC<CoffeeCardProps> = ({ coffee, onAddToCart }) => {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={cardRef}
      className={`group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-50 flex flex-col h-full opacity-0 ${isVisible ? 'animate-zoom-in-subtle' : ''}`}
    >
      <div className="relative h-48 sm:h-64 overflow-hidden">
        <img 
          src={coffee.image} 
          alt={coffee.name}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="bg-white/90 backdrop-blur-md text-[#2C1B18] text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <Star size={12} className="text-[#D4AF37] fill-[#D4AF37]" />
            {coffee.rating}
          </span>
        </div>
        <div className="absolute bottom-4 left-4">
           <span className="bg-[#E63946]/90 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
            {coffee.category}
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-[#2C1B18] group-hover:text-[#8B4513] transition-colors">{coffee.name}</h3>
          <span className="text-lg font-bold text-[#E63946]">₹{coffee.price}</span>
        </div>
        
        <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">
          {coffee.description}
        </p>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-1 text-gray-400 text-[12px]">
            <Clock size={14} />
            <span>{coffee.prepTime}</span>
          </div>
          
          <button 
            onClick={() => onAddToCart(coffee)}
            className="bg-[#2C1B18] text-white p-3 rounded-2xl hover:bg-[#E63946] transition-all transform active:scale-90 shadow-md flex items-center justify-center gap-2 group/btn"
          >
            <Plus size={20} className="group-hover/btn:rotate-90 transition-transform" />
            <span className="hidden sm:inline font-semibold">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoffeeCard;
