import React from 'react';
import { motion } from 'framer-motion';
import { Truck, ShieldCheck, Hammer, Leaf } from 'lucide-react';

const features = [
  {
    id: 1,
    icon: <Truck size={32} />,
    title: "Бережная доставка",
    text: "Доставляем изделия по всей России собственным транспортом или проверенными транспортными компаниями. Страховка груза включена.",
    delay: 0.1
  },
  {
    id: 2,
    icon: <Hammer size={32} />,
    title: "Легкий монтаж",
    text: "Продуманная конструкция позволяет выполнить легкий монтаж всего за 10 минут. Никаких сложных работ.",
    delay: 0.2
  },
  {
    id: 3,
    icon: <ShieldCheck size={32} />,
    title: "Честная гарантия",
    text: "До 12 лет гарантии на сварные швы и герметичность чаши. 12 месяцев на деревянные элементы и дополнительное оборудование.",
    delay: 0.3
  },
  {
    id: 4,
    icon: <Leaf size={32} />,
    title: "Экологичность",
    text: "Используем только натуральную Лиственницу класса А (без сучков) и экологически чистые пропитки на водной основе. Никакой химии.",
    delay: 0.4
  }
];

// --- КОМПОНЕНТ СТАТИСТИКИ (PREMIUM REDESIGN) ---
const GlassStatCard = ({ number, text, delay }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 40 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: delay, duration: 0.8, ease: "easeOut" }}
        className="relative group p-[1px] rounded-[2rem] overflow-hidden shadow-2xl"
    >
        {/* Анимированная рамка (светящийся градиент) */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#B88E2F]/10 via-[#B88E2F]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        {/* Внутренний фон */}
        <div className="relative h-full w-full bg-gradient-to-b from-[#0f2e2e]/90 to-[#051F1F]/90 rounded-[31px] p-10 flex flex-col items-center justify-center overflow-hidden z-10 backdrop-blur-2xl border border-white/10 group-hover:border-[#B88E2F]/30 transition-all duration-500">
            
            {/* Шум/текстура для премиальности */}
            <div className="absolute inset-0 opacity-10 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none"></div>
            
            {/* Блик */}
            <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-[0.03] group-hover:animate-shine pointer-events-none" />
            
            {/* Декоративный круг свечения на фоне */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-[#B88E2F] rounded-full blur-[80px] opacity-10 group-hover:opacity-30 group-hover:scale-150 transition-all duration-700 pointer-events-none"></div>

            <h3 className="relative z-20 text-6xl md:text-7xl font-serif font-medium text-transparent bg-clip-text bg-gradient-to-r from-white via-[#FFE5A0] to-[#B88E2F] pb-2 mb-2 drop-shadow-[0_10px_20px_rgba(184,142,47,0.3)]">
                {number}
            </h3>
            
            {/* Разделитель с точкой */}
            <div className="relative z-20 flex items-center gap-4 mb-5 w-full justify-center">
                <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#B88E2F]/50"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#B88E2F] shadow-[0_0_10px_#B88E2F] group-hover:scale-150 transition-transform duration-500"></div>
                <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#B88E2F]/50"></div>
            </div>
            
            <p className="relative z-20 text-xs md:text-sm uppercase tracking-[0.3em] text-gray-400 font-bold group-hover:text-white transition-colors duration-500 max-w-[200px] text-center">
                {text}
            </p>
        </div>
    </motion.div>
);

const FeaturesGrid = () => {
  return (
    <section className="relative bg-[#0A2A2A] text-white overflow-hidden">
      
      {/* ФОНОВОЕ ИЗОБРАЖЕНИЕ С ЧЕРНО-БЕЛЫМ ФИЛЬТРОМ И МЯГКИМ ЗУМОМ НА ВЕСЬ БЛОК */}
      <motion.div 
         className="absolute inset-0 z-0 pointer-events-none"
         initial={{ scale: 1.05 }}
         whileInView={{ scale: 1 }}
         transition={{ duration: 15, ease: "linear" }}
      >
         <img 
             src="/placeholder.jpg" 
             alt="Atmosphere" 
             className="w-full h-full object-cover opacity-20 grayscale mix-blend-luminosity"
         />
         {/* Глубокий градиент для создания атмосферы премиальности */}
         <div className="absolute inset-0 bg-gradient-to-t from-[#0A2A2A] via-[#0A2A2A]/80 to-[#0A2A2A]"></div>
         <div className="absolute inset-0 bg-gradient-to-r from-[#051F1F] via-transparent to-[#051F1F] opacity-80"></div>
      </motion.div>

      {/* 1. БЛОК ПРЕИМУЩЕСТВ (Сверху) */}
      <div className="py-24 container mx-auto px-4 relative z-10">
        <div className="text-center mb-20">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[#B88E2F] font-bold text-xs uppercase tracking-[0.3em] block mb-4"
          >
            Сервис и качество
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-serif font-bold text-white"
          >
            Мы заботимся о вас <br/>
            <span className="text-gray-500">на каждом этапе</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: item.delay, duration: 0.5 }}
              className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-all duration-300 group"
            >
              <div className="w-14 h-14 bg-[#B88E2F]/10 rounded-xl flex items-center justify-center text-[#B88E2F] mb-6 group-hover:bg-[#B88E2F] group-hover:text-[#0A2A2A] transition-colors duration-300">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-white group-hover:text-[#B88E2F] transition-colors">
                {item.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {item.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 2. CINEMATIC БЛОК СТАТИСТИКИ (Снизу) */}
      <div className="relative w-full py-28 md:py-36 flex items-center justify-center overflow-hidden">

         {/* Контент поверх фото */}
         <div className="container mx-auto px-4 relative z-10 w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 max-w-5xl mx-auto">
                <GlassStatCard number="1000+" text="Реализованных проектов" delay={0.1} />
                <GlassStatCard number="10 лет" text="Опыта производства" delay={0.3} />
                <GlassStatCard number="100%" text="Довольных клиентов" delay={0.5} />
            </div>
         </div>
         
         {/* Декоративная линия снизу с градиентом */}
         <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#B88E2F]/50 to-transparent"></div>
         {/* Декоративная линия сверху с градиентом */}
         <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#B88E2F]/20 to-transparent"></div>
      </div>

    </section>
  );
};

export default FeaturesGrid;