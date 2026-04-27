import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, PenTool, Factory, Gem, Truck, Award } from 'lucide-react';

const advantages = [
  { 
    id: 1, 
    title: 'Собственное производство', 
    desc: 'Полный цикл работ без посредников. Мы контролируем каждый этап: от первого чертежа до финальной полировки.', 
    icon: <Factory size={32} /> 
  },
  { 
    id: 2, 
    title: 'Премиальные материалы', 
    desc: 'Используем только алтайский кедр камерной сушки и пищевую нержавеющую сталь AISI 304/316.', 
    icon: <Gem size={32} /> 
  },
  { 
    id: 3, 
    title: 'Индивидуальный подход', 
    desc: 'Не просто продаем, а создаем. Каждое изделие может быть изменено под ваши уникальные требования.', 
    icon: <PenTool size={32} /> 
  },
  { 
    id: 4, 
    title: 'Гарантия и Сервис', 
    desc: 'Официальная гарантия до 5 лет. Постгарантийное обслуживание и выезд мастера.', 
    icon: <ShieldCheck size={32} /> 
  },
];

const BrandAdvantages = () => {
  return (
    <section className="py-24 bg-[#FDFBF7] relative overflow-hidden">
      
      {/* Декоративный фон (узор) */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#0A2A2A 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
      </div>

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        
        {/* Заголовок секции */}
        <div className="text-center mb-16">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[#B88E2F] font-bold text-xs uppercase tracking-[0.3em] block mb-3"
          >
            Почему выбирают нас
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-4xl font-serif font-bold text-[#0A2A2A]"
          >
            Стандарты качества <br /> Royal Comfort
          </motion.h2>
        </div>

        {/* Сетка преимуществ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {advantages.map((adv, index) => (
            <motion.div
              key={adv.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
              className="group p-8 bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl hover:border-[#B88E2F]/30 transition-all duration-300 flex flex-col items-center text-center"
            >
              {/* Иконка в круге */}
              <div className="w-16 h-16 rounded-full bg-[#FDFBF7] border border-[#B88E2F]/20 flex items-center justify-center text-[#B88E2F] mb-6 group-hover:scale-110 group-hover:bg-[#B88E2F] group-hover:text-white transition-all duration-300">
                {adv.icon}
              </div>
              
              <h3 className="text-xl font-serif font-bold text-[#0A2A2A] mb-3 group-hover:text-[#B88E2F] transition-colors">
                {adv.title}
              </h3>
              
              <p className="text-gray-500 text-sm leading-relaxed">
                {adv.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandAdvantages;