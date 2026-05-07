import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import CategoryCard from '../../../components/catalog/CategoryCard';

import { ArrowLeft, ArrowRight, MoveRight, Loader2 } from 'lucide-react';
import { useConfigurator } from '../../../context/ConfiguratorContext';

import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Mousewheel, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';

/**
 * CategorySection — карусель категорий на главной.
 * Модал вынесен наружу (в Home.jsx) во избежание z-index конфликтов
 * с дочерними stacking context секциями.
 * 
 * @param {function} onCategoryClick — вызывается при клике: (category) => void
 */
const CategorySection = ({ onCategoryClick }) => {
  const swiperRef = useRef(null);
  const navigate = useNavigate();
  
  const { categories, isLoading } = useConfigurator();
  
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const sortedCategories = useMemo(() => {
    if (!categories || categories.length === 0) return [];
    const filtered = categories.filter(c => c.id !== 'custom');
    const main = filtered.find(c => c.id === 'tub');
    const others = filtered.filter(c => c.id !== 'tub');
    return main ? [main, ...others] : filtered;
  }, [categories]);

  const handleCategoryClick = (id) => {
    const cat = categories.find(c => c.id === id);
    if (!cat) return;

    if (cat.isActive) {
      navigate(`/catalog?categories=${id}`);
      window.scrollTo(0, 0);
    } else {
      // Передаём категорию наверх — Home.jsx откроет модал
      onCategoryClick && onCategoryClick(cat);
    }
  };

  if (isLoading) {
    return (
      <div className="py-32 flex justify-center items-center">
        <Loader2 className="animate-spin text-[#B88E2F]" size={48} />
      </div>
    );
  }

  return (
    <section className="py-20 bg-white group">
       
       <div className="container mx-auto px-4 md:px-8 mb-10 text-center">
          <span className="text-[#B88E2F] font-bold text-xs uppercase tracking-[0.3em] block mb-3">
            Наши коллекции
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#0A2A2A]">
            Каталог продукции
          </h2>
       </div>

       <div className="relative container mx-auto px-4 md:px-8">
         
         <Swiper
           onSwiper={(swiper) => {
               swiperRef.current = swiper;
               setIsBeginning(swiper.isBeginning);
               setIsEnd(swiper.isEnd);
           }}
           onSlideChange={(swiper) => {
             setIsBeginning(swiper.isBeginning);
             setIsEnd(swiper.isEnd);
           }}
           modules={[FreeMode, Mousewheel, Navigation]}
           freeMode={true}
           mousewheel={{ forceToAxis: true }}
           className="!overflow-visible py-4"
           breakpoints={{
             320: { slidesPerView: 1.15, spaceBetween: 16 },
             640: { slidesPerView: 2.2, spaceBetween: 20 },
             1024: { slidesPerView: 3.2, spaceBetween: 30 }
           }}
         >
           {sortedCategories.map((category) => (
             <SwiperSlide key={category.id} style={{ height: 'auto' }}>
               <CategoryCard 
                 category={category} 
                 isFeatured={category.id === 'tub'} 
                 onClick={handleCategoryClick}
                 isComingSoon={!category.isActive}
               />
             </SwiperSlide>
           ))}
         </Swiper>

         <div className="pointer-events-none absolute inset-0 flex items-center justify-between z-20 px-2 lg:-mx-16 top-0">
            <div className="pointer-events-auto">
               <NavButton direction="left" onClick={() => swiperRef.current?.slidePrev()} disabled={isBeginning} />
            </div>
            <div className="pointer-events-auto">
               <NavButton direction="right" onClick={() => swiperRef.current?.slideNext()} disabled={isEnd} />
            </div>
         </div>

         <div className="flex md:hidden justify-center items-center gap-3 mt-8 pointer-events-none opacity-80">
            <span className="text-[#B88E2F] font-bold text-[10px] uppercase tracking-[0.3em] animate-pulse">
                Листайте
            </span>
            <motion.div 
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
                <MoveRight size={18} className="text-[#B88E2F]" />
            </motion.div>
         </div>

       </div>
    </section>
  );
};

const NavButton = ({ direction, onClick, disabled }) => {
    return (
        <AnimatePresence>
            {!disabled && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClick}
                    className={`
                        w-12 h-12 md:w-14 md:h-14 rounded-full 
                        bg-[#0A2A2A] text-[#B88E2F] 
                        flex items-center justify-center 
                        shadow-xl cursor-pointer 
                        hover:bg-[#B88E2F] hover:text-[#0A2A2A] 
                        transition-colors duration-300 border border-[#B88E2F]/20
                    `}
                >
                    {direction === 'left' ? <ArrowLeft size={24} /> : <ArrowRight size={24} />}
                </motion.button>
            )}
        </AnimatePresence>
    );
};

export default CategorySection;