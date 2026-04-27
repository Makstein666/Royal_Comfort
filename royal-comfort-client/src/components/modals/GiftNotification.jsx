import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Check } from 'lucide-react';
import { useConfigurator } from '../../context/ConfiguratorContext';

const GiftNotification = () => {
  const { isGiftModalOpen, activeGift } = useConfigurator();

  return (
    <AnimatePresence>
      {isGiftModalOpen && activeGift && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: 50, x: "-50%" }}
          className="fixed bottom-8 left-1/2 z-[10000] flex items-center gap-4 bg-[#0A2A2A] text-white px-6 py-4 rounded-2xl shadow-2xl border border-[#B88E2F] min-w-[320px]"
        >
          {/* Иконка подарка в круге */}
          <div className="w-12 h-12 bg-[#B88E2F] rounded-full flex items-center justify-center text-[#0A2A2A] shrink-0 shadow-lg relative">
            <Gift size={24} strokeWidth={2} />
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center border-2 border-[#0A2A2A]">
               <Check size={12} className="text-green-600" strokeWidth={4} />
            </div>
          </div>

          <div>
            <h4 className="font-serif font-bold text-[#B88E2F] leading-none mb-1">Подарок активирован!</h4>
            <p className="text-xs text-gray-300">
              {activeGift.name} добавлен в конфигуратор.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GiftNotification;