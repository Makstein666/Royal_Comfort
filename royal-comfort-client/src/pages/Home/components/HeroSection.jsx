import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, PenTool } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useConfigurator } from '../../../context/ConfiguratorContext';
// useFontSize здесь больше не нужен для локального стиля, 
// так как мы масштабируем весь HTML глобально.

const HeroSection = () => {
  const navigate = useNavigate();
  const { openModal } = useConfigurator();

  return (
    <section
      className="relative w-full overflow-hidden flex items-center justify-center bg-[#0A2A2A]"
      style={{ height: '100svh', minHeight: '500px' }}
    >
      
      {/* 1. ВИДЕО-ФОН */}
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full relative">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-cover scale-[1.10]"
          >
            <source src="/general-enhanced.mp4" type="video/mp4" />
          </video>
        </div>
        
        {/* Затемнение 60% */}
        <div className="absolute inset-0 bg-black/60 z-10" />
        {/* Градиент снизу */}
        <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-black/70 to-transparent z-10" />
      </div>

      {/* 2. КОНТЕНТ */}
      <div className="relative z-20 container mx-auto px-4 text-center flex flex-col items-center justify-center h-full pb-16">
        
        {/* Бейдж */}
        <motion.span 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-[#B88E2F] font-bold tracking-[0.3em] uppercase text-[10px] md:text-xs mb-8 border border-[#B88E2F]/40 px-5 py-2 rounded-full bg-black/20 backdrop-blur-sm shadow-lg"
        >
          Premium Outdoor Living
        </motion.span>

        {/* Заголовок */}
        {/* УБРАЛ style={{ fontSize... }}. Теперь размер меняется глобально через Tailwind rem */}
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-8 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]"
        >
          Искусство отдыха <br /> 
          <span className="text-[#B88E2F] text-transparent bg-clip-text bg-gradient-to-r from-[#FFE5A0] via-[#B88E2F] to-[#FFE5A0]">
            под открытым небом
          </span>
        </motion.h1>

        {/* Подзаголовок (Крупный и читаемый) */}
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-white text-lg md:text-2xl max-w-3xl mb-12 font-medium leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
        >
          Создаем эксклюзивные банные чаны, гриль-зоны и SPA-комплексы 
          по индивидуальным проектам. Эстетика, качество и комфорт в каждой детали.
        </motion.p>

        {/* Кнопки */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col md:flex-row gap-6 w-full md:w-auto px-4"
        >
          <button 
            onClick={() => openModal()} 
            className="group relative px-10 py-5 bg-[#B88E2F] text-[#0A2A2A] font-bold text-lg rounded-xl overflow-hidden shadow-[0_0_20px_rgba(184,142,47,0.4)] hover:shadow-[0_0_40px_rgba(184,142,47,0.6)] transition-all active:scale-95 border border-[#B88E2F]"
          >
            <div className="absolute inset-0 w-full h-full bg-white/30 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
            <span className="relative flex items-center justify-center gap-3">
              <PenTool size={22} />
              Рассчитать проект
            </span>
          </button>

          <button 
            onClick={() => navigate('/catalog')}
            className="px-10 py-5 bg-black/40 border border-white/30 text-white text-lg font-medium rounded-xl hover:bg-white hover:text-[#0A2A2A] transition-all flex items-center justify-center gap-3 backdrop-blur-md active:scale-95 group shadow-lg"
          >
            Перейти в каталог
            <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform"/>
          </button>
        </motion.div>

      </div>
      
      {/* 3. СКРОЛЛ ВНИЗ */}
      <div className="absolute bottom-8 left-0 w-full flex justify-center z-30 pointer-events-none">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 10, 0] }}
            transition={{ delay: 1.5, duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-2 cursor-pointer pointer-events-auto"
          >
            <span className="text-[10px] uppercase tracking-widest text-white/90 font-bold drop-shadow-md whitespace-nowrap">Листайте вниз</span>
            <div className="w-[1px] h-12 bg-gradient-to-b from-[#B88E2F] to-transparent shadow-[0_0_10px_#B88E2F]"></div>
          </motion.div>
      </div>

    </section>
  );
};

export default HeroSection;