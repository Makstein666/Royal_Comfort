import React from 'react';
import { PenTool } from 'lucide-react';
import { motion } from 'framer-motion';
import { useConfigurator } from '../../../context/ConfiguratorContext';

const ConfiguratorCallout = () => {
  const { openModal } = useConfigurator();

  return (
    <section className="py-24 relative overflow-hidden bg-[#0A2A2A]">
      {/* Фон */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20" 
        style={{ backgroundImage: `url('/placeholder.jpg')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A2A2A] via-[#0A2A2A]/80 to-transparent" />

      <div className="container mx-auto px-4 md:px-8 relative z-10 text-center">
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
        >
            <span className="inline-flex items-center gap-2 border border-[#B88E2F] text-[#B88E2F] px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-6 bg-[#0A2A2A]/50 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-[#B88E2F] animate-pulse"></span>
                Индивидуальный проект
            </span>
            
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6">
                Воплотите мечту <br/>
                <span className="text-[#B88E2F]">в реальность</span>
            </h2>
            
            <p className="text-gray-400 max-w-2xl mx-auto mb-10 text-lg">
                Не ограничивайте себя стандартными решениями. Воспользуйтесь нашим конструктором, 
                чтобы выбрать материалы, размеры и опции, которые подходят именно вам.
            </p>
            
            <button 
                onClick={() => openModal()} // Вызываем без аргументов -> выбор категории
                className="px-10 py-5 bg-[#B88E2F] text-[#0A2A2A] font-bold rounded-2xl hover:bg-white hover:scale-105 transition-all shadow-[0_0_30px_rgba(184,142,47,0.4)] flex items-center gap-3 mx-auto"
            >
                <PenTool size={20} />
                Собрать конфигурацию
            </button>
            
            <p className="mt-6 text-white/30 text-xs">
                Мгновенный расчет стоимости • Без скрытых платежей
            </p>
        </motion.div>
      </div>
    </section>
  );
};

export default ConfiguratorCallout;