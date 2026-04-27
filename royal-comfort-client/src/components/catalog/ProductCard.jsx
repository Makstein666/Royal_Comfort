import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles, ChevronRight, Info } from "lucide-react";
import { useConfigurator } from "../../context/ConfiguratorContext";

const ProductCard = ({ product, onQuickOrder, onShowDetails }) => {
  // ЗАЩИТА: Если продукт не передан, ничего не рендерим (это спасет от белого экрана)
  if (!product) return null;

  const { categories } = useConfigurator();

  // Безопасный поиск категории
  const categoryObj = categories?.find(c => c.id === product.categoryId);
  const categoryName = categoryObj ? categoryObj.name : 'Коллекция';
  
  const handleDetailsClick = (e) => {
      e.stopPropagation();
      if (onShowDetails) onShowDetails(product);
  };

  const handleOrderClick = (e) => {
      e.stopPropagation();
      if (onQuickOrder) {
          onQuickOrder(product.categoryId, product.defaultConfig, product);
      }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      className="group relative bg-[#FDFBF7] rounded-[2rem] overflow-hidden shadow-[0_10px_30px_-10px_rgba(184,142,47,0.2)] hover:shadow-[0_25px_60px_-15px_rgba(184,142,47,0.3)] transition-all duration-500 flex flex-col h-full border border-[#B88E2F]/30 hover:border-[#B88E2F]/60 hover:-translate-y-2"
    >
      <div className="relative h-[340px] overflow-hidden bg-[#F5F1E6] cursor-pointer relative" onClick={handleDetailsClick}>
        <div className="absolute inset-0 border-b border-[#B88E2F]/20 z-20 pointer-events-none"></div>
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#0A2A2A]/30 to-transparent z-10" />

        <div
          className="w-full h-full bg-cover bg-center transform group-hover:scale-110 transition-transform duration-1000 ease-out"
          style={{ backgroundImage: `url(${product.image})` }}
        />
        
        <div className="absolute inset-0 bg-[#0A2A2A]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 backdrop-blur-[3px]" />
        
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-8 group-hover:translate-y-0 scale-90 group-hover:scale-100 z-30">
             <button
                onClick={handleDetailsClick}
                className="w-16 h-16 bg-gradient-to-br from-[#B88E2F] to-[#D4AF37] rounded-full flex items-center justify-center text-[#0A2A2A] shadow-[0_0_20px_rgba(184,142,47,0.5)] hover:scale-105 transition-all duration-300 border-2 border-white/20"
             >
                 <ArrowUpRight size={28} strokeWidth={1.5} />
             </button>
        </div>
      </div>

      <div className="p-8 flex-grow flex flex-col relative">
        <div className="mb-4">
             <span className="text-[10px] text-[#B88E2F] font-bold uppercase tracking-[0.25em] border border-[#B88E2F]/40 px-4 py-1.5 rounded-full bg-[#B88E2F]/5">
                {categoryName}
            </span>
        </div>

        <h3 className="text-3xl font-serif font-medium text-[#0A2A2A] mb-4 leading-snug cursor-pointer group-hover:text-[#B88E2F] transition-colors duration-300 drop-shadow-sm" onClick={handleDetailsClick}>
          {product.name}
        </h3>

        <div className="w-16 h-[2px] bg-gradient-to-r from-[#B88E2F]/50 to-transparent mb-6"></div>

        <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-8 font-light tracking-wide">
            {product.description}
        </p>

        <div className="mt-auto flex items-end justify-between gap-4 pt-6 border-t border-[#B88E2F]/10">
          <div className="flex flex-col">
            <span className="text-[9px] text-gray-400 uppercase tracking-widest mb-1 font-medium flex items-center gap-1">
                <Info size={10} className="text-[#B88E2F]" /> Ориентировочно
            </span>
            <span className="text-xl font-serif font-bold text-[#0A2A2A]">
              от {product.price.toLocaleString()} ₽
            </span>
            <span className="text-[8px] text-gray-400 mt-1 leading-tight max-w-[100px]">
                *Точный расчет у менеджера
            </span>
          </div>

          <button
            onClick={handleOrderClick}
            className="group/btn relative overflow-hidden px-6 py-4 rounded-xl bg-[#0A2A2A] text-white font-bold text-[10px] tracking-widest uppercase hover:bg-gradient-to-r hover:from-[#B88E2F] hover:to-[#D4AF37] hover:text-[#0A2A2A] transition-all duration-300 shadow-lg hover:shadow-[0_10px_20px_-5px_rgba(184,142,47,0.5)] flex items-center gap-2"
          >
            <span className="relative z-10">Рассчитать</span>
            <ChevronRight size={14} className="relative z-10 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;