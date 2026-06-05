import React from 'react';
import { motion } from 'framer-motion';
import { FileSignature, Calculator, Hammer, Truck, CheckCircle2 } from 'lucide-react';

const steps = [
  {
    id: 1,
    icon: <Calculator size={32} />,
    title: "Расчет и 3D-макет",
    desc: "Мы обсуждаем детали, подбираем комплектацию и бесплатно готовим смету с визуализацией вашего проекта."
  },
  {
    id: 2,
    icon: <FileSignature size={32} />,
    title: "Официальный договор",
    desc: "Фиксируем цену, сроки и гарантии юридически. Работаем официально, прозрачная смета без скрытых платежей."
  },
  {
    id: 3,
    icon: <Hammer size={32} />,
    title: "Производство",
    desc: "Изготавливаем изделие (7-14 дней). Вы получаете фото и видео отчеты с каждого этапа производства."
  },
  {
    id: 4,
    icon: <Truck size={32} />,
    title: "Доставка и Монтаж",
    desc: "Страхуем груз, бережно доставляем и устанавливаем на вашем участке. Проводим первый запуск."
  }
];

const CooperationSteps = () => {
  return (
    <section className="py-24 bg-[#0A2A2A] text-white relative overflow-hidden">
      
      {/* Декоративная линия (золотой градиент) */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0A2A2A] via-[#B88E2F] to-[#0A2A2A]"></div>

      <div className="container mx-auto px-4 relative z-10">
        
        {/* Заголовок */}
        <div className="text-center mb-20">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[#B88E2F] font-bold text-xs uppercase tracking-[0.3em] block mb-4"
          >
            Прозрачность и надежность
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-serif font-bold"
          >
            Как мы работаем
          </motion.h2>
        </div>

        {/* Сетка шагов */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          
          {/* Соединительная линия (только на больших экранах) */}
          <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-[1px] bg-[#B88E2F]/30 -z-10"></div>

          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="relative flex flex-col items-center text-center group"
            >
              {/* Круг с иконкой */}
              <div className="w-24 h-24 rounded-full bg-[#0A2A2A] border border-[#B88E2F] flex items-center justify-center text-[#B88E2F] mb-6 shadow-[0_0_15px_rgba(184,142,47,0.1)] group-hover:bg-[#B88E2F] group-hover:text-[#0A2A2A] transition-all duration-500 relative z-10">
                {step.icon}
                
                {/* --- НОВЫЙ СТИЛЬ ЦИФРЫ --- */}
                {/* Убрали белый фон, сделали золотой текст и темный фон */}
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#0A2A2A] text-[#B88E2F] text-sm font-bold flex items-center justify-center border border-[#B88E2F] shadow-md group-hover:bg-[#FDFBF7] group-hover:text-[#0A2A2A] transition-colors">
                  {step.id}
                </div>
              </div>

              <h3 className="text-xl font-bold mb-3 text-white group-hover:text-[#B88E2F] transition-colors">
                {step.title}
              </h3>
              
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs pr-16 md:pr-0">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Итог */}
        <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
            className="mt-16 text-center"
        >
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#B88E2F]/10 border border-[#B88E2F]/30 text-[#B88E2F] text-sm font-medium">
                <CheckCircle2 size={18} />
                <span>Работаем строго по договору с гарантией сроков</span>
            </div>
        </motion.div>

      </div>
    </section>
  );
};

export default CooperationSteps;