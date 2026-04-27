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
    title: "Монтаж под ключ",
    text: "Наши специалисты установят и подключат оборудование за 1 день. Проведем первый тестовый запуск и научим пользоваться.",
    delay: 0.2
  },
  {
    id: 3,
    icon: <ShieldCheck size={32} />,
    title: "Честная гарантия",
    text: "5 лет гарантии на сварные швы и герметичность чаши. 12 месяцев на деревянные элементы и дополнительное оборудование.",
    delay: 0.3
  },
  {
    id: 4,
    icon: <Leaf size={32} />,
    title: "Экологичность",
    text: "Используем только натуральный Алтайский кедр и экологически чистые пропитки на водной основе. Никакой химии.",
    delay: 0.4
  }
];

// --- КОМПОНЕНТ СТАТИСТИКИ (GLASSMORPHISM) ---
const GlassStatCard = ({ number, text, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: delay, duration: 0.8, ease: "easeOut" }}
        className="relative overflow-hidden rounded-2xl p-8 group"
    >
        {/* Фон карточки: Матовое стекло */}
        <div className="absolute inset-0 bg-white/5 backdrop-blur-md border border-white/10 transition-all duration-500 group-hover:bg-white/10 group-hover:border-[#B88E2F]/50"></div>
        
        {/* Блик при наведении */}
        <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-0 group-hover:animate-shine" />

        <div className="relative z-10 flex flex-col items-center text-center">
            <h3 className="text-6xl md:text-7xl font-serif font-bold text-[#B88E2F] mb-4 drop-shadow-xl">
                {number}
            </h3>
            <div className="h-0.5 w-16 bg-[#B88E2F]/60 mb-4 transition-all duration-500 group-hover:w-24 group-hover:bg-[#B88E2F]"></div>
            <p className="text-sm md:text-base uppercase tracking-[0.2em] text-gray-200 font-medium group-hover:text-white transition-colors">
                {text}
            </p>
        </div>
    </motion.div>
);

const FeaturesGrid = () => {
  return (
    <section className="bg-[#0A2A2A] text-white overflow-hidden">
      
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
      {/* Высокий блок с фотореалистичным фоном */}
      <div className="relative w-full h-[600px] md:h-[500px] flex items-center justify-center overflow-hidden mt-10">
         
         {/* ФОНОВОЕ ИЗОБРАЖЕНИЕ (Заглушка - замени src на фото реального чана) */}
         <motion.div 
            className="absolute inset-0 z-0"
            initial={{ scale: 1.1 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 10, ease: "linear" }} // Медленный зум (Cinematic effect)
         >
            {/* Я поставил качественное фото атмосферной спа-зоны. Сюда лучше всего встанет твое лучшее фото чана */}
            <img 
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1920&auto=format&fit=crop" 
                alt="Atmosphere" 
                className="w-full h-full object-cover opacity-60"
            />
            {/* Градиент поверх фото, чтобы текст читался */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A2A2A] via-[#0A2A2A]/80 to-[#0A2A2A]/40"></div>
         </motion.div>

         {/* Контент поверх фото */}
         <div className="container mx-auto px-4 relative z-10 w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16">
                
                <GlassStatCard 
                    number="500+" 
                    text="Реализованных проектов" 
                    delay={0.2} 
                />

                <GlassStatCard 
                    number="10 лет" 
                    text="Опыта производства" 
                    delay={0.4} 
                />

                <GlassStatCard 
                    number="100%" 
                    text="Довольных клиентов" 
                    delay={0.6} 
                />

            </div>
         </div>
         
         {/* Декоративная линия снизу */}
         <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#B88E2F]/50 to-transparent"></div>
      </div>

    </section>
  );
};

export default FeaturesGrid;