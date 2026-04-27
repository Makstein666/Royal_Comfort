import React from "react";
import { ArrowUpRight } from "lucide-react";

const CategoryCard = ({ category, onClick, isComingSoon }) => {
  return (
    <div 
        onClick={() => !isComingSoon && onClick(category.id)}
        className={`group relative h-[320px] rounded-[2rem] overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-2
        ${isComingSoon ? 'opacity-80 cursor-not-allowed grayscale' : 'shadow-lg hover:shadow-[0_20px_40px_-15px_rgba(184,142,47,0.3)]'}
        `}
    >
        {/* Картинка с зумом */}
        <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[1.5s] group-hover:scale-110" 
            style={{ backgroundImage: `url(${category.image})` }} 
        />
        
        {/* Градиент (чтобы текст читался) */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#051F1F] via-[#051F1F]/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
        
        {/* Рамка при наведении */}
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#B88E2F]/50 rounded-[2rem] transition-colors duration-500 pointer-events-none"></div>

        {/* Контент */}
        <div className="absolute inset-0 p-8 flex flex-col justify-end items-start">
            
            {/* Верхний бейдж (если скоро) */}
            {isComingSoon && (
                <div className="absolute top-6 right-6 bg-white/10 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest rounded-full border border-white/20">
                    Скоро
                </div>
            )}

            {/* Заголовок */}
            <h3 className="text-3xl font-serif font-medium text-white mb-2 leading-tight group-hover:text-[#B88E2F] transition-colors duration-300">
                {category.name}
            </h3>
            
            {/* Декоративная линия */}
            <div className="w-12 h-[2px] bg-[#B88E2F] mb-4 origin-left transition-all duration-300 group-hover:w-full opacity-70"></div>

            {/* Нижняя строка */}
            <div className="flex justify-between items-center w-full">
                <span className="text-gray-300 text-xs font-medium uppercase tracking-widest opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 delay-75">
                    Перейти в каталог
                </span>
                
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-[#B88E2F] group-hover:text-[#051F1F] transition-all duration-300">
                    <ArrowUpRight size={18} />
                </div>
            </div>
        </div>
    </div>
  );
};

export default CategoryCard;