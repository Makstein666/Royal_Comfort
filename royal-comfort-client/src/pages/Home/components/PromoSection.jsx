import React from 'react';
import { motion } from 'framer-motion';
import { Gift, Users, ArrowRight, Sparkles } from 'lucide-react';
// 1. ИМПОРТИРУЕМ КОНТЕКСТ
import { useConfigurator } from '../../../context/ConfiguratorContext'; 

const PromoSection = () => {
  // 2. ДОСТАЕМ ФУНКЦИЮ АКТИВАЦИИ
  const { activateGift } = useConfigurator(); 

  // --- ЛОГИКА ДЛЯ ПРАВОЙ КАРТОЧКИ (ПРИГЛАСИТЬ ДРУГА) ---
  const handleInviteFriend = () => {
    const phoneNumber = "79774735760"; // Номер менеджера
    const text = "Здравствуйте! Хочу порекомендовать друга и получить бонус 5000р.";
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // --- ЛОГИКА ДЛЯ ЛЕВОЙ КАРТОЧКИ ---
  const handleGetGift = () => {
    // 3. ВЫЗЫВАЕМ ФУНКЦИЮ ВМЕСТО СКРОЛЛА
    activateGift(); 
    console.log("Подарок активирован!");
  };

  return (
    <section className="py-20 bg-[#FDFBF7] relative overflow-hidden">
      <div className="container mx-auto px-4">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* === ЛЕВАЯ КАРТОЧКА: ПОДАРОК === */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative bg-[#0A2A2A] rounded-[2.5rem] p-8 md:p-12 overflow-hidden group cursor-pointer shadow-2xl"
            onClick={handleGetGift}
          >
            {/* Эффект свечения */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#B88E2F] rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity"></div>
            
            <div className="relative z-10">
              {/* ИСПРАВЛЕНО: Явно задан цвет иконки */}
              <div className="w-14 h-14 bg-[#B88E2F] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-[#B88E2F]/20">
                <Gift size={28} strokeWidth={2} color="#0A2A2A" />
              </div>
              
              <h3 className="text-3xl font-serif font-bold text-white mb-4">
                Ваш комплимент <br/>
                <span className="text-[#B88E2F]">к первому заказу</span>
              </h3>
              
              <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                Оформите заказ до конца месяца и получите 
                <span className="text-white font-bold"> комплект премиальных масел</span> в подарок.
              </p>

              <button className="flex items-center gap-3 text-[#B88E2F] font-bold uppercase tracking-widest text-sm group-hover:gap-5 transition-all">
                Получить подарок <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>

          {/* === ПРАВАЯ КАРТОЧКА: ДРУГ === */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative bg-[#B88E2F] rounded-[2.5rem] p-8 md:p-12 overflow-hidden group cursor-pointer shadow-2xl"
            onClick={handleInviteFriend}
          >
            {/* Текстура шума */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
            
            <div className="relative z-10">
              {/* ИСПРАВЛЕНО: Явно задан цвет иконки */}
              <div className="w-14 h-14 bg-[#0A2A2A] rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                <Users size={28} strokeWidth={2} color="#B88E2F" />
              </div>
              
              <h3 className="text-3xl font-serif font-bold text-[#0A2A2A] mb-4">
                Рекомендуйте <br/>
                <span className="text-white">Royal Comfort</span>
              </h3>
              
              <p className="text-[#0A2A2A]/80 text-lg mb-8 leading-relaxed font-medium">
                Посоветуйте нас друзьям. Если они сделают заказ, мы подарим вам <br className="hidden xl:block" />
                <span className="text-[#0A2A2A] font-bold text-xl inline-block mt-1 border-b-2 border-[#0A2A2A]/20 pb-0.5">
                  Сертификат на 5&nbsp;000₽
                </span>, 
                а другу сделаем персональную скидку.
              </p>

              <button className="flex items-center gap-3 text-[#0A2A2A] font-bold uppercase tracking-widest text-sm group-hover:gap-5 transition-all">
                Написать менеджеру <ArrowRight size={18} />
              </button>
            </div>
            
            {/* Иконка блеска */}
            <div className="absolute -bottom-6 -right-6 text-[#0A2A2A]/10 transform rotate-[-15deg]">
               <Sparkles size={180} />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default PromoSection;